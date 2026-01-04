import { Vec } from '@rubyquaildesign/quail-art';
import { polygonCentroid } from 'd3';

const TAU = Math.PI * 2;

/**
 * Create a star shape with alternating outer and inner radii
 * @param {number} points - Number of star points
 * @param {number} outerRadius - Outer radius of the star
 * @param {number} innerRadius - Inner radius of the star
 * @returns {Array<Vec>} Loop representing the star
 */
export function createStar(
	points: number,
	outerRadius: number,
	innerRadius: number,
) {
	const loop = [];
	const totalPoints = points * 2;

	for (let i = 0; i < totalPoints; i++) {
		const angle = (i / totalPoints) * TAU - Math.PI / 2; // Start at top
		const radius = i % 2 === 0 ? outerRadius : innerRadius;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		loop.push(new Vec([x, y]));
	}

	return loop;
}

/**
 * Create a heart shape
 * @param {number} size - Size of the heart
 * @returns {Array<Vec>} Loop representing the heart
 */
export function createHeart(size:number) {
	const loop = [];
	const segments = 64; // Number of points for smooth curve

	for (let i = 0; i <= segments; i++) {
		const t = (i / segments) * TAU;
		// Parametric heart equation
		const x = size * 16 * Math.sin(t) ** 3;
		const y =
			-size *
			(13 * Math.cos(t) -
				5 * Math.cos(2 * t) -
				2 * Math.cos(3 * t) -
				Math.cos(4 * t));
		loop.push(new Vec([x, y]));
	}
    const pg = polygonCentroid(loop);
	return loop.map(v => v.add(pg));
}

/**
 * Create an arch/arc shape
 * @param {number} radius - Radius of the arch
 * @param {number} startAngle - Start angle in radians
 * @param {number} endAngle - End angle in radians
 * @param {number} [segments=32] - Number of segments for the curve
 * @returns {Array<Vec>} Loop representing the arch
 */
export function createArch(radius:number, startAngle:number, endAngle:number, segments = 32) {
	const loop = [];
	const angleRange = endAngle - startAngle;

	for (let i = 0; i <= segments; i++) {
		const angle = startAngle + (i / segments) * angleRange;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		loop.push(new Vec([x, y]));
	}

	return loop;
}

/**
 * Create a regular polygon
 * @param {number} sides - Number of sides
 * @param {number} radius - Radius of the circumscribed circle
 * @returns {Array<Vec>} Loop representing the polygon
 */
export function createPolygon(sides:number, radius:number) {
	const loop = [];

	for (let i = 0; i < sides; i++) {
		const angle = (i / sides) * TAU - Math.PI / 2;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		loop.push(new Vec([x, y]));
	}

	return loop;
}

/**
 * Create a circle as a loop
 * @param {number} radius - Radius of the circle
 * @param {number} [segments=64] - Number of segments
 * @returns {Array<Vec>} Loop representing the circle
 */
export function createCircle(radius:number, segments = 64) {
	const loop = [];

	for (let i = 0; i < segments; i++) {
		const angle = (i / segments) * TAU;
		const x = Math.cos(angle) * radius;
		const y = Math.sin(angle) * radius;
		loop.push(new Vec([x, y]));
	}

	return loop;
}
