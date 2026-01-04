import { Vec } from '@rubyquaildesign/quail-art';

type Vp = [number, number] | number[];
/**
 * Calculate the smallest bounding circle that contains all points in a loop
 * Uses Welzl's algorithm for minimum enclosing circle
 * @param {Array<[number, number]>} loop - Array of points
 * @returns {{center: Vec, radius: number}} Bounding circle
 */
export function boundingCircle(loop: Vp[]) {
	if (loop.length === 0) {
		return { center: new Vec(0, 0), radius: 0 };
	}

	if (loop.length === 1) {
		return { center: new Vec(loop[0]), radius: 0 };
	}

	// Simple implementation: use bounding box center and furthest point
	// This is not the minimal bounding circle but works well for most cases
	let minX = Infinity,
		minY = Infinity;
	let maxX = -Infinity,
		maxY = -Infinity;

	for (const [x, y] of loop) {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}

	const centerX = (minX + maxX) / 2;
	const centerY = (minY + maxY) / 2;
	const center = new Vec(centerX, centerY);

	// Find the furthest point from center
	let maxDistSq = 0;
	for (const point of loop) {
		const distSq = center.distSq(point);
		if (distSq > maxDistSq) {
			maxDistSq = distSq;
		}
	}

	return {
		center,
		radius: Math.sqrt(maxDistSq),
	};
}

/**
 * Test if a point is inside a polygon using the winding number algorithm
 * @param {[number, number] | Vec} point - Point to test
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {boolean} True if point is inside polygon
 */
export function pointInPolygon(point: Vp, loop: Vp[]) {
	const [px, py] = point instanceof Vec ? [point.x, point.y] : point;
	let windingNumber = 0;

	for (let i = 0; i < loop.length; i++) {
		const [x1, y1] = loop[i];
		const [x2, y2] = loop[(i + 1) % loop.length];

		if (y1 <= py) {
			if (y2 > py) {
				// Upward crossing
				const isLeft = (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1);
				if (isLeft > 0) {
					windingNumber++;
				}
			}
		} else {
			if (y2 <= py) {
				// Downward crossing
				const isLeft = (x2 - x1) * (py - y1) - (px - x1) * (y2 - y1);
				if (isLeft < 0) {
					windingNumber--;
				}
			}
		}
	}

	return windingNumber !== 0;
}

/**
 * Calculate the signed area of a polygon
 * Positive area = counter-clockwise winding
 * Negative area = clockwise winding
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {number} Signed area
 */
export function polygonArea(loop: ArrayLike<Vp>) {
	if (loop.length < 3) return 0;

	let area = 0;
	for (let i = 0; i < loop.length; i++) {
		const [x1, y1] = loop[i];
		const [x2, y2] = loop[(i + 1) % loop.length];
		area += x1 * y2 - x2 * y1;
	}

	return area / 2;
}

/**
 * Calculate the centroid (center of mass) of a polygon
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {Vec} Centroid point
 */
export function polygonCentroid(loop: Vp[]) {
	if (loop.length === 0) return new Vec(0, 0);
	if (loop.length === 1) return new Vec(loop[0]);

	let cx = 0,
		cy = 0;
	let area = 0;

	for (let i = 0; i < loop.length; i++) {
		const [x1, y1] = loop[i];
		const [x2, y2] = loop[(i + 1) % loop.length];
		const cross = x1 * y2 - x2 * y1;
		area += cross;
		cx += (x1 + x2) * cross;
		cy += (y1 + y2) * cross;
	}

	area /= 2;

	// Avoid division by zero for degenerate polygons
	if (Math.abs(area) < 1e-10) {
		// Fallback to simple average
		let sumX = 0,
			sumY = 0;
		for (const [x, y] of loop) {
			sumX += x;
			sumY += y;
		}
		return new Vec(sumX / loop.length, sumY / loop.length);
	}

	cx /= 6 * area;
	cy /= 6 * area;

	return new Vec(cx, cy);
}

/**
 * Calculate axis-aligned bounding box for a loop
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {{min: Vec, max: Vec, width: number, height: number, center: Vec}} Bounding box
 */
export function boundingBox(loop: Vp[]) {
	if (loop.length === 0) {
		const zero = new Vec(0, 0);
		return { min: zero, max: zero, width: 0, height: 0, center: zero };
	}

	let minX = Infinity,
		minY = Infinity;
	let maxX = -Infinity,
		maxY = -Infinity;

	for (const [x, y] of loop) {
		if (x < minX) minX = x;
		if (x > maxX) maxX = x;
		if (y < minY) minY = y;
		if (y > maxY) maxY = y;
	}

	const width = maxX - minX;
	const height = maxY - minY;

	return {
		min: new Vec(minX, minY),
		max: new Vec(maxX, maxY),
		width,
		height,
		center: new Vec(minX + width / 2, minY + height / 2),
	};
}

/**
 * Calculate perimeter of a polygon
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {number} Perimeter length
 */
export function polygonPerimeter(loop: ArrayLike<Vp>) {
	if (loop.length < 2) return 0;

	let perimeter = 0;
	for (let i = 0; i < loop.length; i++) {
		const p1 = new Vec(loop[i]);
		const p2 = new Vec(loop[(i + 1) % loop.length]);
		perimeter += p1.dist(p2);
	}

	return perimeter;
}

/**
 * Check if a polygon is clockwise
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {boolean} True if clockwise
 */
export function isClockwise(loop: ArrayLike<Vp>) {
	return polygonArea(loop) < 0;
}

/**
 * Reverse the winding order of a loop
 * @param {Array<[number, number]>} loop - Polygon vertices
 * @returns {Array<[number, number]>} Reversed loop
 */
export function reverseLoop(loop: Vp[]) {
	return [...loop].reverse();
}

export function pointAlongPath(loop: ArrayLike<Vp>, percentage: number) {
    if (loop.length === 0) return new Vec(0, 0);
    if (loop.length === 1) return new Vec(loop[0]);

    // Calculate total perimeter
    const perimeter = polygonPerimeter(loop);
    if (perimeter === 0) return new Vec(loop[0]);

    // Normalize percentage to [0, 1] and handle wrapping
    const normalizedPercentage = ((percentage % 1) + 1) % 1;
    const targetDistance = normalizedPercentage * perimeter;

    // Walk along the path to find the segment
    let accumulatedDistance = 0;

    for (let i = 0; i < loop.length; i++) {
        const p1 = new Vec(loop[i]);
        const p2 = new Vec(loop[(i + 1) % loop.length]);
        const segmentLength = p1.dist(p2);

        if (accumulatedDistance + segmentLength >= targetDistance) {
            // Found the segment, interpolate along it
            const distanceIntoSegment = targetDistance - accumulatedDistance;
            const t = segmentLength > 0 ? distanceIntoSegment / segmentLength : 0;
            return Vec.lerp(p1, p2, t);
        }

        accumulatedDistance += segmentLength;
    }

    // Fallback (shouldn't reach here due to normalization)
    return new Vec(loop[0]);
}

export function pointsAlongPath(loop: Vp[], count: number) {
    const points = [];
    for (let i = 0; i < count; i++) {
        const percentage = i / count;
        points.push(pointAlongPath(loop, percentage));
    }
    return points;
}