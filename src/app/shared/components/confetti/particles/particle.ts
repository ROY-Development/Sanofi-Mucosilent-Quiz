import {Color, Vector} from "../components";
import {overrideDefaults} from "../util";

/**
 * Represents a set of options that can be used to create the particle.
 */
export type ParticleCreationOptions = Partial<
	Omit<Particle, "id" | "initialLifetime" | "initialSize" | "initialRotation">
>;

export class Particle
{
	id: symbol;
	lifetime: number;
	size: number;
	location: Vector;
	rotation: Vector;
	velocity: Vector;
	color: Color;
	opacity: number;
	initialLifetime: number;
	initialSize: number;
	initialRotation: Vector;
	
	constructor(options: ParticleCreationOptions)
	{
		const populatedOptions = overrideDefaults(
			{
				lifetime: 0,
				size: 1,
				location: Vector.zero,
				rotation: Vector.zero,
				velocity: Vector.zero,
				color: Color.white,
				opacity: 1
			},
			options
		);
		
		// Generate a symbolic ID.
		this.id = Symbol();
		
		// Assign various properties, together with some initials for later reference.
		this.size = this.initialSize = populatedOptions.size;
		this.lifetime = this.initialLifetime = populatedOptions.lifetime;
		this.rotation = this.initialRotation = populatedOptions.rotation;
		
		this.location = populatedOptions.location;
		this.velocity = populatedOptions.velocity;
		this.color = populatedOptions.color;
		this.opacity = populatedOptions.opacity;
	}
}
