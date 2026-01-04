// #region generated

import {
	ColorPrimitiveNeutral900,
	ColorPrimitiveRed400,
} from '$scripts/colors';
import {
	boundingBox,
	boundingCircle,
	pointInPolygon,
	pointsAlongPath,
} from '$scripts/geometry';
import '$scripts/globals';
import {
	bSpline,
	bsplineMat,
	buildClipper,
	type Clip,
	drawLoop,
	drawShape,
	minDistFromCentroid,
	Vec,
} from '@rubyquaildesign/quail-art';
import { distinctBy } from '@std/collections';
import { descend } from '@std/data-structures';
import { sample } from '@std/random';
import * as T from '@texel/color';
import {
	Delaunay,
	polygonArea,
	polygonCentroid,
	randomLcg,
	randomUniform,
} from 'd3';
import { createArtwork, drawDot } from '$scripts/renderer';
import { createCircle, createHeart, createStar } from '$scripts/shapes';

const id = '1-one-color-one-shape';
const day = '1';
const prompt = 'One color, one shape.';
type Vp = [number, number];
// #endregion
// -------------------------------- DAY 1 --------------------------------
// One color, one shape.

const bg = T.parse(ColorPrimitiveNeutral900, T.sRGB);
const red = T.parse(ColorPrimitiveRed400, T.OKLCH);
const myRandom = randomLcg(Math.random());
red[2] = randomUniform.source(myRandom)(0, 360)();
const [xR, yR] = [canvasWidth / 2, canvasHeight / 2];
const radius = Math.min(xR, yR) - 120;
// biome-ignore lint/style/noNonNullAssertion: I know it exists
const ctx = canvas.getContext('2d')!;

// We run by center;
ctx.translate(canvasWidth / 2, canvasHeight / 2);
ctx.fillStyle = T.serialize(bg, T.sRGB);
ctx.lineWidth = 3;
ctx.fillRect(-xR, -yR, canvasWidth, canvasHeight);
const maxHeartSize = 60;
const heartRatio = maxHeartSize / radius;
function createLoopForRadius(rad: number, clip: Clip) {
	const sourceCircle = createCircle(rad);
	const sourceStar = createStar(7, rad + 32, rad * 0.8);
	const sourceHeart = createHeart(heartRatio * rad);
	const circPoints = pointsAlongPath(sourceCircle, 12);
	const starPoints = pointsAlongPath(sourceStar, 12);
	const heartPoints = pointsAlongPath(sourceHeart, 12);
	const shapePtsSelector = randomInt.source(myRandom)(3);
	const shape = range(12).map(
		(i) => [circPoints, starPoints, heartPoints][shapePtsSelector()][i],
	);
	const bs = bSpline(shape, 5, 'closed', true);
	const pg = range(128).map((i) => bsplineMat(bs, i / 128));
	const off = clip.offset(pg, 32)?.sort(sortByLoopSize)[0];
	if (!off) return null;
	let mainLoop = pointsAlongPath(off, 128);
	if (polygonArea(mainLoop) < 0) mainLoop = mainLoop.toReversed();
	const bc = boundingCircle(mainLoop);
	return mainLoop.map((v) => v.sub(bc.center));
}
async function createMainShape(clip: Clip) {
	try {
		const mainLoop = createLoopForRadius(radius, clip);

		if (!mainLoop) return null;
		const innerLoop = clip
			.offset(mainLoop, -32, 'miter')
			?.toSorted(sortByLoopSize)[0];
		const outerLoop = clip
			.offset(mainLoop, 32, 'miter')
			?.toSorted(sortByLoopSize)[0];
		if (!innerLoop || !outerLoop) return null;
		return { mainLoop, innerLoop, outerLoop };
	} catch (err) {
		console.error(err);
		return null;
	}
}

async function setup() {
	const clip = await buildClipper(3e8);
	let shape: Awaited<ReturnType<typeof createMainShape>> | null = null;
	let shapeAttempts = 0;
	while (shape == null && shapeAttempts < 1000) {
		shape = await createMainShape(clip);
		shapeAttempts++;
	}
	if (!shape) return null;
	const innerExtent = boundingBox(shape.innerLoop);
	const vorExtent: [number, number, number, number] = [
		...(innerExtent.min as [number, number]),
		...(innerExtent.max as [number, number]),
	];
	const rp: Vec[] = [];
	let holeAttempts = 0;
	const xRandom = random.source(myRandom)(vorExtent[0], vorExtent[2]);
	const yRandom = random.source(myRandom)(vorExtent[1], vorExtent[3]);
	while (rp.length < 8 && holeAttempts < 1000) {
		const Vp: [number, number] = [xRandom(), yRandom()];
		if (pointInPolygon(Vp, shape.innerLoop)) {
			rp.push(new Vec(Vp));
		}
		holeAttempts++;
	}
	for (const _ of range(32)) {
		const d = Delaunay.from(rp);
		const v = d.voronoi(vorExtent);
		for (const rawPG of v.cellPolygons()) {
			const ix = rawPG.index;
			const clipPG = clip.intersect(rawPG, shape.innerLoop);
			if (!clipPG) continue;
			const pg = clipPG.toSorted(sortByLoopSize)[0];
			const cx = new Vec(polygonCentroid(pg));
			rp[ix] = cx;
		}
	}
	const finalPGs: { pg: Vec[]; ix: number }[] = [];
	const d = Delaunay.from(rp);
	const v = d.voronoi(vorExtent);
	for (const rawPG of v.cellPolygons()) {
		const ix = rawPG.index;
		const clipPG = clip.intersect(rawPG, shape.innerLoop);
		if (!clipPG) continue;
		const pg = clipPG.toSorted(sortByLoopSize)[0];
		finalPGs.push({ pg, ix });
	}
	const pgs = range(5)
		.map(() =>
			sample(finalPGs, {
				prng: myRandom,
				weights: finalPGs.map(({ pg }) => Math.abs(polygonArea(pg))),
			}),
		)
		.filter((e) => e !== undefined);
	const choices = distinctBy(pgs, (e) => e?.ix).map(({ pg, ix }) => ({
		polygon: pg,
		pt: rp[ix],
	}));
	const innerLoops: Vec[][] = choices.map((c) => {
		const cen = polygonCentroid(c.polygon);
		const r = minDistFromCentroid(c.polygon);
		const rot = random.source(myRandom)(0, TAU)();
		const main = shape.mainLoop
			.map((p) =>
				p
					.mul(r / radius)
					.rotate(rot)
					.add(cen),
			)
			.toReversed();
		return main;
	});
	const fullShape = [shape.mainLoop, ...innerLoops];
	const pts: Vec[] = [];
	let ptsAttempt = 0;
	const outRandomX = randomUniform.source(myRandom)(-xR - 32, xR + 32);
	const outRandomY = randomUniform.source(myRandom)(-yR - 32, yR + 32);
	while (
		pts.length <
			Math.floor(
				(canvasWidth * canvasHeight - Math.abs(polygonArea(shape.outerLoop))) /
					(128 * 128),
			) &&
		ptsAttempt < 5000
	) {
		const pt = new Vec(outRandomX(), outRandomY());
		if (!pointInPolygon(pt, shape.outerLoop)) {
			pts.push(pt);
		}
		ptsAttempt++;
	}
	const rotRandomiser = randomUniform.source(myRandom)(
		(-1 / 16) * TAU,
		(1 / 16) * TAU,
	);
	const rotationData = pts.map((v, i) => ({
		rotation: 0,
		rSpeed: rotRandomiser(),
	}));

	let rot = 0;

	const rotSpeed = rotRandomiser();
	async function draw(
		_frameNumber: number,
		_frameT: number,
		_elapsed: number,
		_stop: () => void,
	) {
		ctx.fillStyle = T.serialize(bg, T.sRGB);
		ctx.fillRect(-xR, -yR, canvasWidth, canvasHeight);
		ctx.fillStyle = T.serialize(red, T.OKLCH);

		const d = Delaunay.from(pts);
		const v = d.voronoi([-xR - 32, -yR - 32, xR + 32, yR + 32]);
		const cpg = shape?.outerLoop.map((v) => v.rotate(rot));
		if (!cpg) return;
		const radMap = new Map<number, number>();
		for (const rawPG of v.cellPolygons()) {
			const cutPG = clip.difference(rawPG, cpg);
			if (!cutPG) continue;
			const loop = cutPG.toSorted(sortByLoopSize)[0];
			const nps = polygonCentroid(loop);
			const radius = minDistFromCentroid(loop);
			radMap.set(rawPG.index, radius);
			pts[rawPG.index] = new Vec(nps);
			drawDot(pts[rawPG.index], 16, ctx, 'fill');
		}

		ctx.save();
		ctx.rotate(rot);
		ctx.fillStyle = T.serialize(red, T.OKLCH);
		drawShape(fullShape, ctx, 'fill');
		ctx.restore();
		for (const [i, [x, y]] of pts.entries()) {
			ctx.save();
			const rot = rotationData[i];
			const rad = radMap.get(i);
			if (rad) {
				const s = rad / radius;
				ctx.translate(x, y);
				ctx.rotate(rot.rotation);
				ctx.scale(s, s);
				drawLoop(fullShape[0], true, ctx, 'fill');
			}
			ctx.restore();
			rot.rotation += (rot.rSpeed * _frameT) / 1000;
		}
		rot += (rotSpeed * _frameT) / 1000;
	}

	createArtwork(draw, {
		canvas,
		length: 60 * 6,
		videoName: id,
		save: false,
	});
}
setup();
const sortByLoopSize = (a: Vp[], b: Vp[]) =>
	descend(Math.abs(polygonArea(a)), Math.abs(polygonArea(b)));
