// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '15-create-an-seen';
const day = '15';
const prompt = 'Create an invisible object where only the shadows can be seen.';
// #endregion
// -------------------------------- DAY 15 --------------------------------
// Create an invisible object where only the shadows can be seen.

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
