// #region generated
// @generated-flag - Delete when editing
import '$scripts/globals';
import { minDistFromCentroid, Vec } from '@rubyquaildesign/quail-art';
import { arc, Delaunay, polygonCentroid, quadtree } from 'd3';
import pp from '$assets/paper.png';
import {
	ColorPaletteGreen,
	ColorPaletteMagenta,
	ColorPaletteRed,
	ColorPrimitiveNeutral900,
} from '$scripts/colors';
import { createRandom } from '$scripts/maths/utils';
import { createArtwork } from '$scripts/renderer';

const id = '10-polar-coordinates';
const day = '10';
const prompt = 'Polar coordinates.';
// #endregion
// -------------------------------- DAY 10 --------------------------------
// Polar coordinates.
type Vp = [number, number] | Array<number>;
const paper = await fetch(pp.src)
	.then((r) => r.blob())
	.then((r) => createImageBitmap(r));
const ctx = canvas.getContext('2d')!;
class Polar {
	readonly theta: number;
	readonly r: number;
	readonly x: number;
	readonly y: number;
	constructor(theta: number, r: number) {
		if (Number.isNaN(theta) || Number.isNaN(r)) {
			throw new Error('invalid polar coordinate');
		}
		if (r < 0) {
			theta = (Math.PI + theta) % TAU;
			r = Math.abs(r);
		}
		if (theta > TAU) theta = theta % TAU;
		if (theta < 0) theta = TAU - (Math.abs(theta) % TAU);
		this.theta = theta;
		this.r = r;
		this.x = Polar.getX(theta, r);
		this.y = Polar.getY(theta, r);
	}
	private static getX(theta: number, r: number) {
		return Math.cos(theta) * r;
	}
	private static getY(theta: number, r: number) {
		return Math.sin(theta) * r;
	}
	toVec() {
		return new Vec(this.x, this.y);
	}
	static add(a: Polar, b: Polar) {
		return new Polar(a.theta + b.theta, a.r + b.r);
	}
	add(p: Polar) {
		return Polar.add(this, p);
	}
	private clone() {
		return new Polar(this.theta, this.r);
	}
	static sub(a: Polar, b: Polar) {
		return new Polar(a.theta - b.theta, a.r - b.r);
	}
	sub(p: Polar) {
		return Polar.sub(this, p);
	}
	mul(s: number) {
		return new Polar(this.theta * s, this.r * s);
	}
	mag() {
		return this.toVec().magnitude();
	}
	setMag(mag: number) {
		const mg = this.mag();
		const factor = mag / mg;
		return this.mul(factor);
	}
	norm() {
		return this.setMag(1);
	}
	limit(l: number) {
		const mg = this.mag();
		if (mg > l) {
			const factor = l / mg;
			return this.mul(factor);
		}
		return this.clone();
	}
}
const MAX_SPEED = 5;
const MAX_STEER = 0.001;
const CHECK_RANGE = 50;
declare module '@rubyquaildesign/quail-art' {
	interface Vec {
		toPolar(origin?: Vp): Polar;
	}
}
const r = createRandom(12);
Vec.prototype.toPolar = function (origin = [0, 0]) {
	const raw = this.sub(origin);
	const r = Math.sqrt(raw.x ** 2 + raw.y ** 2);
	const a = Math.atan2(raw.y, raw.x);
	return new Polar(a, r);
};
console.log(new Polar(8, 8), new Polar(8, 8).toVec().toPolar());

const BoidType = {
	GREEN: 0,
	RED: 1,
	PURPLE: 2,
} as const;
type BoidType = (typeof BoidType)[keyof typeof BoidType];
class PBoid {
	pos: Polar;
	vel: Polar;
	acc: Polar;
	type: BoidType;
	index: number;
	get isGreen() {
		return this.type === BoidType.GREEN;
	}
	get isRed() {
		return this.type === BoidType.RED;
	}
	constructor(pos: Polar, type: BoidType, index: number) {
		this.pos = new Polar(pos.theta, pos.r);
		this.vel = new Polar(r.float(-1, 0.001), r.float(-1, 0.001));
		this.acc = new Polar(0, 0);
		this.index = index;
		this.type = type;
	}
	appForce(force: Polar) {
		this.acc = this.acc.add(force);
	}
	run(
		applicableBoids: Iterable<PBoid>,
		bounds: [number, number, number, number],
		t: number,
	) {
		this.flock(applicableBoids);
		this.update(t);
		this.wrap(bounds);
	}
	flock(applicableBoids: Iterable<PBoid>) {
		const sep = this.seperate(applicableBoids).mul(3);
		const ali = this.align(applicableBoids).mul(1);
		const coh = this.cohere(applicableBoids).mul(1);
		this.appForce(sep.toPolar());
		this.appForce(ali.toPolar());
		this.appForce(coh.toPolar());
	}
	update(t: number) {
		this.vel = this.vel.add(this.acc.mul(t));
		this.vel = this.vel.limit(MAX_SPEED);
		this.pos = this.pos.add(this.vel.mul(t));
		this.acc = new Polar(0, 0);
	}
	seek(target: Polar) {
		const desired = target.sub(this.pos).setMag(MAX_SPEED);
		const steer = desired.sub(this.vel).limit(MAX_STEER);
		return steer.toVec();
	}
	seperate(applicableBoids: Iterable<PBoid>) {
		let factor = 0;
		let steer = new Vec(0, 0);
		for (const other of applicableBoids) {
			const diff = this.pos.sub(other.pos);
			const d = diff.toVec().magnitude();
			if (d === 0) continue;
			const mul = this.isGreen
				? other.isGreen
					? 0.9
					: other.isRed
						? 2
						: 1
				: this.isRed
					? other.isGreen
						? 0.8
						: 1
					: 1;
			diff.mul((1 / d / d) * mul);
			factor += mul;
			steer = steer.add(diff.toVec());
		}
		if (factor > 1) {
			steer = steer.div(factor);
		}
		if (steer.lenSq() > 0) {
			steer.setLength(MAX_SPEED).sub(this.vel.toVec()).limit(MAX_STEER);
		}
		return steer;
	}
	wrap([minX, minY, maxX, maxY]: [number, number, number, number]) {
		let { x, y } = this.pos.toVec();
		if (x < minX) {
			x += maxX - minX;
		}
		if (y < minY) {
			y += maxY - minY;
		}
		if (x > maxX) {
			x -= maxX - minX;
		}
		if (y > maxY) {
			y -= maxY - minY;
		}
		this.pos = new Vec(x, y).toPolar();
	}
	align(applicableBoids: Iterable<PBoid>) {
		let sum = new Polar(0, 0);
		let count = 0;
		for (const other of applicableBoids) {
			const mul = this.isGreen
				? other.isGreen
					? 1.2
					: other.isRed
						? 0
						: 0.8
				: this.isRed
					? other.isGreen
						? 1.5
						: 1
					: 1;
			sum = sum.add(other.vel.mul(mul));
			count += mul;
		}
		if (count > 0) {
			sum = sum.mul(1 / count).setMag(MAX_SPEED);
			const steer = sum.sub(this.vel).limit(MAX_STEER);
			return steer.toVec();
		}
		return new Vec(0, 0);
	}
	cohere(applicableBoids: Iterable<PBoid>) {
		let sum = new Polar(0, 0);
		let factor = 0;
		let c = 0;
		for (const other of applicableBoids) {
			const thisFactor =
				this.isGreen && other.isRed
					? -0.5
					: this.isGreen && other.isGreen
						? 1.2
						: this.isRed && other.isGreen
							? 2
							: 1;
			sum = sum.add(other.pos.mul(thisFactor));
			factor += thisFactor;
			c++;
		}
		if (factor !== 0) {
			sum = sum.mul(1 / factor);
			return this.seek(sum);
		}
		return new Vec(0, 0);
	}
}
const bounds = [
	-canvasWidth / 2,
	-canvasHeight / 2,
	canvasWidth / 2,
	canvasHeight / 2,
] as [number, number, number, number];
console.log(bounds);

const colors = {
	[BoidType.PURPLE]: ColorPaletteMagenta,
	[BoidType.GREEN]: ColorPaletteGreen,
	[BoidType.RED]: ColorPaletteRed,
};
const [minX, minY, maxX, maxY] = bounds;
const boids = range(Math.floor((canvasWidth * canvasHeight) / (128 * 128))).map(
	(i) => {
		return new PBoid(
			r.pointInRec(minX, minY, maxX, maxY).toPolar(),
			r.weightedSample(
				[BoidType.PURPLE, BoidType.GREEN, BoidType.RED],
				[5, 2, 1],
			),
			i,
		);
	},
);
async function draw(
	_frameNumber: number,
	_frameT: number,
	_elapsed: number,
	_stop: () => void,
) {
	const tree = quadtree(
		boids,
		(d) => d.pos.x,
		(d) => d.pos.y,
	);
	ctx.fillStyle = ColorPrimitiveNeutral900;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	ctx.save();
	ctx.translate(canvasWidth / 2, canvasHeight / 2);
	for (const a of boids) {
		const appBoids: PBoid[] = [];
		tree.visit((q, x0, y0, x1, y1) => {
			const b = 'data' in q ? q.data : null;
			if (b && a !== b) {
				appBoids.push(b);
				return;
			}
			return (
				x0 > a.pos.x + CHECK_RANGE ||
				x1 < a.pos.x - CHECK_RANGE ||
				y0 > a.pos.y + CHECK_RANGE ||
				y1 < a.pos.y - CHECK_RANGE
			);
		});
		a.run(appBoids, bounds, _frameT / 1000);
	}
	const p = Delaunay.from(
		boids,
		(b) => b.pos.x,
		(b) => b.pos.y,
	).voronoi(bounds);

	for (const d of p.cellPolygons()) {
		const b = boids[d.index];
		const c = polygonCentroid(d).toVec();
		const p = c.toPolar();

		const r = minDistFromCentroid(d) * 0.6;
		const aD = (r / (p.r * TAU)) * TAU;
		const thisArc = arc().cornerRadius(r / 4);
		// const ac = arc<unknown, unknown>()
		// 	.innerRadius(p.r - r)
		// 	.outerRadius(p.r + r)
		// 	.startAngle(p.theta - aD)
		// 	.endAngle(p.theta + aD)
		// 	.cornerRadius(r / 4)
		// 	.padRadius(0)
		// 	.padAngle(0)

		// 	.context(ctx);
		ctx.fillStyle = colors[b.type];
		const dd = thisArc({
			endAngle: p.theta + aD + TAU / 4,
			startAngle: p.theta - aD + TAU / 4,
			innerRadius: p.r - r,
			outerRadius: p.r + r,
		});
		const pp = new Path2D(dd!);

		ctx.fill(pp);
		// drawDot(c,r,ctx,'fill');
		// ctx.beginPath();
		// ac(null);
		// ctx.closePath();
		// ctx.fill();
	}
	ctx.globalCompositeOperation = 'multiply';
	ctx.globalAlpha = 0.8;
	ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
	ctx.drawImage(paper, 0, 0);
	ctx.restore();
}

createArtwork(draw, {
	canvas,
	length: 60 * 6,
	videoName: id,
	save: false,
});
