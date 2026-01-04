import * as d3 from 'd3';

const _lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const _clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
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
	const canvas: HTMLCanvasElement;
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
}
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
window.clamp = _clamp
window.mapNumber = _mapNumber;
window.randomInt = d3.randomInt;
window.random = d3.randomUniform;
window.PI = Math.PI;
window.TAU = Math.PI * 2;
