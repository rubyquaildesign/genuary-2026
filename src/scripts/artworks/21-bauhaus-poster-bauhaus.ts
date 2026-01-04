// #region generated
// @generated-flag - Delete when editing
import { createArtwork } from '$scripts/renderer';
import '$scripts/globals';
const id = '21-bauhaus-poster-bauhaus';
const day = '21';
const prompt =
	'Bauhaus Poster. Create a poster design inspired by the German art school Bauhaus.';
// #endregion
// -------------------------------- DAY 21 --------------------------------
// Bauhaus Poster. Create a poster design inspired by the German art school Bauhaus.

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
