export class UtilColor
{
	public static getRGBAColorFromHexColor(
		hexColor: string,
		alphaFactor: number = 1,
		lightFactor: number = 1
	): string
	{
		// Remove leading #
		const hex = hexColor.replace('#', '');
		
		// Parse RGB values
		let r: number, g: number, b: number, a: number = 1;
		
		if (hex.length === 6)
		{
			// Format: #RRGGBB
			r = parseInt(hex.substring(0, 2), 16);
			g = parseInt(hex.substring(2, 4), 16);
			b = parseInt(hex.substring(4, 6), 16);
		}
		else if (hex.length === 8)
		{
			// Format: #RRGGBBAA
			r = parseInt(hex.substring(0, 2), 16);
			g = parseInt(hex.substring(2, 4), 16);
			b = parseInt(hex.substring(4, 6), 16);
			a = parseInt(hex.substring(6, 8), 16) / 255;
		}
		else if (hex.length === 3)
		{
			// Format: #RGB (Kurzform)
			r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
			g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
			b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
		}
		else
		{
			// Invalid format, fallback to black
			r = g = b = 0;
			a = 1;
		}
		
		r *= lightFactor;
		g *= lightFactor;
		b *= lightFactor;
		a *= alphaFactor;
		
		return `rgba(${r}, ${g}, ${b}, ${a})`;
	}
	
	public static getInTransparentColorFromColor(color: string): string
	{
		if (color.indexOf('rgba') === -1)
		{
			return color;
		}
		
		const splitColors: Array<string> = color.split(',');
		const r = splitColors[0].replace('rgba(', '');
		const g = splitColors[1];
		const b = splitColors[2];
		
		return 'rgb(' + r + ',' + g + ',' + b + ')';
	}
	
	public static getRGBAPartsOfColor(color: string): { r: number, g: number, b: number, a: number }
	{
		let r: number = 0, g: number = 0, b: number = 0, a: number = 1;
		
		// check if it is hex color, then convert it to rgba
		if (color.startsWith('#'))
		{
			color = UtilColor.getRGBAColorFromHexColor(color);
		}
		
		if (color.startsWith('rgb'))
		{
			a = color.startsWith('rgba') ? -1 : 1;
			
			// check: "rgb(r, g, b)" or "rgba(r, g, b, a)"
			const parts: Array<string> = color
				.replace(/rgba?\(/, '')
				.replace(/\)/, '')
				.split(',')
				.map(p => p.trim());
			r = parseInt(parts[0], 10);
			g = parseInt(parts[1], 10);
			b = parseInt(parts[2], 10);
			if (a === -1)
			{
				a = parseInt(parts[3], 10);
			}
		}
		
		return {r, g, b, a};
	}
}