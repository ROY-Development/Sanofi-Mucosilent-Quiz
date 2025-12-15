import {Injectable} from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class FontStyleService
{
	private _fontNames: Array<string> = [];
	
	constructor()
	{
	}
	
	public removeFont(fontName: string): void
	{
		const existingStyle = document.getElementById('main-dyn-font-style-' + fontName);
		if (existingStyle && this._fontNames.indexOf(fontName) !== -1)
		{
			existingStyle.remove(); // vorherige entfernen, falls vorhanden
			this._fontNames.splice(this._fontNames.indexOf(fontName), 1);
		}
	}
	
	public applyFont(fontName: string, fontUrl: string, isAddingToFullPage: boolean): void
	{
		this.removeFont(fontName);
		
		this._fontNames.push(fontName);
		
		const style = document.createElement('style');
		style.id = 'main-dyn-font-style-' + fontName;
		
		let code = `
		@font-face {
			font-family: '${fontName}';
			src: url('${fontUrl}');
		}
		`;
		
		if (isAddingToFullPage)
		{
			code += `body {
		        font-family: '${fontName}', sans-serif !important;
		    }
		    
		    .special-font {
		        font-family: '${fontName}', sans-serif !important;
		    }`;
		}
		
		style.innerHTML = code;
		document.head.appendChild(style);
	}
}
