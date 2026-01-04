// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '11-quine-a-code';
const day = '11';
const prompt =
	'Quine. A Quine is a form of code poetry, it’s a computer program that outputs exactly its own source code.';
// #endregion
// -------------------------------- DAY 11 --------------------------------
// Quine. A Quine is a form of code poetry, it’s a computer program that outputs exactly its own source code.

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
