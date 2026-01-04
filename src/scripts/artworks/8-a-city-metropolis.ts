// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '8-a-city-metropolis';
const day = '8';
const prompt = 'A City. Create a generative metropolis.';
// #endregion
// -------------------------------- DAY 8 --------------------------------
// A City. Create a generative metropolis.

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
