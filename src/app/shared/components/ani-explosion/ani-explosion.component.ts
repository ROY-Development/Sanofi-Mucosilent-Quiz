import {ChangeDetectorRef, Component, inject, OnDestroy} from '@angular/core';
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
	private changeDetectorRef = inject(ChangeDetectorRef);
	
	protected x: number = 500;
	protected y: number = 1500;
	private width: number = 100;
	private height: number = 100;
	
	private config = {
		particleNumber: 150,
		maxParticleSize: 10,
		maxSpeed: 40,
		colorVariation: 50,
		opacity: 1,
		
		// Gravity in px/s^2 (higher = falls faster)
		gravity: 1400,
		
		// Optional: Air resistance (0 = none, otherwise e.g., 0.5..2)
		drag: 0.0
	};
	
	private colorPalette = {
		matter: [
			'#24122AFF',
			'#4E242AFF',
			'#FCB260FF',
			'#FDEE98FF'
			/*'#f00',
			'#932d2d',
			'#7c0202',*/
		]
	};
	
	protected particles: Array<Particle> = [];
	private centerX: number = this.width / 2;
	private centerY: number = this.height / 2;
	
	private readonly appLoopService: AppLoopService = new AppLoopService(this.loop.bind(this));
	
	constructor()
	{
		this.appLoopService.stop();
		this.appLoopService.setRuntime(0);
		this.appLoopService.init('AniExplosionComponent');
	}
	
	public ngOnDestroy(): void
	{
		this.appLoopService.stop();
	}
	
	public callExplosion(): void
	{
		this.initParticles(this.config.particleNumber, this.centerX, this.centerY);
		
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
	
	private initParticles(numParticles: number, x: number, y: number)
	{
		for (let i = 0; i < numParticles; i++)
		{
			const x = Math.round(Math.random() * this.width);
			const y = Math.round(Math.random() * this.height);
			const r = Math.ceil(Math.random() * this.config.maxParticleSize);
			const c: string = this.colorPalette.matter[Math.floor(Math.random() * this.colorPalette.matter.length)];
			
			const s = Math.pow(Math.ceil(Math.random() * this.config.maxSpeed), .7);
			const d = Math.round(Math.random() * 360);
			
			// Calculate initial speed from direction+speed once
			const angleRad = (d * Math.PI) / 180;
			const speedPxPerSec = s * 60; // retains the “old feeling” (px/frame@60fps -> px/s)
			const vx = Math.cos(angleRad) * speedPxPerSec;
			const vy = Math.sin(angleRad) * speedPxPerSec;
			
			this.particles.push(new Particle(x, y, r, c, s, d, 1, vx, vy));
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
