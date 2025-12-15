import {inject, Injectable, signal} from '@angular/core';
import {AppLoopService} from './app-loop.service';
import {StillThereService} from './still-there.service';

@Injectable({
	providedIn: 'root'
})
export class MushroomButtonInputService
{
	private stillThereService = inject(StillThereService);
	
	// public static GAMEPAD_GATE_VALUE = 0.3;
	public readonly signalIsLeftButtonDown = signal<boolean>(false);
	public readonly signalIsRightButtonDown = signal<boolean>(false);
	
	public readonly signalAreBothButtonsPressed = signal<boolean>(false);
	public readonly signalTimerBothButtons = signal<number>(0);
	
	private readonly hasEvent: boolean;
	public gamepads: Array<Gamepad> = [];
	
	public buttons: Array<{ gamepadId: string, buttonIndex: number, pressed: boolean }> = [];
	public maxButtons: number = 0;
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('MushroomButtonInputService');
		
		this.hasEvent = "ongamepadconnected" in window;
	}
	
	public init(): void
	{
		window.addEventListener("gamepadconnected", this.connectHandler.bind(this));
		window.addEventListener("gamepaddisconnected", this.disconnectHandler.bind(this));
		
		this.appLoopService.start();
		
		if (!this.hasEvent)
		{
			setInterval(() => {
				this.scanGamepads();
			}, 500);
		}
	}
	
	public initButtons(maxButtons: number = 0): void
	{
		this.maxButtons = maxButtons;
		this.buttons = [];
	}
	
	public setButtons(buttons: Array<{ gamepadId: string, buttonIndex: number }>): void
	{
		this.buttons = [];
		for (const button of buttons)
		{
			this.buttons.push({
				gamepadId: button.gamepadId,
				buttonIndex: button.buttonIndex,
				pressed: false
			});
		}
		this.maxButtons = this.buttons.length;
	}
	
	private connectHandler(e: GamepadEvent)
	{
		this.addGamepad(e.gamepad);
	}
	
	private addGamepad(gamepad: Gamepad): void
	{
		// console.log(gamepad)
		this.gamepads.push(gamepad);
	}
	
	private disconnectHandler(e: GamepadEvent): void
	{
		this.removeGamepad(e.gamepad);
	}
	
	private removeGamepad(gamepad: Gamepad): void
	{
		this.gamepads.splice(this.gamepads.indexOf(gamepad), 1);
	}
	
	public updateStatus(): void
	{
		if (!this.hasEvent)
		{
			this.scanGamepads();
		}
		
		let isLeftButtonDown: boolean = false;
		let isRightButtonDown: boolean = false;
		
		for (const gamepad of this.gamepads)
		{
			for (let i: number = 0, n: number = gamepad.buttons.length; i < n; ++i)
			{
				const gamepadButton: GamepadButton = gamepad.buttons[i];
				const pressed = gamepadButton.pressed;
				// const val = button.value;
				
				if (pressed)
				{
					// console.log('pct', Math.round(val * 100), 'pressed Button', gamepad.id, button, i);
					this.addButton(gamepad, i);
				}
				
				for (let j: number = 0, m: number = this.buttons.length; j < m; ++j)
				{
					const button = this.buttons[j];
					if (button.gamepadId === gamepad.id && button.buttonIndex === i)
					{
						button.pressed = pressed;
						if (j === 0)
						{
							isLeftButtonDown = pressed;
						}
						else if (j === 1)
						{
							isRightButtonDown = pressed;
						}
					}
				}
			}
			
			/*let values = '';
			for (const axis of gamepad.axes)
			{
				values += (axis + 1) + ', ';
				//console.log(`${gamepad.id}: ${axis.toFixed(4)}`, "value", axis + 1);
			}*/
			
			//console.log(`index: ${gamepad.index} value: ${values}`);
		}
		
		// recognize button press only once
		if (isLeftButtonDown && isLeftButtonDown !== this.signalIsLeftButtonDown() ||
			isRightButtonDown && isRightButtonDown !== this.signalIsRightButtonDown())
		{
			this.stillThereService.resetTimer();
		}
		
		this.signalIsLeftButtonDown.set(isLeftButtonDown);
		this.signalIsRightButtonDown.set(isRightButtonDown);
	}
	
	private addButton(gamepad: Gamepad, buttonIndex: number): void
	{
		if (this.buttons.length >= this.maxButtons)
		{
			return;
		}
		
		for (let i: number = 0, n: number = this.buttons.length; i < n; ++i)
		{
			const button = this.buttons[i];
			if (button.gamepadId === gamepad.id && button.buttonIndex === buttonIndex)
			{
				return;
			}
		}
		
		// add button
		this.buttons.push({gamepadId: gamepad.id, buttonIndex: buttonIndex, pressed: false});
		
		console.log(this.buttons);
	}
	
	private scanGamepads()
	{
		const gamepads = navigator.getGamepads();
		for (const gamepad of gamepads)
		{
			if (gamepad && this.gamepads.indexOf(gamepad) === -1)
			{
				/*for (const currentGamepad of this.gamepads)
				{
					if (currentGamepad.index === gamepad.index)
					{
						this.gamepads[this.gamepads.indexOf(currentGamepad)] = gamepad;
					}
					else
					{
						this.addGamepad(gamepad)
					}
				}*/
				
				const foundGamepad = this.gamepads.find((currentGamepad) => {
					if (currentGamepad.index === gamepad.index)
					{
						return currentGamepad;
					}
					return null;
				})
				
				if (!foundGamepad)
				{
					//	this.addGamepad(gamepad);
				}
				else
				{
					this.gamepads[this.gamepads.indexOf(foundGamepad)] = gamepad;
				}
			}
		}
	}
	
	private loop(delta: number): void
	{
		this.updateStatus();
		
		if (this.signalIsLeftButtonDown() && this.signalIsRightButtonDown())
		{
			this.signalTimerBothButtons.set(this.signalTimerBothButtons() + delta);
			this.signalAreBothButtonsPressed.set(true);
		}
		else if (this.signalAreBothButtonsPressed())
		{
			this.signalTimerBothButtons.set(0);
			this.signalAreBothButtonsPressed.set(false);
		}
	}
}
