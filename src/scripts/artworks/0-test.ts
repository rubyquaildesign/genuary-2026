// #region generated
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
import * as T from '@texel/color';
import { ascending, Delaunay, polygonCentroid, randomLcg } from 'd3';
import tgpu from 'typegpu';
import { arrayOf, vec2f, vec3f, vec3u } from 'typegpu/data';
import { Vec } from '$scripts/maths/vec';
import {
	layout0,
	type TestEntrypoints,
	testFactory,
	VertexSource,
} from '$shader/test.mjs';

const id = '0-test';
const day = '0';
const prompt = 'test';

// #endregion
// -------------------------------- DAY 0 --------------------------------
// test

// const ctx = canvas.getContext('2d')!;
// biome-ignore lint/style/noNonNullAssertion: I know the source of this, it's fine
const ctx = canvas.getContext('webgpu')!;
const root = await tgpu.init();
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
ctx.configure({
	device: root.device,
	format: presentationFormat,
	usage: GPUTextureUsage.RENDER_ATTACHMENT,
});
const input = {
	name: 'Tokyo Night',
	author: '',
	variant: '',
	color_01: '#414868',
	color_02: '#F7768E',
	color_03: '#9ECE6A',
	color_04: '#E0AF68',
	color_05: '#7AA2F7',
	color_06: '#BB9AF7',
	color_07: '#7DCFFF',
	color_08: '#A9B1D6',
	color_09: '#414868',
	color_10: '#F7768E',
	color_11: '#9ECE6A',
	color_12: '#E0AF68',
	color_13: '#7AA2F7',
	color_14: '#BB9AF7',
	color_15: '#7DCFFF',
	color_16: '#C0CAF5',
	background: '#1A1B26',
	foreground: '#C0CAF5',
	cursor: '#C0CAF5',
	hash: '92d0c154a4b8018f67d97cdf1e3cb9a76a41f7d914a12901f9225b5bbf2dd531',
};
const xRad = canvas.width / 2;
const yRad = canvas.height / 2;
const colors = Array.from(
	new Set(Object.values(input).filter((v) => v.startsWith('#'))),
);
const r = random.source(randomLcg(12));
const numColors = colors.length;
const colourBuffer = root
	.createBuffer(
		arrayOf(vec3f, numColors),
		colors.map((c) => {
			const [r, g, b] = T.parse(c, T.sRGBLinear);
			return vec3f(r, g, b);
		}),
	)
	.$usage('storage');
const vertexLayout = tgpu.vertexLayout(arrayOf(VertexSource));
const pipelineLayout = root.device.createPipelineLayout({
	bindGroupLayouts: [root.unwrap(layout0)],
});
const module = testFactory(root.device);
const bindGroup = root.createBindGroup(layout0, {
	colours: colourBuffer,
});
const pipeline = root.device.createRenderPipeline({
	layout: pipelineLayout,
	vertex: {
		module,
		buffers: [root.unwrap(vertexLayout)],
		entryPoint: 'vs_main' satisfies TestEntrypoints,
	},
	fragment: {
		module,
		targets: [{ format: presentationFormat }],
		entryPoint: 'fs_main' satisfies TestEntrypoints,
	},
	primitive: {
		topology: 'triangle-list',
	},
});
const vertexBuffer = root
	.createBuffer(arrayOf(VertexSource, 2000))
	.$usage('vertex');
type VertexInputType = Parameters<(typeof vertexBuffer)['write']>[0];

const particles = colors.map((_, i) => {
	const ang = r(0, TAU)();
	return {
		id: i,
		pos: new Vec(r(-xRad, xRad)(), r(-yRad, yRad)()),
		vel: new Vec(Math.cos(ang), Math.sin(ang)).setLength(3),
	};
});
let d = Delaunay.from(
	particles,
	(p) => p.pos.x,
	(p) => p.pos.y,
);

function getTriangles(
	triangles: Uint32Array,
	points: ArrayLike<number>,
): VertexInputType {
	return range(0, triangles.length, 3)
		.map((triIndex) => {
			const [ii, ij, ik] = triangles
				.slice(triIndex, triIndex + 3)
				.toSorted(ascending);
			const pi = [points[ii * 2], points[ii * 2 + 1]];
			const pj = [points[ij * 2], points[ij * 2 + 1]];
			const pk = [points[ik * 2], points[ik * 2 + 1]];
			return {
				i: {
					index: ii % numColors,
					point: pi,
				},
				j: {
					index: ij % numColors,
					point: pj,
				},
				k: {
					index: ik % numColors,
					point: pk,
				},
			};
		})
		.filter((p) => p != null)
		.flatMap((v) => {
			const vertexIndices = vec3u(v.i.index, v.j.index, v.k.index);
			const pProcess = ([x, y]: number[]) => vec2f(x / xRad, -1 * (y / yRad));
			return [
				{
					position: pProcess(v.i.point),
					colorAmounts: vec3f(1, 0, 0),
					vertexIndices,
				},
				{
					position: pProcess(v.j.point),
					colorAmounts: vec3f(0, 1, 0),
					vertexIndices,
				},
				{
					position: pProcess(v.k.point),
					colorAmounts: vec3f(0, 0, 1),
					vertexIndices,
				},
			] satisfies VertexInputType;
		});
}
const createFullSet = (d: typeof particles) => {
	const opts = [
		[-1, -1],
		[0, -1],
		[1, -1],
		[-1, 0],
		[1, 0],
		[-1, 1],
		[0, 1],
		[1, 1],
	] as const;
	return [
		...d,
		// ...opts.flatMap(([nx, ny]) => {
		// 	return d.map((sourcePcl) => {
		// 		return {
		// 			get id() {
		// 				return sourcePcl.id;
		// 			},
		// 			get pos() {
		// 				return sourcePcl.pos.add([nx * canvasWidth, ny * canvasHeight]);
		// 			},
		// 		};
		// 	});
		// }),
	];
};
async function draw(
	_frameNumber: number,
	_frameT: number,
	_elapsed: number,
	_stop: () => void,
) {
	for (const pcl of particles) {
		pcl.pos = pcl.pos.add(pcl.vel);
		const lastX = pcl.pos.x;
		const lastY = pcl.pos.y;
		pcl.pos[0] =
			lastX < -xRad
				? lastX + canvasWidth
				: lastX > xRad
					? lastX - canvasWidth
					: lastX;
		pcl.pos[1] =
			lastY < -yRad
				? lastY + canvasHeight
				: lastY > yRad
					? lastY - canvasHeight
					: lastY;
	}
	d = Delaunay.from(
		createFullSet(particles),
		(p) => p.pos.x,
		(p) => p.pos.y,
	);
	const v = d.voronoi([-xRad, -yRad, xRad, yRad]);
	for (const pg of v.cellPolygons()) {
		if (pg.index >= particles.length) continue;
		const pcl = particles[pg.index];
		const cen = polygonCentroid(pg);
		pcl.vel = pcl.vel.add(new Vec(...cen).sub(pcl.pos).mul(0.001)).limit(8);
	}
	const trisToDraw = getTriangles(d.triangles, d.points);
	vertexBuffer.writePartial(trisToDraw.map((value, idx) => ({ idx, value })));
	const cmd = root.device.createCommandEncoder();
	const pass = cmd.beginRenderPass({
		colorAttachments: [
			{
				loadOp: 'clear',
				storeOp: 'store',
				view: ctx.getCurrentTexture().createView(),
			},
		],
	});
	pass.setPipeline(pipeline);
	pass.setVertexBuffer(0, root.unwrap(vertexBuffer));
	pass.setBindGroup(0, root.unwrap(bindGroup));
	pass.draw(trisToDraw.length * 3);
	pass.end();
	const buf = cmd.finish();
	root.device.queue.submit([buf]);
}

createArtwork(draw, {
	canvas,
	length: 60 * 6,
	videoName: id,
	save: false,
});
