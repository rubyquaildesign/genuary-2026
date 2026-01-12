export function createModule(_code: string, _label: string) {
	return (device: GPUDevice) => device;
}
export async function loadTexture(src: string): Promise<ImageBitmap> {
	return fetch(src)
		.then((d) => d.blob())
		.then((d) => createImageBitmap(d));
}
