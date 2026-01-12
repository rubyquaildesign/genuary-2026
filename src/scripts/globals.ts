import { Vec } from '@rubyquaildesign/quail-art';
import * as d3 from 'd3';

const _lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const _clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));
const _mapNumber = (
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number,
) => d3.scaleLinear([inMin, inMax], [outMin, outMax])(value);
declare global {
	const canvasWidth: number;
	const canvasHeight: number;
	const canvasAspectRatio: number;
	const centerX: number;
	const centerY: number;
	const range: typeof d3.range;
	const lerp: typeof _lerp;
	const clamp: typeof _clamp;
	const mapNumber: typeof _mapNumber;
	const randomInt: typeof d3.randomInt;
	const random: typeof d3.randomUniform;
	let canvas: HTMLCanvasElement;
	const PI: number;
	const TAU: number;
	interface Window {
		canvasWidth: number;
		canvasHeight: number;
		canvasAspectRatio: number;
		centerX: number;
		centerY: number;
		range: typeof d3.range;
		lerp: typeof _lerp;
		clamp: typeof _clamp;
		mapNumber: typeof _mapNumber;
		randomInt: typeof d3.randomInt;
		random: typeof d3.randomUniform;
		canvas: HTMLCanvasElement;
		PI: number;
		TAU: number;
	}
	interface Array<T> {
		toVec: T extends number ? (this: Array<T>) => Vec : never;
		toVecLoop: T extends number[] ? (this: Array<T>) => Vec[] : never;
		toVecShape: T extends number[][] ? (this: Array<T>) => Vec[][] : never;
	}
}
Array.prototype.toVec = function () {
	if (this.length < 2) throw new Error('not enough items to be a vector');
	if (typeof this[0] !== 'number' || typeof this[1] !== 'number')
		throw new Error('The first two items need to be numbers');
	return new Vec(this[0], this[1]);
};
Array.prototype.toVecLoop = function () {
	if (!this.every((e) => Array.isArray(e)))
		throw new Error('Children are not arrays');
	return this.map((e) => e.toVec());
};
Array.prototype.toVecShape = function () {
	if (!this.every((e) => Array.isArray(e)))
		throw new Error('Children are not arrays');
	return this.map((e) => e.toVecLoop());
};
window.canvas =
	document.querySelector('#canvas') ?? document.createElement('canvas');
const W = window.canvas.width;
const H = window.canvas.height;
window.canvasWidth = W;
window.canvasHeight = H;
window.canvasAspectRatio = W / H;
window.centerX = W / 2;
window.centerY = H / 2;
window.range = d3.range;
window.lerp = _lerp;
window.clamp = _clamp;
window.mapNumber = _mapNumber;
window.randomInt = d3.randomInt;
window.random = d3.randomUniform;
window.PI = Math.PI;
window.TAU = Math.PI * 2;
