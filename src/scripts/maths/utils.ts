import { Vec } from '@rubyquaildesign/quail-art';
import { descending, randomLcg } from 'd3';
import { polygonArea } from '$scripts/geometry';

export function createRandom(seed?: number) {
	const source = randomLcg(seed ?? Math.random());

	return {
		source,
		float: (min: number, max: number) => random.source(source)(min, max)(),
		int: (min: number, max: number) => randomInt.source(source)(min, max)(),
		angle: () => random.source(source)(0, TAU)(),
		chance: (p = 0.5) => random.source(source)(0, 1)() < p,
		pick: <T>(arr: readonly T[]): T =>
			arr[randomInt.source(source)(0, arr.length)()],
		// Point in rect using your Vec
		pointInRec: (minX: number, minY: number, maxX: number, maxY: number) =>
			new Vec(
				random.source(source)(minX, maxX)(),
				random.source(source)(minY, maxY)(),
			),
	};
}

export function rejectionSample<T>(
	count: number,
	generate: () => T | null,
	maxAttempts = 1000,
): T[] {
	const results: T[] = [];
	let attempts = 0;
	while (results.length < count && attempts < maxAttempts) {
		const result = generate();
		if (result !== null) results.push(result);
		attempts++;
	}
	return results;
}
export function largestPolygon<T extends ArrayLike<[number, number]>>(
	polygons: T[],
): T | null {
	if (polygons.length === 0) return null;
	return polygons.toSorted(
		(a, b) => Math.abs(polygonArea(b)) - Math.abs(polygonArea(a)),
	)[0];
}
export const sortByArea = <T extends ArrayLike<[number, number]>>(a: T, b: T) =>
	descending(Math.abs(polygonArea(a)), Math.abs(polygonArea(b)));
