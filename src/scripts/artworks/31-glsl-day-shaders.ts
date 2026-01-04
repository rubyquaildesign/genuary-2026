// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '31-glsl-day-shaders';
const day = '31';
const prompt = 'GLSL day. Create an artwork using only shaders.';
// #endregion
// -------------------------------- DAY 31 --------------------------------
// GLSL day. Create an artwork using only shaders.

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
