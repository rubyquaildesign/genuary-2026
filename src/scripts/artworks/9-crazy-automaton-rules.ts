// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '9-crazy-automaton-rules';
const day = '9';
const prompt = 'Crazy automaton. Cellular automata with crazy rules.';
// #endregion
// -------------------------------- DAY 9 --------------------------------
// Crazy automaton. Cellular automata with crazy rules.

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
