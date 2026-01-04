// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '26-recursive-grids-again';
const day = '26';
const prompt =
	'Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again.';
// #endregion
// -------------------------------- DAY 26 --------------------------------
// Recursive Grids. Split the canvas into a grid of some kind and recurse on each cell again and again.

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
