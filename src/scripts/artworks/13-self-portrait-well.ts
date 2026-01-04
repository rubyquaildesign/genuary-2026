// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '13-self-portrait-well';
const day = '13';
const prompt =
	'Self portrait. For example, get started with a very basic human face, a few circles or oval shapes. How far can you improve this by adding features that actually look like you. Try adding eyes, eyelashes, hair, and make a few parameters or colors variable. Even though you are aiming for a self portrait, it might be fun to render some random variations as well.';
// #endregion
// -------------------------------- DAY 13 --------------------------------
// Self portrait. For example, get started with a very basic human face, a few circles or oval shapes. How far can you improve this by adding features that actually look like you. Try adding eyes, eyelashes, hair, and make a few parameters or colors variable. Even though you are aiming for a self portrait, it might be fun to render some random variations as well.

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
