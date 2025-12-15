import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	Input,
	OnChanges,
	OnDestroy,
	Output,
	signal,
	SimpleChanges,
	ViewEncapsulation
} from '@angular/core';
import {UtilTimeout} from '../../utils/util-timeout';
import {UtilString} from '../../utils/util-string';

class KeyModel
{
	constructor(
		public key: string,
		public displayKey: string
	)
	{
	}
}

export type KeyboardInputMode = 'text' | 'numeric' | 'numericClean';

@Component({
	selector: 'app-on-screen-keyboard',
	encapsulation: ViewEncapsulation.None,
	templateUrl: './on-screen-keyboard.component.html',
	styleUrls: ['./on-screen-keyboard.component.scss'],
	standalone: false
})
export class OnScreenKeyboardComponent implements AfterViewInit, OnChanges, OnDestroy
{
	private elementRef = inject(ElementRef);
	
	private static SPECIAL_KEYS_RUNTIME_MS = 1000;
	
	@Input() public inputElement: HTMLInputElement | null = null;
	@Input() public inputElementInputMode: KeyboardInputMode | null = null;
	@Input() public inputElementMaxLength: number = 0;
	
	@Output() public readonly blurElement = new EventEmitter<void>();
	@Output() public readonly submitForm = new EventEmitter<void>();
	
	public lastInputElementInputMode: KeyboardInputMode | null = this.inputElementInputMode;
	
	public readonly layoutArray = signal<Array<Array<KeyModel>>>([]);
	
	public layout: any = {
		'text': [
			'` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
			'{tab} q w e r t y u i o p [ ] \\',
			'{lock} a s d f g h j k l ; \' {enter}',
			'{shift-left} z x c v b n m , . / {shift-right}',
			'{space}'
		],
		'textShift': [
			'~ ! @ # $ % ^ &amp; * ( ) _ + {bksp}',
			'{tab} Q W E R T Y U I O P { } |',
			'{lock} A S D F G H J K L : " {enter}',
			'{shift-left} Z X C V B N M &lt; &gt; ? {shift-right}',
			'{space}'
		],
		'numeric': [
			"1 2 3",
			"4 5 6",
			"7 8 9",
			"{shift-left} 0 _",
			"{bksp} {enter}"
		],
		'numericShift': [
			"! / #",
			"$ % ^",
			"& * (",
			"{shift-left} ) +",
			"{bksp} {enter}"
		],
		'numericClean': [
			"1 2 3",
			"4 5 6",
			"7 8 9",
			" 0 ",
			"{bksp} {enter}"
		]
	};
	public keyContent: any = {
		'{bksp}': '&nbsp;',
		'{tab}': '&nbsp;',
		'{lock}': '&nbsp;',
		'{enter}': '&nbsp;',
		'{shift-left}': '&nbsp;',
		'{shift-right}': '&nbsp;',
		'{space}': "&nbsp;"
	};
	public keyClass: any = {
		'{bksp}': 'os-backspace',
		'{tab}': 'os-tab',
		'{lock}': 'os-shift-lock',
		'{enter}': 'os-enter',
		'{shift-left}': 'os-shift-left',
		'{shift-right}': 'os-shift-right'
	};
	// _+#*~°^ßáàâäãéèêëíìîïóòôöõúùûüçñÁÃÄÉÍÑÓÚÜËÏÖŸÿÕÂÊÎÔÛÀÈÌÒÙÇ¡«»åÅæÆœŒðÐøØ
	public specialCharactersMap: any =
		{
			'a': ['ä', 'á', 'à', 'â', 'ã'],
			'e': ['ë', 'é', 'è', 'ê'],
			'i': ['ï', 'í', 'ì', 'î'],
			'o': ['ö', 'ó', 'ò', 'ô', 'õ'],
			'u': ['ü', 'ú', 'ù', 'û'],
			'A': ['Ä', 'Á', 'À', 'Â', 'Ã', 'Å', 'Æ'],
			'E': ['Ë', 'É', 'È', 'Ê'],
			'I': ['Ï', 'Í', 'Ì', 'Î'],
			'O': ['Ö', 'Ó', 'Ò', 'Ô'],
			'U': ['Ü', 'Ú', 'Ù', 'Û'],
			's': ['ß'],
			'S': ['ß']
		};
	
	public isOneTimeShift: boolean = false;
	public isShiftEnabled: boolean = false;
	public currentPushedKey: string | null = null;
	public currentSpecialCharacterKey: string | null = null;
	public specialCharacters:
		{
			posX: number,
			posY: number,
			keys: Array<string>
		} | null = null;
	
	private mouseDownKeyboard = this.onMouseDownKeyboard.bind(this);
	private mouseMoveKeyboard = this.onMouseMoveKeyboard.bind(this);
	private mouseUpWindow = this.onMouseUpWindow.bind(this);
	
	public runTime: number = 0;
	private lastTime: number = performance.now();
	private currentTime: number = 0;
	private delta: number = 0;
	private animationFrameId: number = -1;
	
	public ngAfterViewInit(): void
	{
		UtilTimeout.setTimeout(() => {
			this.init();
		}, 0);
	}
	
	private updateLayoutArray(): void
	{
		const layoutName = this.inputElementInputMode + (this.isShiftEnabled ? 'Shift' : '');
		const layoutArray = [];
		for (const key in this.layout)
		{
			if (key === layoutName)
			{
				for (const row of this.layout[key])
				{
					const keys = row.split(' ');
					const rowKeys: Array<KeyModel> = [];
					
					for (const key of keys)
					{
						rowKeys.push(
							new KeyModel(
								key,
								key in this.keyContent ? this.keyContent[key] : key
							)
						);
					}
					
					layoutArray.push(rowKeys);
				}
			}
		}
		this.layoutArray.set(layoutArray);
	}
	
	public ngOnChanges(changes: SimpleChanges): void
	{
		if ('inputElement' in changes)
		{
			this.isOneTimeShift = false;
			this.isShiftEnabled = false;
			
			if (this.inputElement)
			{
				this.addEventListener();
			}
			else
			{
				this.removeEventListener();
			}
		}
		if ('inputElementInputMode' in changes)
		{
			if (this.inputElementInputMode)
			{
				this.lastInputElementInputMode = this.inputElementInputMode;
				this.updateLayoutArray();
			}
		}
	}
	
	public ngOnDestroy(): void
	{
		this.removeEventListener();
		this.stopLoop();
	}
	
	/*
	// mouse click is not working consistently, so mouse up and touch end are needed
	 */
	public onClickKey(ev: MouseEvent | TouchEvent, key: string): void
	{
		// if key is released after opening special keys
		if (
			this.specialCharacters &&
			this.currentSpecialCharacterKey &&
			this.runTime >= OnScreenKeyboardComponent.SPECIAL_KEYS_RUNTIME_MS)
		{
			return;
		}
		
		if (
			!this.inputElement ||
			!this.currentPushedKey ||
			key !== this.currentPushedKey
		)
		{
			return;
		}
		key = this.currentPushedKey;
		/* Is needed because otherwise you will get the key from touch down everytime */
		/*if (ev instanceof TouchEvent)
		{
			
			const target = document.elementFromPoint(
				ev.changedTouches[0].clientX, ev.changedTouches[0].clientY
			);
			if (target && target.hasAttribute('data-key'))
			{
				key = target.getAttribute('data-key') ?? '';
			}
			else
			{
				return;
			}
		}*/
		let value: string = this.inputElement.value;
		const start = this.inputElement.selectionStart ?? 0;
		const end = this.inputElement.selectionEnd ?? 0;
		
		if (key === '{shift-left}' || key === '{shift-right}' || key === '{lock}')
		{
			// if lock is clicked and shift was enabled before
			if (key === '{lock}' && this.isShiftEnabled && this.isOneTimeShift)
			{
				// let it enabled
			}
			else
			{
				this.isShiftEnabled = !this.isShiftEnabled;
			}
			this.isOneTimeShift = (key === '{shift-left}' || key === '{shift-right}');
			
			this.updateLayoutArray();
			return;
		}
		else if (key === '{enter}')
		{
			const keyboardEvent = new KeyboardEvent('keydown', {
				code: 'Enter',
				key: 'Enter',
				view: window,
				bubbles: true,
				cancelable: true
			});
			this.inputElement.dispatchEvent(keyboardEvent);
			this.submitForm.next();
			return;
		}
		else if (key === '{bksp}')
		{
			if (start !== end)
			{
				value = value.substring(0, start) + value.substring(end, value.length);
				this.inputElement.value = value;
			}
			else
			{
				value = value.substring(0, start - 1) + value.substring(start, value.length);
				this.inputElement.value = value;
				if (start - 1 >= 0)
				{
					this.inputElement.setSelectionRange(start - 1, start - 1);
				}
			}
		}
		else if (value.length < this.inputElementMaxLength)
		{
			if (key === '{space}')
			{
				key = ' ';
			}
			else if (key === '{tab}')
			{
				key = '   ';//"\t";
			}
			else if (key.length > 1 && key.includes('&'))
			{
				key = UtilString.unEscape(key);
			}
			
			(<any>this.inputElement).setRangeText(key, start, end, 'end');
			
			if (this.isOneTimeShift)
			{
				this.isOneTimeShift = false;
				this.isShiftEnabled = false;
				this.updateLayoutArray();
			}
		}
		
		const event = new Event('input', {
			bubbles: true,
			cancelable: true
		});
		
		this.inputElement.dispatchEvent(event);
	}
	
	public onClickSpecialKey(ev: MouseEvent | TouchEvent, key: string): void
	{
		// console.log('onClickSpecialKey', key);
		if (
			!this.inputElement ||
			!this.currentPushedKey ||
			key !== this.currentPushedKey)
		{
			return;
		}
		
		key = this.currentPushedKey;
		
		//let value: string = this.inputElement.value;
		const start = this.inputElement.selectionStart ?? 0;
		const end = this.inputElement.selectionEnd ?? 0;
		
		if (key.length > 1 && key.includes('&'))
		{
			key = UtilString.unEscape(key);
		}
		
		(<any>this.inputElement).setRangeText(key, start, end, 'end');
		
		this.specialCharacters = null;
		this.currentSpecialCharacterKey = null;
		
		const event = new Event('input', {
			bubbles: true,
			cancelable: true
		});
		
		this.inputElement.dispatchEvent(event);
	}
	
	private init(): void
	{
		this.updateLayoutArray();
	}
	
	/*
	// mouse click is not working consistently, so mouse up and touch end are needed
	 */
	private addEventListener(): void
	{
		this.elementRef.nativeElement.addEventListener('mousedown', this.mouseDownKeyboard);
		this.elementRef.nativeElement.addEventListener('touchstart', this.mouseDownKeyboard);
		this.elementRef.nativeElement.addEventListener('mousemove', this.mouseMoveKeyboard);
		this.elementRef.nativeElement.addEventListener('touchmove', this.mouseMoveKeyboard);
		window.addEventListener('mouseup', this.mouseUpWindow);
		window.addEventListener('touchend', this.mouseUpWindow);
	}
	
	private removeEventListener(): void
	{
		this.elementRef.nativeElement.removeEventListener('mousedown', this.mouseDownKeyboard);
		this.elementRef.nativeElement.removeEventListener('touchstart', this.mouseDownKeyboard);
		this.elementRef.nativeElement.removeEventListener('mousemove', this.mouseMoveKeyboard);
		this.elementRef.nativeElement.removeEventListener('touchmove', this.mouseMoveKeyboard);
		window.removeEventListener('mouseup', this.mouseUpWindow);
		window.removeEventListener('touchend', this.mouseUpWindow);
	}
	
	private onMouseDownKeyboard(ev: MouseEvent | PointerEvent | TouchEvent): void
	{
		ev.preventDefault();
		ev.stopImmediatePropagation();
		
		this.currentPushedKey = this.getPushedKey(ev);
		
		if (!this.currentPushedKey)
		{
			return;
		}
		
		if ( // clicked at special keys row
			this.specialCharacters &&
			this.currentSpecialCharacterKey &&
			this.specialCharacters.keys.includes(this.currentPushedKey)
		)
		{
			// console.log('includes', this.currentSpecialCharacterKey)
		}
		else
		{
			this.specialCharacters = null;
			this.currentSpecialCharacterKey = null;
			this.startLoop();
		}
	}
	
	private onMouseMoveKeyboard(ev: MouseEvent | PointerEvent | TouchEvent): void
	{
		const currentSelectedKey = this.getPushedKey(ev);
		if (this.currentPushedKey !== currentSelectedKey)
		{
			this.stopLoop();
			this.currentPushedKey = null;
		}
	}
	
	private onMouseUpWindow(ev: MouseEvent | PointerEvent | TouchEvent): void
	{
		this.stopLoop();
		
		const target: HTMLElement = (<HTMLElement>ev.target);
		
		// don't prevent event if it is the submit button triggered by real Enter key
		if (
			'type' in target.attributes &&
			(<any>target.attributes).type.value === 'submit')
		{
			return;
		}
		
		const classList = target.classList;
		
		const isKeyboardClick = target.tagName?.toLowerCase() === 'input' ||
			classList.contains('os-keyboard') ||
			classList.contains('os-rows') ||
			classList.contains('os-row') ||
			classList.contains('os-key') ||
			classList.contains('os-key-value') ||
			classList.contains('os-special-key-row') ||
			classList.contains('os-special-key')
		;
		
		if (!isKeyboardClick)
		{
			this.inputElement?.blur();
			this.blurElement.emit();
		}
	}
	
	private getPushedKey(ev: MouseEvent | PointerEvent | TouchEvent): string | null
	{
		let key: string | null = null;
		let target = ev.target;
		
		if (ev instanceof TouchEvent)
		{
			/* Is needed because otherwise you will get the key from touch down everytime */
			target = document.elementFromPoint(
				ev.changedTouches[0].clientX, ev.changedTouches[0].clientY
			);
		}
		
		if (target && (<Element>target).hasAttribute('data-key'))
		{
			key = (<Element>target).getAttribute('data-key') ?? '';
		}
		
		return key;
	}
	
	private loop(): void
	{
		this.animationFrameId = window.requestAnimationFrame(this.loop.bind(this));
		this.currentTime = performance.now();
		this.delta = (this.currentTime - this.lastTime);
		this.runTime += this.delta;
		this.lastTime = this.currentTime;
		
		if (this.runTime >= OnScreenKeyboardComponent.SPECIAL_KEYS_RUNTIME_MS)
		{
			this.stopLoop();
			const targetKey = this.elementRef.nativeElement.getElementsByClassName('selected')[0];
			if (!targetKey || !this.currentPushedKey)
			{
				return;
			}
			
			if (this.specialCharactersMap[this.currentPushedKey])
			{
				this.currentSpecialCharacterKey = this.currentPushedKey;
				this.specialCharacters =
					{
						posX: targetKey.offsetLeft,
						posY: targetKey.offsetTop - targetKey.clientHeight,
						keys: this.specialCharactersMap[this.currentPushedKey]
					};
			}
		}
	}
	
	private startLoop(runTime: number = 0): void
	{
		this.stopLoop();
		this.lastTime = performance.now();
		this.runTime = runTime;
		this.loop();
	}
	
	private stopLoop(): void
	{
		if (this.animationFrameId > -1)
		{
			window.cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = -1;
		}
	}
}
