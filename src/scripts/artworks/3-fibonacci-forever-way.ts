// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
import { drawDot } from '@rubyquaildesign/quail-art';
import * as T from '@texel/color';
import { easeCubicOut, randomLcg, scaleLinear, zip } from 'd3';
import { createNoise2D } from 'simplex-noise';
import pp from '$assets/paper.png';
import {
	ColorPrimitiveBlue400,
	ColorPrimitiveCyan400,
	ColorPrimitiveGreen400,
	ColorPrimitiveMagenta400,
	ColorPrimitiveNeutral900,
	ColorPrimitiveRed400,
	ColorPrimitiveYellow400,
} from '$scripts/colors';

const id = '3-fibonacci-forever-way';
const day = '3';
const prompt =
	'Fibonacci forever. Create a work that uses the Fibonacci sequence in some way.';
// #endregion
// -------------------------------- DAY 3 --------------------------------
// Fibonacci forever. Create a work that uses the Fibonacci sequence in some way.
const squareColors = [
	ColorPrimitiveRed400,
	ColorPrimitiveYellow400,
	ColorPrimitiveGreen400,
	ColorPrimitiveCyan400,
	ColorPrimitiveBlue400,
	ColorPrimitiveMagenta400,
	ColorPrimitiveRed400,
];
function memoFib() {
	const c: number[] = [];
	let m = 0;
	let x1 = 0;
	let x2 = 1;

	return (e: number) => {
		function* fib(start: number, end?: number): Generator<number> {
			end = end ?? start + 1;

			while (m <= start) {
				c[m] = x1;
				[x1, x2] = [x2, x1 + x2];
				m++;
			}

			if (start < end) {
				yield c[start];
				yield* fib(start + 1, end);
			}
		}
		return fib(e).next().value;
	};
}
const fibonacci = memoFib();

const noiseImage = await fetch(pp.src)
	.then((d) => d.blob())
	.then((d) => createImageBitmap(d));
console.log();
const squareScale = scaleLinear(
	range(0, squareColors.length).map((d) => d / squareColors.length),
	squareColors,
)
	.interpolate((a, b) => (t) => {
		return mixColor(a, b, t);
	})
	.clamp(true);
const ctx = canvas.getContext('2d')!;
function mixColor(a: string, b: string, amt = 0.5) {
	return T.serialize(
		zip(T.parse(a, T.OKLab), T.parse(b, T.OKLab)).map(([a, b]) =>
			T.lerp(a, b, amt),
		),
		T.OKLab,
		T.sRGB,
	);
}
interface FibPoint {
	startA: number;
	radius: number;
	offset: number;
	startTime: number;
	speedBoost: number;
	i: number;
	color: string;
	angVel: number;
}
const goldenAngle = Math.PI * (3 - Math.sqrt(5));
let nextLoop = 0;
let pointsDrawnSoFarThisLoop = 0;
let pointsToDrawThisLoop = 0;
let pointCount = 0;
const fibPointStack = new Set<FibPoint>();
const n = createNoise2D(randomLcg(12));
async function draw(
	_frameNumber: number,
	_frameT: number,
	_elapsed: number,
	_stop: () => void,
) {
	const loops = _elapsed / 2000;
	ctx.fillStyle = ColorPrimitiveNeutral900;
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	const RAD = 80;
	if (loops > nextLoop) {
		pointsDrawnSoFarThisLoop = 0;
		pointsToDrawThisLoop = Math.min(fibonacci(nextLoop + 3), 64_000);
		nextLoop++;
	}
	const secondT = loops - Math.floor(loops);
	const toAddThisFrame =
		Math.ceil(secondT * pointsToDrawThisLoop) - pointsDrawnSoFarThisLoop;
	80;
	ctx.fillText(pointsDrawnSoFarThisLoop.toString(), 100, 240);
	if (toAddThisFrame > 0) {
		for (let i = 0; i < toAddThisFrame; i++) {
			if (fibPointStack.size < 1600) {
				fibPointStack.add({
					i: pointCount,
					startA: goldenAngle * pointCount,
					offset: 0,
					speedBoost: 1 + n(pointCount * 37.4321, 0),
					startTime: _elapsed,
					angVel: 0,
					radius: 0,
					color: squareScale(((goldenAngle * pointCount) % TAU) / TAU),
				});
			}
			pointsDrawnSoFarThisLoop++;
			pointCount++;
		}
	}

	ctx.lineWidth = 12;
	ctx.save();
	ctx.translate(canvasWidth / 2, canvasHeight / 2);
	ctx.strokeStyle = ColorPrimitiveNeutral900;
	for (const point of fibPointStack) {
		const l = n(point.i * 32.453, _elapsed / 517) * 2;
		point.angVel += l * (_frameT / 1000);
		point.angVel = clamp(point.angVel, -4, 4);
		point.offset += point.angVel * (_frameT / 1000);
		point.radius += 120 * (_frameT / 1000) + point.speedBoost;
		const D = (Math.max(point.radius, 0.001) * TAU) / 1000;
		const a = point.startA + point.offset / D;
		const x = Math.cos(a) * (point.radius + 80);
		const y = Math.sin(a) * (point.radius + 80);
		if (point.radius > (canvasWidth + 500) / 2) {
			fibPointStack.delete(point);
		}
		ctx.fillStyle = point.color;
		ctx.beginPath();
		drawDot(
			[x, y],
			RAD * easeCubicOut(clamp((_elapsed - point.startTime) / 1000, 0, 1)),
			ctx,
		);
		ctx.fill();
		ctx.stroke();
	}
	ctx.restore();
	ctx.save();
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'multiply';
	ctx.drawImage(noiseImage, 0, 0);
	ctx.restore();
}

createArtwork(draw, {
	canvas,
	length: 60 * 12,
	videoName: id,
	save: false,
});
