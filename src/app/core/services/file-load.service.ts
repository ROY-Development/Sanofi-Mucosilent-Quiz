import {Injectable, signal} from '@angular/core';
import {UtilTimeout} from '../../shared/utils/util-timeout';

@Injectable({
	providedIn: 'root'
})
export class FileLoadService
{
	public signalIsLoading = signal<boolean>(false);
	
	private _loadingCount: number = 0;
	
	public async downloadFilesWithProgress(
		loadObjs: Array<{ name: string, url: string }>,
		onProgress: (progressLoaded: number, progressTotal: number, progressPercentage: number) => void
	): Promise<Array<{ name: string, blob: Blob }>>
	{
		this.updateIsLoading(1);
		const progress: { loaded: number, total: number } = {loaded: 0, total: 0};
		
		const promises: Array<Promise<{ name: string, blob: Blob }>> =
			loadObjs.map(async (loadObj: { name: string, url: string }): Promise<{ name: string, blob: Blob }> => {
				const response: Response = await fetch(loadObj.url);
				if (!response.ok)
				{
					throw new Error(`Failed to download ${loadObj.name}: ${loadObj.url}`);
				}
				
				const contentLengthHeader: string | null = response.headers.get('content-length');
				if (contentLengthHeader !== null)
				{
					const contentLength: number = parseInt(contentLengthHeader, 10);
					progress.total += contentLength;
				}
				
				const stream: ReadableStream<Uint8Array> | null = response.body;
				
				if (!stream)
				{
					return new Promise((): void => {
						console.error('Unable to get stream.');
					});
				}
				
				const reader: ReadableStreamDefaultReader<Uint8Array> = stream.getReader();
				const chunks: Array<Uint8Array> = [];
				let isLoading: boolean = true;
				
				while (isLoading)
				{
					const {done, value} = await reader.read();
					
					if (done)
					{
						isLoading = false;
						break;
					}
					
					chunks.push(value);
					
					// Update progress
					progress.loaded += value.length;
					onProgress(progress.loaded, progress.total, Math.floor((progress.loaded / progress.total) * 100));
				}
				
				const contentType: string = response.headers.get('content-type') ?? '';
				const totalLength: number = chunks.reduce((sum, c) => sum + c.byteLength, 0);
				const merged = new Uint8Array(totalLength);
				let offset: number = 0;
				for (const c of chunks)
				{
					merged.set(c, offset);
					offset += c.byteLength;
				}
				return {name: loadObj.name, blob: new Blob([merged.buffer], {type: contentType})};
				
				/*const blob = new Blob(chunks);
				const type = response.headers.get('content-type');
				return { blob, type };*/
			});
		
		const awaitPromise: Array<{ name: string, blob: Blob }> = await Promise.all(promises); // blobs
		
		this.updateIsLoading(-1);
		
		return awaitPromise;
	}
	
	public getBlobFromFiles(name: string, files: Array<{ name: string, blob: Blob }>): Blob | null
	{
		for (const file of files)
		{
			if (file.name === name)
			{
				return file.blob;
			}
		}
		
		return null;
	}
	
	public async loadFiles(urls: string[]): Promise<Blob[]>
	{
		if (urls.length === 0)
		{
			return [];
		}
		
		this.updateIsLoading(1);
		
		try
		{
			const responses = await Promise.all(
				urls.map(async (url: string) => {
					const res = await fetch(url);
					if (!res.ok)
					{
						throw new Error(`Error at loading URL: ${url} – status: ${res.status}`);
					}
					return res;
				})
			);
			
			return await Promise.all(
				responses.map(async (res: Response) => {
					this.updateIsLoading(-1);
					return await res.blob();
				})
			);
		}
		catch (err)
		{
			this.updateIsLoading(-1); // falls ein Fehler frühzeitig passiert
			throw err;
		}
	}
	
	private updateIsLoading(loadingCount: number): void
	{
		this._loadingCount += loadingCount;
		this._loadingCount = Math.max(0, this._loadingCount);
		
		UtilTimeout.setTimeout( // prevent Expression has changed error
			() => {
				this.signalIsLoading.set(this._loadingCount > 0);
			}
		);
	}
}
