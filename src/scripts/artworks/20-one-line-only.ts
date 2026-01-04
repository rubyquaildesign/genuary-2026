// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '20-one-line-only';
const day = '20';
const prompt = 'One line. An artwork that is made of a single line only.';
// #endregion
// -------------------------------- DAY 20 --------------------------------
// One line. An artwork that is made of a single line only.

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
