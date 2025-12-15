import {StopTypeEnum} from '../enums/stop-type.enum';

export class SoundModel
{
	public buffer: AudioBuffer | null = null;
	public bufferSourceNode: AudioBufferSourceNode | null = null;
	public gainNode: GainNode | null = null;
	
	public isPlaying: boolean = false;
	public isMuted: boolean = false;
	public soundTimeoutId: number = -1;
	public stopType: StopTypeEnum = StopTypeEnum.noStop;
	
	public _playAttempt: number = -1;
	//public audio: HTMLAudioElement; // old way, but it is not working in iOS
	public audioContextStartTime: number = -1;
	public audioContextPauseTime: number = -1;
	
	private audioContext: AudioContext | null = null;
	
	constructor(
		public urlOrBlob: string | Blob,
		public name: string,
		public volume: number,
		public isLooping: boolean
	)
	{
		// old easy version - but new one is more stable
		//	this.audio = new Audio(url);
		//	this.audio.volume = volume;
	}
	
	private async init(audioContext: AudioContext): Promise<void>
	{
		this.audioContext = audioContext;
		
		if (typeof this.urlOrBlob === 'string')
		{
			try
			{
				const response = await window.fetch(this.urlOrBlob as string);
				const arrayBuffer = await response.arrayBuffer();
				this.buffer = await this.decodeAudioDataAsync(audioContext, arrayBuffer);
			}
			catch (error)
			{
				console.error(error);
			}
		}
		else if (this.urlOrBlob instanceof Blob)
		{
			try
			{
				const arrayBuffer = await this.urlOrBlob.arrayBuffer();
				this.buffer = await this.decodeAudioDataAsync(audioContext, arrayBuffer);
			}
			catch (error)
			{
				console.error(error);
			}
		}
	}
	
	private async decodeAudioDataAsync(audioContext: AudioContext, arrayBuffer: ArrayBuffer): Promise<AudioBuffer>
	{
		return new Promise((resolve, reject) => {
			return audioContext.decodeAudioData(arrayBuffer, resolve, reject);
		});
	}
	
	public async play(audioContext: AudioContext, isRestarting: boolean, volume: number | null = null): Promise<void>
	{
		if (!this.buffer)
		{
			await this.init(audioContext);
		}
		
		if (this.soundTimeoutId > -1)
		{
			window.clearInterval(this.soundTimeoutId);
			this.soundTimeoutId = -1;
		}
		
		if (volume)
		{
			this.volume = volume;
		}
		
		this.tryPlay(isRestarting);
	}
	
	private waitPlay(isRestarting: boolean): void
	{
		this._playAttempt = window.setTimeout(() => {
			this.tryPlay(isRestarting);
		}, 500);
	}
	
	private tryPlay(isRestarting: boolean): void
	{
		if (!this.buffer)
		{
			// console.log('NO BUFFER')
			this.waitPlay(isRestarting);
			return;
		}
		else
		{
			// console.log(this.name, 'BUFFER');
		}
		
		if (!this.checkAudioContext())
		{
			// console.log('NO AUDIO CONTEXT')
			this.waitPlay(isRestarting);
			return;
		}
		
		if (this._playAttempt > -1)
		{
			clearInterval(this._playAttempt);
			this._playAttempt = -1;
		}
		
		if (this.isMuted)
		{
			return;
		}
		
		// don't do anything else if it is currently playing
		if (!isRestarting && this.isPlaying && this.bufferSourceNode && this.gainNode !== null)
		{
			this.gainNode.gain.value = this.volume;
			
			return;
		}
		
		let when: number = 0;
		if (
			!isRestarting
			&& this.audioContextStartTime > -1 &&
			this.audioContextPauseTime > -1
		) // from pause
		{
			when = this.audioContextPauseTime - this.audioContextStartTime;
		}
		
		if (this.bufferSourceNode)
		{
			this.bufferSourceNode.disconnect();
			this.bufferSourceNode.stop();
			this.bufferSourceNode = null;
		}
		
		if (this.gainNode !== null)
		{
			this.gainNode.disconnect();
			this.gainNode = null;
		}
		
		if (!this.audioContext)
		{
			console.warn('Sound: ' + this.name + ' has no audio context.');
			return;
		}
		
		this.bufferSourceNode = this.audioContext.createBufferSource();
		this.bufferSourceNode.buffer = this.buffer;
		this.bufferSourceNode.loop = this.isLooping;
		
		// now instead of connecting to audioContext.destination, connect to the gainNode
		this.gainNode = this.audioContext.createGain();
		this.gainNode.gain.value = this.volume;
		this.gainNode.connect(this.audioContext.destination);
		this.bufferSourceNode.connect(this.gainNode);
		
		this.bufferSourceNode.start(when);
		this.audioContextStartTime = this.audioContext.currentTime;
		this.audioContextPauseTime = -1;
		this.isPlaying = true;
	}
	
	private checkAudioContext(): boolean
	{
		// check if context is in the suspended state (autoplay policy)
		if (this.audioContext?.state === 'suspended')
		{
			try
			{
				this.audioContext.resume().then();
			}
			catch (e)
			{
				return false;
			}
		}
		
		return true;
	}
	
	public pause(): void
	{
		this.isPlaying = false;
		
		if (this.bufferSourceNode)
		{
			this.bufferSourceNode.stop();
		}
		
		if (this._playAttempt > -1)
		{
			clearInterval(this._playAttempt);
			this._playAttempt = -1;
		}
		
		this.stopType = StopTypeEnum.noStop;
		
		if (this.audioContext)
		{
			this.audioContextPauseTime = this.audioContext.currentTime;
		}
	}
	
	public stop(): void
	{
		this.isPlaying = false;
		if (this.bufferSourceNode)
		{
			this.bufferSourceNode.disconnect();
			this.bufferSourceNode.stop();
			this.bufferSourceNode = null;
		}
		
		if (this._playAttempt > -1)
		{
			clearInterval(this._playAttempt);
			this._playAttempt = -1;
		}
		
		if (this.gainNode !== null)
		{
			this.gainNode.disconnect();
			this.gainNode = null;
		}
		
		this.audioContextStartTime = -1;
		this.audioContextPauseTime = -1;
		this.stopType = StopTypeEnum.noStop;
	}
	
	public delete(): void
	{
		this.stop();
		
		if (this.buffer)
		{
			this.buffer = null;
		}
	}
}