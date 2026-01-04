// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '28-no-libraries-elements';
const day = '28';
const prompt = 'No libraries, no canvas, only HTML elements.';
// #endregion
// -------------------------------- DAY 28 --------------------------------
// No libraries, no canvas, only HTML elements.

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
