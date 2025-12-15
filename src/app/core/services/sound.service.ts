import {SoundModel} from '../../shared/models/sound.model';
import {StopTypeEnum} from '../../shared/enums/stop-type.enum';
import {Injectable, signal} from '@angular/core';
import {UtilTimeout} from '../../shared/utils/util-timeout';

@Injectable({
	providedIn: 'root'
})
export class SoundService
{
	public signalSounds = signal<Array<SoundModel>>([]);
	public signalBackgroundSounds = signal<Array<SoundModel>>([]);
	
	private _sounds: Array<SoundModel> = [];
	private _backgroundSounds: Array<SoundModel> = [];
	private audioContext: AudioContext | null = null;
	
	private _isMuted: boolean = false;
	private isLeavingFocusMuted: boolean = false;
	private static areLeavingFocusEventsSet: boolean = false;
	
	private _currentBackgroundSoundName: string | null = null;
	
	private initCallback: (() => void) | null = null;
	private initializeAudioContextCallback = this.initializeAudioContext.bind(this);
	
	public get isMuted(): boolean
	{
		return this._isMuted;
	}
	
	public get isAudiContextInitialized(): boolean
	{
		return this.audioContext !== null && this.audioContext.state === 'running';
	}
	
	constructor()
	{
		//	const AudioContextClass = window.AudioContext || (<any>window).webkitAudioContext;
		//	this.audioContext = new AudioContextClass(); // Make it cross browser
		const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
		events.forEach(event => window.addEventListener(event, this.initializeAudioContextCallback, false));
		
		if (!SoundService.areLeavingFocusEventsSet)
		{
			SoundService.areLeavingFocusEventsSet = true;
			
			window.addEventListener("focus", () => {
				if (this.isLeavingFocusMuted)
				{
					this.isLeavingFocusMuted = false;
					return;
				}
				
				this.unmuteAllSounds();
			});
			
			window.addEventListener("blur", () => {
				if (this._isMuted)
				{
					this.isLeavingFocusMuted = true;
				}
				else
				{
					this.muteAllSounds();
				}
			});
		}
	}
	
	public setInitCallback(initCallback: () => void): void
	{
		this.initCallback = initCallback;
	}
	
	public unsetInitCallback(): void
	{
		this.initCallback = null;
	}
	
	private initializeAudioContext(): void
	{
		const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
		events.forEach(event => window.removeEventListener(event, this.initializeAudioContextCallback));
		
		UtilTimeout.setTimeout(() => {
			const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
			this.audioContext = new AudioContextClass(); // Make it cross-browser
			
			this.unlockAudioContext();
			
			if (this.initCallback)
			{
				this.initCallback();
			}
		}, 0);
	}
	
	public unlockAudioContext(): void
	{
		if (!this.audioContext)
		{
			return;
		}
		
		// create an empty buffer and play it
		const buffer: AudioBuffer = this.audioContext.createBuffer(1, 1, this.audioContext.sampleRate);
		const source: AudioBufferSourceNode = this.audioContext.createBufferSource();
		source.buffer = buffer;
		source.connect(this.audioContext.destination);
		
		if (this.audioContext.state === 'suspended')
		{
			try
			{
				this.audioContext.resume().then();
			}
			catch (e)
			{
				if (e) {
					//
				}
				//
			}
		}
		
		// From https://paulbakaus.com/tutorials/html5/web-audio-on-ios/
		// "The only way to unmute the Web Audio context is to call noteOn() right after a user interaction.
		// This can be a click or any of the touch events (AFAIK – I only tested click and touchstart)."
		// Play the file.
		// noteOn is the older version of start()
		if (source.start)
		{
			source.start(0);
		}
		else
		{
			(source as any).noteOn(0);
		}
	}
	
	public addSound(
		name: string,
		urlOrBlob: string | Blob,
		volume = 1,
		isBackgroundSound: boolean = false,
		isLooping: boolean = false
	): boolean
	{
		let sound: SoundModel | null = this.getByName(name);
		
		if (sound)
		{
			sound.volume = volume;
			if (sound.gainNode !== null)
			{
				sound.gainNode.gain.value = volume;
			}
			return true;
		}
		
		sound = new SoundModel(urlOrBlob, name, volume, isLooping);
		sound.isMuted = this._isMuted;
		
		if (isBackgroundSound)
		{
			this._backgroundSounds.push(sound);
			this.signalBackgroundSounds.set(this._backgroundSounds);
		}
		else
		{
			this._sounds.push(sound);
			this.signalSounds.set(this._sounds);
		}
		
		return true;
	}
	
	public addBackgroundSound(name: string, urlOrBlob: string | Blob, volume: number = 1): boolean
	{
		return this.addSound(name, urlOrBlob, volume, true, true);
	}
	
	public playSound(
		name: string,
		isRestarting: boolean,
		volume: number | null = null,
		onPlay: (() => void) | null = null
	): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (!this.audioContext || !sound)
		{
			return;
		}
		
		sound.play(this.audioContext, isRestarting, volume).then(() => {
			if (onPlay)
			{
				onPlay();
			}
		});
	}
	
	public stopSound(name: string): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (!sound)
		{
			return;
		}
		
		sound.stop();
	}
	
	public pauseSound(name: string): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (!sound)
		{
			return;
		}
		
		sound.pause();
	}
	
	public removeSound(name: string): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (!sound)
		{
			return;
		}
		
		sound.delete();
		
		if (this._sounds.includes(sound))
		{
			this._sounds.splice(this._sounds.indexOf(sound), 1);
			this.signalSounds.set(this._sounds);
		}
		else if (this._backgroundSounds.includes(sound))
		{
			this._backgroundSounds.splice(this._backgroundSounds.indexOf(sound), 1);
			this.signalBackgroundSounds.set(this._backgroundSounds);
		}
	}
	
	public stopAllBackgroundSounds(): void
	{
		this._currentBackgroundSoundName = null;
		
		this._backgroundSounds.forEach((soundModel: SoundModel): void => {
			if (soundModel.isPlaying)
			{
				soundModel.stop();
				soundModel.stopType = StopTypeEnum.stop;
			}
		});
	}
	
	public toggleIsMuted(): void
	{
		if (this._isMuted)
		{
			this.unmuteAllSounds();
		}
		else
		{
			this.muteAllSounds();
		}
	}
	
	public unmuteAllSounds(): void
	{
		if (!this._isMuted)
		{
			return;
		}
		
		this._isMuted = false;
		
		this._backgroundSounds.forEach((soundModel: SoundModel): void => {
			soundModel.isMuted = false;
		});
		this._sounds.forEach((soundModel: SoundModel): void => {
			soundModel.isMuted = false;
		});
		
		if (this._currentBackgroundSoundName)
		{
			this.playBackgroundSound(this._currentBackgroundSoundName);
		}
	}
	
	public muteAllSounds(): void
	{
		if (this._isMuted)
		{
			return;
		}
		
		this._isMuted = true;
		
		if (!this.audioContext)
		{
			return;
		}
		
		const tempBackSound = this._currentBackgroundSoundName;
		this._backgroundSounds.forEach((soundModel: SoundModel): void => {
			soundModel.isMuted = true;
			
			if (soundModel.isPlaying || soundModel.soundTimeoutId !== -1)
			{
				this.fadeOutSound(soundModel.name, 500, StopTypeEnum.pause);
			}
		});
		this._currentBackgroundSoundName = tempBackSound;
		
		this._sounds.forEach((soundModel: SoundModel): void => {
			soundModel.isMuted = true;
			
			if (soundModel.isPlaying || soundModel.soundTimeoutId !== -1)
			{
				soundModel.gainNode?.gain.setValueAtTime(0, this.audioContext!.currentTime);
			}
		});
	}
	
	public getByName(name: string): SoundModel | null
	{
		let sound = this._sounds.find((value: SoundModel): SoundModel | null => {
			if (value.name === name)
			{
				return value;
			}
			
			return null;
		});
		
		if (!sound)
		{
			sound = this._backgroundSounds.find((value: SoundModel): SoundModel | null => {
				if (value.name === name)
				{
					return value;
				}
				
				return null;
			});
		}
		
		return sound ?? null;
	}
	
	public playBackgroundSound(name: string, durationMs: number = 2000, stopType: StopTypeEnum = StopTypeEnum.stop): void
	{
		// first set off all other background sounds
		// and set off this._currentBackgroundSoundName
		this._backgroundSounds.forEach((soundModel): void => {
			if (soundModel.name !== name)
			{
				this.fadeOutSound(soundModel.name, durationMs, stopType);
			}
		});
		
		// then play the background sound
		this._backgroundSounds.forEach((soundModel): void => {
			if (soundModel.name === name)
			{
				this._currentBackgroundSoundName = name;
				this.playSound(name, false, soundModel.volume);
			}
		});
	}
	
	public fadeOutSound(name: string, durationMs: number = 1, stopType: StopTypeEnum = StopTypeEnum.noStop): void
	{
		if (this._currentBackgroundSoundName === name)
		{
			this._currentBackgroundSoundName = null;
		}
		
		const sound: SoundModel | null = this.getByName(name);
		
		if (!sound || sound.gainNode === null)
		{
			return;
		}
		
		this.tweenSoundVolume(name, 0, durationMs, stopType);
	}
	
	public fadeInSound(name: string, durationMs: number = 1): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (!sound || sound.gainNode === null)
		{
			return;
		}
		
		this.tweenSoundVolume(name, sound.volume, durationMs);
	}
	
	public tweenSoundVolume(
		name: string,
		targetVolume: number,
		durationMs: number = 1,
		stopType: StopTypeEnum = StopTypeEnum.noStop
	): void
	{
		const sound: SoundModel | null = this.getByName(name);
		
		if (
			!sound ||
			sound.gainNode === null ||
			(!sound.isPlaying && targetVolume === 0) // if it is not playing, it should be set off and do nothing
		)
		{
			return;
		}
		
		sound.stopType = stopType;
		
		const startVolume: number = sound.gainNode.gain.value; // get start volume from the current one
		
		this.playSound(name, false); // after start play sound
		sound.gainNode.gain.value = startVolume; // the volume needs to be set like it was before
		
		if (startVolume === targetVolume) // if it is already set, do nothing more
		{
			return;
		}
		
		const timeoutWaitMs: number = 50;
		let currentDurationMs: number = durationMs;
		let amount: number = 0;
		
		if (sound.soundTimeoutId !== -1)
		{
			window.clearInterval(sound.soundTimeoutId);
			sound.soundTimeoutId = -1;
		}
		
		sound.soundTimeoutId = window.setInterval((): void => {
			currentDurationMs -= timeoutWaitMs;
			amount = 1 - currentDurationMs / durationMs;
			
			if (sound.gainNode !== null)
			{
				sound.gainNode.gain.value = this.lerp(
					startVolume,
					targetVolume,
					amount
				);
			}
			
			if (currentDurationMs <= 0)
			{
				if (sound.gainNode !== null)
				{
					sound.gainNode.gain.value = targetVolume;
				}
				
				if (sound.stopType === StopTypeEnum.stop)
				{
					this.stopSound(sound.name);
				}
				else if (sound.stopType === StopTypeEnum.pause)
				{
					this.pauseSound(sound.name);
				}
				
				window.clearInterval(sound.soundTimeoutId);
				sound.soundTimeoutId = -1;
			}
		}, timeoutWaitMs);
	}
	
	public crossFadeSounds(
		fromName: string,
		toName: string,
		durationMs: number = 1,
		stopType: StopTypeEnum = StopTypeEnum.noStop
	): void
	{
		this.fadeOutSound(fromName, durationMs, stopType);
		this.fadeInSound(toName, durationMs);
	}
	
	private lerp(value1: number, value2: number, amount: number): number
	{
		amount = amount < 0 ? 0 : amount;
		amount = amount > 1 ? 1 : amount;
		return value1 + (value2 - value1) * amount;
	}
	
	// WORKS
	/*document.addEventListener('click', () => {
		this.backgroundSound.play();
		console.log('Autoplay started!');
	}, { once: true });*/
}