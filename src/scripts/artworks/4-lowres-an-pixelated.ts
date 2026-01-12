// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
import { scaleQuantile } from 'd3';
import tgpu from 'typegpu';
import * as d from 'typegpu/data';
import { ColorPrimitiveNeutral200 } from '$scripts/colors';
import * as LR from '$shader/lowres.mjs';
import {
	layout0 as copyLayout,
	type entrypoints,
	layout0,
	lowresMainFactory,
	Uniforms,
} from '$shader/lowres-main.mjs';

const id = '4-lowres-an-pixelated';
const day = '4';
const prompt =
	'Lowres. An image or graphic with low resolution, where details are simplified or pixelated.';
// #endregion
// -------------------------------- DAY 4 --------------------------------
// Lowres. An image or graphic with low resolution, where details are simplified or pixelated.
const ctx = canvas.getContext('2d')!;
const [lowResW, lowResH] = [40, 30];
const ratio = canvasHeight / lowResH;
const imageCanvas = new OffscreenCanvas(ratio, ratio);
const imageContext = imageCanvas.getContext('2d', {
	willReadFrequently: true,
})!;

const imageCount = 16;
type ImageEntry = {
	image: ImageData;
	value: number;
};
const images: ImageEntry[] = [];
for (const i of range(imageCount)) {
	imageContext.fillStyle = '#000';
	imageContext.fillRect(0, 0, ratio, ratio);
	imageContext.clearRect(0, 0, ratio, ratio);
	if (i < 12) {
		const t = i / 12;
		const diam = ratio - 2;
		const adjustedRad = (t * diam) / 2;
		imageContext.beginPath();
		imageContext.fillStyle = '#ffff';
		imageContext.ellipse(
			diam / 2 + 1,
			diam / 2 + 1,
			adjustedRad,
			adjustedRad,
			0,
			0,
			TAU,
		);
		imageContext.fill();
	} else {
		const t = (i - 12) / (imageCount - 12);
		const rt = (ratio / 2) * (1 - t);
		imageContext.beginPath();
		imageContext.fillStyle = '#ffff';
		imageContext.roundRect(0, 0, ratio, ratio, rt);
		imageContext.fill();
	}
	const id = imageContext.getImageData(0, 0, ratio, ratio);
	const px = id.data;
	let vCount = 0;
	for (const ix of range(id.width))
		for (const iy of range(id.height)) {
			const v = px.at(iy * id.width * 4 + ix * 4);
			if (v && v > 128) {
				vCount++;
				px.set([255, 255, 255, 255], iy * id.width * 4 + ix * 4);
			} else {
				px.set([0, 0, 0, 0], iy * id.width * 4 + ix * 4);
			}
		}
	const value = vCount / (id.width * id.height);
	console.log(value);
	images.push({
		image: id,
		value,
	});
}

const valueRatio = scaleQuantile(
	images.map((i) => i.value),
	range(images.length),
);
console.log(range(32).map((i) => valueRatio(i / 31)));
ctx.font = '72px solid system-ui, sans-serif';
ctx.fillStyle = ColorPrimitiveNeutral200;
ctx.fillText('click/tap to begin', canvasWidth * 0.4, canvasHeight / 2);
const cvs: HTMLCanvasElement = canvas.cloneNode(false) as HTMLCanvasElement;
async function main() {
	const root = await tgpu.init();
	const mod = LR.lowresFactory(root.device);
	const video = document.createElement('video');
	await new Promise<void>((res, rej) => {
		canvas.addEventListener(
			'click',
			() => {
				console.log(canvas.parentNode);

				canvas.parentNode?.replaceChild(cvs, canvas);
				window.canvas = cvs;
				const stream = navigator.mediaDevices
					.getUserMedia({
						video: true,
					})
					.then((s) => {
						video.srcObject = s;
					})
					.catch(() => {
						alert('failed to get media');
						rej();
					});
				video.addEventListener('error', rej);

				video.requestVideoFrameCallback(() => res());

				video.play().catch(rej);
			},
			{ once: true },
		);
	}).catch(() => {
		alert('an error happened');
		throw new Error();
	});
	const ctx = canvas.getContext('webgpu')!;
	const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
	ctx.configure({
		device: root.device,
		format: presentationFormat,
	});
	const plL = root.device.createPipelineLayout({
		bindGroupLayouts: [root.unwrap(LR.layout0)],
	});
	const copyPLLayout = root.device.createPipelineLayout({
		bindGroupLayouts: [root.unwrap(copyLayout)],
	});
	console.log(copyLayout.entries);
	const copyMod = lowresMainFactory(root.device);
	const circleTex = root.device.createTexture({
		format: 'rgba8unorm',
		size: [ratio * 4, ratio * 4],
		usage:
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
	for (const i of range(16)) {
		root.device.queue.copyExternalImageToTexture(
			{
				source: images[i].image,
				origin: [0, 0],
				flipY: true,
			},
			{
				texture: circleTex,
				origin: [(i % 4) * ratio, Math.floor(i / 4) * ratio],
			},
			[ratio, ratio],
		);
	}
	const copyRenderPipeline = root.device.createRenderPipeline({
		layout: copyPLLayout,
		vertex: {
			module: copyMod,
			entryPoint: 'vs' satisfies keyof typeof entrypoints.vertex,
		},
		fragment: {
			module: copyMod,
			entryPoint: 'fs2d' satisfies keyof typeof entrypoints.fragment,
			targets: [{ format: presentationFormat }],
		},
		primitive: {
			topology: 'triangle-list',
		},
	});
	const cpuPipeline = root.device.createComputePipeline({
		layout: plL,
		compute: {
			module: mod,
			entryPoint: 'comp_shader' satisfies keyof typeof LR.entrypoints.compute,
		},
	});

	const tex = root['~unstable']
		.createTexture({
			format: 'rgba8unorm',
			size: [lowResW, lowResH],
		})
		.$usage('storage', 'sampled');
	const sampler = root.device.createSampler({
		addressModeU: 'clamp-to-edge',
		addressModeV: 'clamp-to-edge',
		magFilter: 'nearest',
		minFilter: 'nearest',
	});
	const bufff = root
		.createBuffer(Uniforms, { pixelSize: ratio })
		.$usage('uniform');
	const copyBG = root.createBindGroup(layout0, {
		postSampler: sampler,
		postTexture2d: tex,
		texArr: circleTex,
		uni: bufff,
	});
	const uni = root
		.createBuffer(LR.Uniforms, { resolution: d.vec2u(lowResW, lowResH) })
		.$usage('uniform');
	async function draw(
		_frameNumber: number,
		_frameT: number,
		_elapsed: number,
		_stop: () => void,
	) {
		const ext = root.device.importExternalTexture({ source: video });
		const bg = root.createBindGroup(LR.layout0, {
			ourSampler: sampler,
			ourTexture: ext,
			tex: tex,
			uni,
		});
		const enc = root.device.createCommandEncoder();
		const pass = enc.beginComputePass();
		pass.setPipeline(cpuPipeline);
		pass.setBindGroup(0, root.unwrap(bg));
		pass.dispatchWorkgroups(Math.ceil(lowResW / 8), Math.ceil(lowResH / 8));
		pass.end();
		const pass2 = enc.beginRenderPass({
			colorAttachments: [
				{
					clearValue: [0.3, 0.3, 0.3, 1],
					loadOp: 'clear',
					storeOp: 'store',
					view: ctx.getCurrentTexture().createView(),
				},
			],
		});
		pass2.setPipeline(copyRenderPipeline);
		pass2.setBindGroup(0, root.unwrap(copyBG));
		pass2.draw(3);
		pass2.end();
		const buff = enc.finish();
		root.device.queue.submit([buff]);
	}

	createArtwork(draw, {
		canvas,
		length: 60 * 6,
		videoName: id,
		save: false,
	});
}
main();
