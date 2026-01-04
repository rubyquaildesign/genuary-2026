import { TextEncoder } from 'node:util';

export async function formatWithBiome(outputString: string): Promise<string> {
	const formatted = new Deno.Command('pnpm', {
		args: 'exec biome format --stdin-file-path=file.ts --fix'.split(' '),
		stdin: 'piped',
		stdout: 'piped',
	});
	const o = formatted.spawn();
	const writer = o.stdin.getWriter();
	const enc = new TextEncoder();
	writer.write(
		enc.encode(outputString.replace(/^.+biome-ignore-all.+?$/im, '')),
	);
	await writer.close();
	const output = await o.stdout.text();
	console.log({ output });
	return output;
}
