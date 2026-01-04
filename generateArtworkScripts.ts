import { formatWithBiome } from './formatWithBiome';
import artworks from './src/content/artworks.json' with { type: 'json' };

const templatePath = './src/template/artwork.template.ts';
const outputDirectory = './src/scripts/artworks';

(async () => {
	const template = await Deno.readTextFile(templatePath).catch(() => null);
	if (!template) throw new Error('No Template File');
	const artworkArray = artworks.artworks;
	for (const artwork of artworkArray) {
		const scriptPath = `${outputDirectory}/${artwork.id}.ts`;
		const existingArtwork = await Deno.readTextFile(scriptPath).catch(
			() => null,
		);
		if (existingArtwork && !existingArtwork.includes('@generated-flag')) {
			console.log(
				`Artwork ${artwork.id} - ${artwork.title}, already exists, and has been edited, skipping`,
			);
			continue;
		}
		const outputString = Object.entries(artwork).reduce(
			(previous, [key, value]) => {
				return previous.replaceAll(`__${key.toUpperCase()}__`, String(value));
			},
			template,
		);
		const output = await formatWithBiome(outputString);

		await Deno.writeTextFile(scriptPath, output);
	}
})();
