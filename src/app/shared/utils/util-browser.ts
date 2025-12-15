export class UtilBrowser
{
	public static isUserActive(): boolean
	{
		return navigator.userActivation.isActive;
	}
	
	public static getCurrentBrowser(): string
	{
		// Opera 8.0+
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		const isOperaMini = navigator.userAgent.indexOf('Opera Mini') >= 0;
		// Firefox 1.0+
		let isFirefox = navigator.userAgent.indexOf('Firefox') !== -1;
		
		if (!isFirefox)
		{
			// @ts-ignore
			isFirefox = typeof InstallTrigger !== 'undefined' || navigator.userAgent.indexOf('FxiOS') !== -1;
		}
		
		// Safari 3.0+ "[object HTMLElementConstructor]"
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const isSafari = /constructor/i.test(window.HTMLElement) || (function(p) {
				return p.toString() === '[object SafariRemoteNotification]';
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
			})(!(<any>window)['safari'] || (typeof safari !== 'undefined' && safari.pushNotification)) ||
			
			// new implementation 20230929
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
			navigator.userAgent &&
			navigator.userAgent.indexOf('CriOS') == -1 &&
			navigator.userAgent.indexOf('FxiOS') == -1;
		
		// Internet Explorer 6-11
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const isIE = /*@cc_on!@*/!!document.documentMode;
		
		// Edge 20+
		const isEdge = !isIE && !!(<any>window).StyleMedia;
		
		// Chrome 1 - 117
		let isChrome = !!(<any>window).chrome && (!!(<any>window).chrome.webstore ||
			!!(<any>window).chrome.runtime || !!(<any>window).chrome.app) || navigator.userAgent.indexOf('CriOS') !== -1;
		// Edge (based on chromium) detection
		const isEdgeChromium = isChrome && (navigator.userAgent.indexOf('Edg') !== -1);
		if (isEdgeChromium)
		{
			isChrome = false;
		}
		
		// Blink engine detection
		const isBlink = (isChrome || isOpera) && !!window.CSS;
		
		// Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)
		// Chrome/116.0.5845.228 Electron/26.3.0 Safari/537.36
		// Electron
		const isElectron: boolean = (navigator.userAgent.indexOf('Electron') !== -1) &&
			!!(window && (<any>window).process && (<any>window).process.type);
		
		const isIPad: boolean = (/iPad/.test(navigator.platform));
		const isIPhone: boolean = (/iPhone/.test(navigator.platform));
		const isIPod: boolean = (/iPod/.test(navigator.platform));
		
		let output: string = '';
		output += isFirefox ? 'Firefox ' : '';
		output += isChrome ? 'Chrome ' : '';
		output += isSafari ? 'Safari ' : '';
		output += isOpera ? 'Opera ' : '';
		output += isOperaMini ? 'Opera Mini' : '';
		output += isIE ? 'IE ' : '';
		output += isEdge ? 'Edge ' : '';
		output += isEdgeChromium ? 'EdgeChromium ' : '';
		output += isBlink ? 'Blink ' : '';
		output += isElectron ? 'Electron ' : '';
		output += isIPad ? 'iPad ' : '';
		output += isIPhone ? 'iPhone ' : '';
		output += isIPod ? 'iPod ' : '';
		
		return output;
	}
	
	public static isIpadOS()
	{
		const test: boolean | 0 = navigator.maxTouchPoints &&
			navigator.maxTouchPoints > 2 &&
			/MacIntel/.test(navigator.platform);
		
		return test || (typeof test === 'number' && test !== 0);
	}
	
	public static isIPhoneSafari(): boolean
	{
		return UtilBrowser.getCurrentBrowser().includes('Safari iPhone');
	}
	
	public static isIPadOrPodOrPhone(): boolean
	{
		return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(<any>window).MSStream; // MSStream <- Windows Phone
	}
	
	public static isInIframe(): boolean
	{
		try
		{
			return window.self !== window.top;
		}
		catch (e)
		{
			// access to window.top may be blocked in cross-origin
			return true;
		}
	}
	
	public static getUserAgent(): string
	{
		return window.navigator.userAgent || '';
	}
	
	public static isUserAgent(userAgent: string): boolean
	{
		return navigator.userAgent.indexOf(userAgent) !== -1;
	}
	
	public static toggleFullscreen(): Promise<void>
	{
		if (!document.fullscreenElement)
		{
			return document.documentElement.requestFullscreen();
		}
		
		return document.exitFullscreen();
	}
	
	public static setOffContextMenu(): void
	{
		window.oncontextmenu = function() {
			return false;
		};
	}
	
	// prevent developer menu via keyboard click
	public static preventDeveloperMenu(): void
	{
		document.onkeydown = function(e): boolean {
			if (
				e.code === 'F12' ||
				e.code === 'KeyI' && e.shiftKey && e.ctrlKey ||
				e.code === 'KeyK' && e.shiftKey && e.ctrlKey ||
				e.code === 'KeyC' && e.shiftKey && e.ctrlKey ||
				e.code === 'KeyJ' && e.shiftKey && e.ctrlKey
			)
			{
				e.preventDefault();
				return false;
			}
			
			return true;
		}
	}
	
	public static stopBackButton(): void
	{
		// stop back button
		history.pushState(null, document.title, window.location.href);
		window.addEventListener('popstate', function() {
			history.pushState(null, document.title, window.location.href);
		});
	}
	
	// Google Developers Website check passive events
	public static supportsPassiveEvents(): boolean
	{
		// Test via a getter in the options object to see if the passive property is accessed
		let supportsPassive = false;
		try
		{
			const opts = Object.defineProperty({}, 'passive', {
				get: function() {
					supportsPassive = true;
				}
			});
			const testFunc = () => {
			};
			window.addEventListener("wheel", testFunc, opts);
			window.removeEventListener("wheel", testFunc, opts);
		}
		catch (e)
		{
		}
		
		return supportsPassive;
	}
	
	public static hasOnTouchStartEvent(): boolean
	{
		return ('ontouchstart' in window);
	}
	
	public static createPDFDownload(fileName: string, pdfAttachment: string): void
	{
		const link = document.createElement('a');
		link.href = 'data:application/pdf;base64, ' + encodeURI(pdfAttachment);
		link.download = fileName + '.pdf';
		link.dispatchEvent(new MouseEvent('click'));
		
		link.remove();
	}
	
	public static createFileDownload(
		fileName: string,
		attachment: string
	): void
	{
		const link = document.createElement('a');
		link.href = attachment;
		link.download = fileName;
		link.dispatchEvent(new MouseEvent('click'));
		
		link.remove();
	}
}