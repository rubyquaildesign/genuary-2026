// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '27-lifeform-a-growing';
const day = '27';
const prompt =
	'Lifeform. A shape or structure that behaves as if it’s alive or growing.';
// #endregion
// -------------------------------- DAY 27 --------------------------------
// Lifeform. A shape or structure that behaves as if it’s alive or growing.

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
