export class CanvasContextUtil
{
	public static drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number)
	{
		const words: Array<string> = text.split(' ');
		let line: string = '';
		const lines: Array<string> = [];
		for (let i = 0; i < words.length; i++)
		{
			const testLine: string = line + words[i] + ' ';
			const metrics: TextMetrics = context.measureText(testLine);
			
			if (metrics.width > maxWidth && i > 0)
			{
				lines.push(line);
				line = words[i] + ' ';
			}
			else
			{
				line = testLine;
			}
		}
		lines.push(line);
		
		const fullHeight: number = lines.length * lineHeight;
		
		for (let j = 0; j < lines.length; j++)
		{
			context.fillText(lines[j], x, y + j * lineHeight - fullHeight * 0.5 + lineHeight * 0.5);
		}
	}
}