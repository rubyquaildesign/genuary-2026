/** biome-ignore-all lint/correctness: template */
// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '__ID__';
const day = '__DAY__';
const prompt = '__PROMPT__';
// #endregion
// -------------------------------- DAY __DAY__ --------------------------------
// __PROMPT__

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
