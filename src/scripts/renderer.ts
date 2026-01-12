import type { CaptureClient } from '@rubyquaildesign/capture';
import { encodeBase64 } from '@std/encoding';

export type RenderFunction = (
	currentFrame: number,
	frameTime: number,
	totalTime: number,
	stop: () => void,
) => Promise<unknown>;

export async function createArtwork(
	renderFunction: RenderFunction,
	options: {
		canvas: HTMLCanvasElement;
		save?: boolean;
		videoName: string;
		length: number;
		staticFrameTime?: number | false;
	},
) {
	const {
		canvas,
		save = false,
		length,
		videoName,
		staticFrameTime = false,
	} = options;
	let running = true;
	let client: CaptureClient;
	if (save && import.meta.env.DEV) {
		const Client = await import('@rubyquaildesign/capture').then(
			(d) => d.CaptureClient,
		);
		client = await Client.create(6969, {
			height: canvas.height,
			width: canvas.width,
			name: videoName,
			maxLength: length,
			frameRate: 60,
			format: 'pngUrl',
			ulid: 'fdsf',
		} as const);
	}
	let frameCount = 0;
	let startTime = 0;
	let lastFrameStart = 0;
	let currentRenderRequest: number;
	const wrapperFunction = async (timestamp: number) => {
		if (frameCount === 0) {
			startTime = timestamp;
			lastFrameStart = startTime;
		}
		const elapsed = timestamp - startTime;
		const lastFrameTime = timestamp - lastFrameStart;
		lastFrameStart = timestamp;
		const [fc, lft, e] =
			staticFrameTime !== false
				? [frameCount, staticFrameTime, frameCount * staticFrameTime]
				: [frameCount, lastFrameTime, elapsed];
		await renderFunction(fc, lft, e, () => {
			running = false;
		}).catch(() => {
			running = false;
		});
		frameCount++;
		if (save && client && running) {
			const url = await new Promise<Blob | null>((res) =>
				canvas.toBlob(res, 'image/png'),
			).then((b) => {
				if (b) {
					return b
						?.arrayBuffer()
						.then((b) => `data:image/png;base64,${encodeBase64(b)}`);
				}
				return null;
			});
			if (url) {
				await client.captureCanvas(url);
			}
		}
		if (running) {
			currentRenderRequest = requestAnimationFrame(wrapperFunction);
		} else {
			cancelAnimationFrame(currentRenderRequest);
			if (client) {
				await client.stop();
			}
		}
	};
	currentRenderRequest = requestAnimationFrame(wrapperFunction);
}

export function drawDot(
	point: [number, number],
	radius: number,
	ctx: CanvasRenderingContext2D,
	drawType?: 'fill' | 'stroke',
) {
	const [x, y] = point;
	if (!ctx) throw Error('no context found');
	ctx.beginPath();
	ctx.ellipse(x, y, radius, radius, 0, 0, TAU);
	ctx.closePath();
	if (drawType === 'fill') ctx.fill();
	if (drawType === 'stroke') ctx.stroke();
}
