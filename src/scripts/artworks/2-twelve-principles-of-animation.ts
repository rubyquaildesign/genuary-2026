// #region generated

import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
import {
	bSpline,
	cubicBSplineToBezierSpline,
	drawBSpline,
	drawLoop,
	type Vec,
} from '@rubyquaildesign/quail-art';
import { zip } from '@std/collections';
import * as T from '@texel/color';
import type { Tween } from '@tweenjs/tween.js';
import { Bezier } from 'bezier-js';
import {
	ColorPaletteBlue,
	ColorPaletteGreen,
	ColorPaletteMagenta,
	ColorPaletteRed,
	ColorPaletteYellow,
	ColorPrimitiveBlue400,
	ColorPrimitiveCyan400,
	ColorPrimitiveGreen400,
	ColorPrimitiveMagenta400,
	ColorPrimitiveNeutral200,
	ColorPrimitiveNeutral900,
	ColorPrimitiveRed400,
	ColorPrimitiveYellow400,
} from '$scripts/colors';
import pp from '../../assets/paper.png';

const id = '2-twelve-principles-of-animation';
const day = '2';
const prompt = 'Twelve principles of animation.';
// #endregion
// -------------------------------- DAY 2 --------------------------------
// Twelve principles of animation.
const ctx = canvas.getContext('2d')!;
const noiseImage = await fetch(pp.src)
	.then((d) => d.blob())
	.then((d) => createImageBitmap(d));
const squareColors = [
	ColorPrimitiveRed400,
	mixColor(ColorPrimitiveRed400, ColorPrimitiveYellow400),
	ColorPrimitiveYellow400,
	mixColor(ColorPrimitiveGreen400, ColorPrimitiveYellow400),
	ColorPrimitiveGreen400,
	mixColor(ColorPrimitiveGreen400, ColorPrimitiveCyan400),
	ColorPrimitiveCyan400,
	mixColor(ColorPrimitiveBlue400, ColorPrimitiveCyan400),
	ColorPrimitiveBlue400,
	mixColor(ColorPrimitiveBlue400, ColorPrimitiveMagenta400),
	ColorPrimitiveMagenta400,
	mixColor(ColorPrimitiveRed400, ColorPrimitiveMagenta400),
];
abstract class Rect {
	abstract startPos: Vec;
	abstract startFrame: Vec;
	abstract tween: Tween;
	abstract startX: number;
	abstract speed: number;
	abstract color:string;
	abstract draw(): void;
	abstract onStart(): void;

	abstract onLeave(): void;
}
class SquashRect extends Rect {
	startPos: Vec;
	startFrame: Vec;
	tween: Tween;
	startX: number;
	speed: number;
	color: string = squareColors[0];
	draw(): void {
		throw new Error('Method not implemented.');
	}
	onStart(): void {
		throw new Error('Method not implemented.');
	}
	onLeave(): void {
		throw new Error('Method not implemented.');
	}
	constructor(startX: number, startY:number) {
		super();
		this.startPos = new Vec(startX,startY);
	}
}
const [CW, CH] = [canvasWidth, canvasHeight];
ctx.fillStyle = ColorPrimitiveNeutral900;
ctx.fillRect(0, 0, CW, CH);
ctx.lineWidth = 16;
for (const [i, c] of squareColors.entries()) {
	ctx.fillStyle = c;
	ctx.strokeStyle = ColorPrimitiveNeutral900;
	ctx.beginPath();
	ctx.roundRect(300 + i * 320, 300, 400, 400, 16);
	ctx.fill();
	ctx.stroke();
}

ctx.beginPath();
ctx.globalCompositeOperation = 'multiply';
ctx.globalAlpha = 0.8;
ctx.drawImage(noiseImage, 0, 0);
ctx.stroke();
function mixColor(a: string, b: string, amt = 0.5) {
	return T.serialize(
		zip(T.parse(a, T.OKLab), T.parse(b, T.OKLab)).map(([a, b]) =>
			T.lerp(a, b, amt),
		),
		T.OKLab,
		T.sRGB,
	);
}

async function draw(
	_frameNumber: number,
	_frameT: number,
	_elapsed: number,
	_stop: () => void,
) {}

createArtwork(draw, {
	canvas,
	length: 60 * 6,
	videoName: id,
	save: false,
});
