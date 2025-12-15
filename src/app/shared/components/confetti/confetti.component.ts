import {AfterViewInit, Component, ElementRef, inject, Input, NgZone, ViewChild} from '@angular/core';
import {NgStyle} from '@angular/common';

import {ConfettiConfiguration} from './templates';
import * as variation from "./systems/variation";
import {resolvableShapes} from './systems/shapes';
import {Color, Vector} from './components';
import * as random from './systems/random';
import {ModuleBuilder} from './systems/modules';
import {settings} from './settings';
import * as sources from './systems/sources';
import {Emitter} from './particles/emitter';
import * as util from './util';
import {scene} from './index';

@Component({
	selector: 'app-confetti',
	standalone: true,
	imports: [
		NgStyle
	],
	templateUrl: './confetti.component.html',
	styleUrl: './confetti.component.scss'
})
export class ConfettiComponent implements AfterViewInit
{
	protected readonly ngZone = inject(NgZone);
	
	@ViewChild('confetti') public confetti!: ElementRef<HTMLDivElement>;
	
	@Input({required: true}) public left!: string;
	@Input({required: true}) public top!: string;
	@Input({required: true}) public width!: string;
	@Input({required: true}) public height!: string;
	@Input({required: true}) public scale!: number;
	
	@Input() public color1: string = '#1786a8';
	@Input() public color2: string = '#a6254c';
	@Input() public color3: string = '#a710f2';
	
	public ngAfterViewInit(): void
	{
		//	const rect = this.confetti.nativeElement.getBoundingClientRect();
		//	console.log('pos', rect, this.left)
	}
	
	public callConfetti(): void
	{
		//	const rect = this.confetti.nativeElement.getBoundingClientRect();
		//	const midPoint: number = rect.left + rect.width * 0.5;
		//	console.log('pos', rect, this.left, midPoint)
		
		this.ngZone.runOutsideAngular(() => {
			resolvableShapes["image1"] =
				`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26" fill="none">
<path d="M21.569 0.887229L15.2737 25.6131L0.935634 15.8961L21.569 0.887229Z" fill="${this.color1}"/>
</svg>`;
			
			resolvableShapes["image2"] =
				`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26" fill="none">
<path d="M21.569 0.887229L15.2737 25.6131L0.935634 15.8961L21.569 0.887229Z" fill="${this.color2}"/>
</svg>`;
			
			resolvableShapes["image3"] =
				`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="26" viewBox="0 0 22 26" fill="none">
<path d="M21.569 0.887229L15.2737 25.6131L0.935634 15.8961L21.569 0.887229Z" fill="${this.color3}"/>
</svg>`;
			
			settings.debug = false;
			settings.gravity = 1000 * this.scale;
			
			this.confetti2(this.confetti.nativeElement, {
				count: variation.range(10, 20),
				spread: variation.range(10, 25),
				color: () => Color.fromHex('#10bcf2'), //.fromHsl(random.randomRange(0, 0), 0, 0),
				size: variation.skew(0.8 * this.scale, 0.2 * this.scale),
				speed: variation.range(500 * this.scale, 800 * this.scale),
				rotation: () => new Vector(0, 0, Math.random() * -36.5),//.scale(0),
				shapes: ["image1", "image2", "image3"], //, "circle"],
				modules: [
					new ModuleBuilder()
						.drive("size")
						.by((t) => Math.min(1, t * 1.2))
						.relative()
						.build(),
					new ModuleBuilder()
						.drive("rotation")
						.by((t) => new Vector(140, 200, 260).scale(t))
						/*.by((t: number, p: Particle | undefined) => {
						//	console.log(p?.location.x, parseInt(this.width, 10) * this.scale)
							return new Vector(0, 0, p?.location.x);
						})*/
						.relative()
						.build()
				]
			});
		});
	}
	
	private confetti2(
		source: sources.DynamicSourceType,
		options?: Partial<ConfettiConfiguration>
	): Emitter
	{
		const populated = util.overrideDefaults(
			{
				count: variation.range(20, 40),
				spread: variation.range(35, 45),
				speed: variation.range(300, 600),
				size: variation.skew(1, 0.2),
				rotation: () => random.randomUnitVector().scale(180),
				color: () => Color.fromHsl(random.randomRange(0, 360), 100, 70),
				modules: [
					new ModuleBuilder()
						.drive("size")
						.by((t) => Math.min(1, t * 3))
						.relative()
						.build(),
					new ModuleBuilder()
						.drive("rotation")
						.by((t) => new Vector(140, 200, 260).scale(t))
						.relative()
						.build()
				],
				shapes: ["square", "circle"]
			},
			options
		);
		
		return scene.current.createEmitter({
			emitterOptions: {
				loops: 4,
				duration: 0.5,
				modules: populated.modules
			},
			emissionOptions: {
				rate: 0,
				bursts: [{time: 0, count: populated.count}],
				
				sourceSampler: sources.dynamicSource(source),
				angle: variation.skew(
					-90,
					variation.evaluateVariation(populated.spread) ?? 0
				),
				initialLifetime: 2.5,
				initialSpeed: populated.speed,
				initialSize: populated.size,
				initialRotation: populated.rotation,
				initialColor: populated.color
			},
			rendererOptions: {
				shapeFactory: populated.shapes
			}
		});
	}
}
