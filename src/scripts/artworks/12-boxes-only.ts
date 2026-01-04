// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '12-boxes-only';
const day = '12';
const prompt = 'Boxes only.';
// #endregion
// -------------------------------- DAY 12 --------------------------------
// Boxes only.

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
