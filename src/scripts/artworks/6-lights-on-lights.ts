// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '6-lights-on-lights';
const day = '6';
const prompt =
	'Lights on/off. Make something that changes when you switch on or off the “digital” lights.';
// #endregion
// -------------------------------- DAY 6 --------------------------------
// Lights on/off. Make something that changes when you switch on or off the “digital” lights.

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
