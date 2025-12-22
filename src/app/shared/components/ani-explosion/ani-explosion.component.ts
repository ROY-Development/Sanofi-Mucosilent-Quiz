import {ChangeDetectorRef, Component, inject, Input, NgZone, OnDestroy} from '@angular/core';
import {AppLoopService} from '../../../core/services/app-loop.service';

class Particle
{
	constructor(
		public x: number,
		public y: number,
		public r: number,
		public color: string,
		public speed: number,
		public angle: number,
		public opacity: number = 1,
		public vx: number = 0,
		public vy: number = 0,
		public opacitySpeed: number = 1.2 * Math.random() + .2
	)
	{
	}
}

@Component({
	selector: 'app-ani-explosion',
	standalone: false,
	templateUrl: './ani-explosion.component.html',
	styleUrl: './ani-explosion.component.scss'
})
export class AniExplosionComponent implements OnDestroy
{
	private ngZone = inject(NgZone);
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	@Input({required: false}) public width: number = 100;
	@Input({required: false}) public height: number = 100;
	@Input({required: false}) public colorPalette = [
		'#24122AFF',
		'#4E242AFF',
		'#FCB260FF',
		'#FDEE98FF'
		/*'#f00',
		'#932d2d',
		'#7c0202',*/
	];
	@Input({required: false}) public patternType: number = 0;
	/// @Input({required: false}) public scratchFree01ImageUrl: string = 'none';
	// protected readonly signalScratchFree01ImageUrl = signal<string>('none');
	
	private config = {
		maxSpeed: 40,
		opacity: 1,
		
		// Gravity in px/s^2 (higher = falls faster)
		gravity: 1400,
		
		// Optional: Air resistance (0 = none, otherwise e.g., 0.5..2)
		drag: 0.0
	};
	
	protected particles: Array<Particle> = [];
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('AniExplosionComponent', this.ngZone);
	}
	
	/*public ngOnChanges(changes: SimpleChanges): void
	{
		if ('scratchFree01ImageUrl' in changes)
		{
			this.signalScratchFree01ImageUrl.set(this.scratchFree01ImageUrl);
		}
	}*/
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
	}
	
	public callExplosion(
		x: number = 0,
		y: number = 0,
		count: number = 10,
		angleDeg?: number,
		spreadDeg: number = 90,
		maxParticleSize: number = 10
	): void
	{
		this.initParticles(x, y, count, angleDeg, spreadDeg, maxParticleSize);
		
		this.appLoopService.start();
	}
	
	private updateParticleModel(p: Particle, delta: number): void
	{
		const dtRaw = delta / 1000;
		const dt = Math.min(dtRaw, 1 / 30);
		
		// Gravity: Downward acceleration
		p.vy += this.config.gravity * dt;
		
		// Optional: simple air resistance (brakes vx/vy evenly)
		if (this.config.drag > 0)
		{
			const damping = Math.max(0, 1 - this.config.drag * dt);
			p.vx *= damping;
			p.vy *= damping;
		}
		
		// Integrate position
		p.x += p.vx * dt;
		p.y += p.vy * dt;
		
		p.opacity = Math.max(0, p.opacity - p.opacitySpeed * dt);
		
		if (p.opacity <= 0)
		{
			this.particles.splice(this.particles.indexOf(p), 1);
			
			if (this.particles.length <= 0)
			{
				this.appLoopService.stop();
			}
		}
	}
	
	private initParticles(
		x: number,
		y: number,
		count: number,
		angleDeg?: number,
		spreadDeg: number = 90,
		maxParticleSize: number = 10
	): void
	{
		for (let i = 0; i < count; i++)
		{
			const s: number = Math.pow(Math.ceil(Math.random() * this.config.maxSpeed), .7);
			//const d: number = Math.round(Math.random() * 360);
			const d: number =
				typeof angleDeg === 'number'
					? (angleDeg - spreadDeg / 2) + Math.random() * spreadDeg
					: Math.random() * 360;
			
			// Calculate initial speed from direction+speed once
			const angleRad: number = (d * Math.PI) / 180;
			const speedPxPerSec: number = s * 60; // retains the “old feeling” (px/frame@60fps -> px/s)
			const vx: number = Math.cos(angleRad) * speedPxPerSec;
			const vy: number = Math.sin(angleRad) * speedPxPerSec;
			
			const particle = new Particle(
				x, //Math.round(Math.random() * this.width) + x,
				y, //Math.round(Math.random() * this.height) + y,
				Math.ceil(Math.random() * maxParticleSize),
				this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)],
				s,
				d,
				1,
				vx, vy
			);
			
			this.particles.push(particle);
		}
	}
	
	private loop(delta: number): void
	{
		this.particles.forEach((p) => {
			this.updateParticleModel(p, delta);
		});
		
		this.changeDetectorRef.detectChanges();
	}
}
