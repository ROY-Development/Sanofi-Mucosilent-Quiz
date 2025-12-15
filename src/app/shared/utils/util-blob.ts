export class UtilBlob
{
	public static getBlobFromBase64String(base64: string, mimeType: string = ''): Blob | null
	{
		try
		{
			// Check if the string is a data URL (e.g., "data:image/png;base64,...")
			const base64PrefixMatch = base64.match(/^data:(.*);base64,(.*)$/);
			if (base64PrefixMatch)
			{
				mimeType = base64PrefixMatch[1]; // Extract MIME type
				base64 = base64PrefixMatch[2];   // Extract only the base64 part
			}
			
			// Decode base64 string to binary data
			const byteCharacters = atob(base64);
			const byteArrays = [];
			
			// Convert binary string to byte arrays in chunks
			for (let offset = 0; offset < byteCharacters.length; offset += 512)
			{
				const slice = byteCharacters.slice(offset, offset + 512);
				const byteNumbers = new Array(slice.length);
				
				for (let i = 0; i < slice.length; i++)
				{
					byteNumbers[i] = slice.charCodeAt(i);
				}
				
				const byteArray = new Uint8Array(byteNumbers);
				byteArrays.push(byteArray);
			}
			
			// Create and return the Blob object
			return new Blob(byteArrays, {type: mimeType});
		}
		catch (e)
		{
			console.error(e);
			return null;
		}
	}
	
}