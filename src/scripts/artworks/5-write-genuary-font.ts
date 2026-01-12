// #region generated
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
import { drawDot, Vec } from '@rubyquaildesign/quail-art';
import {
	type Force,
	forceSimulation,
	type SimulationLinkDatum,
	type SimulationNodeDatum,
} from 'd3';
import forceBounce from 'd3-force-bounce';
import genImage from '$assets/genuary-image.png';
import {
	ColorPaletteBlue,
	ColorPaletteCyan,
	ColorPaletteGreen,
	ColorPaletteMagenta,
	ColorPaletteRed,
	ColorPaletteYellow,
	ColorPrimitiveNeutral900,
} from '$scripts/colors';
import { createRandom } from '$scripts/maths/utils';

const id = '5-write-genuary-font';
const day = '5';
const prompt = 'Write “Genuary”. Avoid using a font.';
// #endregion
// -------------------------------- DAY 5 --------------------------------
// Write “Genuary”. Avoid using a font.
interface Node extends SimulationNodeDatum {
	mass: number;
	velocity: number;
	isInGen: boolean;
	x: number;
	y: number;
	col: string;
}
const cs = [
	ColorPaletteRed,
	ColorPaletteYellow,
	ColorPaletteGreen,
	ColorPaletteCyan,
	ColorPaletteBlue,
	ColorPaletteMagenta,
];
const R = createRandom(Math.random());
const flr = Math.floor;
const ticksPerSecond = 60;
const externalMaxSpeed = 2;
interface BounceForce<Node extends SimulationNodeDatum>
	extends Force<Node, SimulationLinkDatum<Node>> {
	elasticity: (t: number) => this;
	radius(fn: (node: Node) => number): this;
	mass(fn: (node: Node) => number): this;
	onImpact: (fn: (node1: Node, node2: Node) => unknown) => this;
}
const frictionConstant = 0.98;
async function main() {
	const genuaryMask = await fetch(genImage.src)
		.then((response) => response.blob())
		.then((blob) => createImageBitmap(blob))
		.then((bmp) => {
			const o = new OffscreenCanvas(genImage.width, genImage.height);
			const c = o.getContext('2d')!;
			c.drawImage(bmp, 0, 0);
			const d = c.getImageData(0, 0, o.width, o.height);
			return range(genImage.width).map((x) =>
				range(genImage.height).map((y) => {
					const pxl = d.data[y * o.width * 4 + x * 4];
					return !(pxl > 128);
				}),
			);
		});
	const maskSizeX = canvasWidth / genuaryMask.length;
	const maskSizeY = canvasHeight / genuaryMask[0].length;

	const force: BounceForce<Node> = forceBounce();
	const nodes = range(Math.floor((canvasWidth * canvasHeight) / (32 * 32))).map(
		(i) => {
			const p = R.pointInRec(0, 0, canvasWidth, canvasHeight);
			const inGen =
				genuaryMask[flr(p.x / maskSizeX)][flr(p.y / maskSizeY)] ?? false;
			const rTheta = R.angle();
			const vx = Math.cos(rTheta) * (inGen ? 0.1 : 2);
			const vy = Math.sin(rTheta) * (inGen ? 0.1 : 2);
			const velocity = Math.sqrt(vx ** 2 + vy ** 2);
			const n: Node = {
				mass: inGen ? 5 : 1,
				isInGen: inGen,
				velocity,
				vx,
				col: R.pick(cs),
				vy,
				x: p.x,
				y: p.y,
				index: i,
			};
			return n;
		},
	);
	const ctx = canvas.getContext('2d')!;
	const myForce = (() => {
		let nodes: Node[];
		const force = (_alpha: number) => {
			for (const n of nodes) {
				if (n.x > canvasWidth) n.x -= canvasWidth;
				if (n.y > canvasHeight) n.y -= canvasHeight;
				if (n.x < 0) n.x += canvasWidth;
				if (n.y < 0) n.y += canvasHeight;
				n.isInGen =
					genuaryMask[flr(n.x / maskSizeX)][flr(n.y / maskSizeY)] ?? false;
				n.mass = n.isInGen ? 5 : 1;
				if (n.isInGen && Math.abs(n.vx ?? 0) + Math.abs(n.vy ?? 0) > 0.0001) {
					const v = new Vec(n.vx ?? 0, n.vy ?? 0);
					n.velocity = v.magnitude() * frictionConstant;
					const { x, y } = v.mul(frictionConstant);
					n.vx = x;
					n.vy = y;
				} else {
					const v = new Vec(n.vx ?? 0, n.vy ?? 0);
					n.velocity = v.magnitude();
					const mul = Math.min(1.01, externalMaxSpeed / n.velocity);
					const { x, y } = v.mul(mul);
					n.vx = x;
					n.vy = y;
				}
			}
		};
		Object.assign(force, {
			initialize(newNodes: Node[]) {
				nodes = newNodes;
			},
		});
		return force;
	}) satisfies () => Force<Node, SimulationLinkDatum<Node>>;
	console.log(force);

	const sim = forceSimulation<Node>(nodes)
		.alphaDecay(0)
		.alphaTarget(1)
		.randomSource(() => R.source())
		.force('myForce', myForce())
		.velocityDecay(0)
		.force(
			'bForce',
			force
				.mass((n) => n.mass)
				.elasticity(1)
				.radius((_n) => 6)
				.onImpact((a, b) => {
					const cc = a.velocity > b.velocity ? a.col : b.col;
					a.col = cc;
					b.col = cc;
				}),
		);
	sim.stop();
	async function draw(
		_frameNumber: number,
		_frameT: number,
		_elapsed: number,
		_stop: () => void,
	) {
		const c = Math.min(Math.max(1, Math.floor((_frameT / 1000) * 120)), 8);
		sim.tick(c);
		ctx.fillStyle = ColorPrimitiveNeutral900;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		for (const n of nodes) {
			ctx.fillStyle = n.col;
			ctx.beginPath();
			drawDot([n.x, n.y], 6, ctx, 'fill');
		}
	}

	createArtwork(draw, {
		canvas,
		length: 60 * 6,
		videoName: id,
		save: false,
	});
}
main();
