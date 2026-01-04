// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '30-its-not-feature';
const day = '30';
const prompt = 'Its not a bug, its a feature.';
// #endregion
// -------------------------------- DAY 30 --------------------------------
// Its not a bug, its a feature.

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
