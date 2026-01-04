// @ts-check

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import sitemap from '@astrojs/sitemap';
import { toCamelCase, toPascalCase } from '@std/text';
import type { AstroIntegration } from 'astro';
import { defineConfig } from 'astro/config';
import robots from 'astro-robots';
import chokidar, { type FSWatcher } from 'chokidar';
import glob from 'fast-glob';
import { generate } from 'tgpu-gen';
import type { Plugin } from 'vite';
import { linkBuildExtension, staticBuildExtension } from 'wesl-plugin';
import rollupVite from 'wesl-plugin/vite';
import { WgslReflect } from 'wgsl_reflect';
import { formatWithBiome } from './formatWithBiome';

// ============================================================================
// Constants
// ============================================================================

const SHADER_SOURCE_DIR = 'src/shaders';
const SHADER_OUTPUT_DIR = '.shader-data';
const SHADER_EXTENSION = '.wesl';

// ============================================================================
// WESL Linker
// ============================================================================

type LoadFunction = (path: string) => Promise<string>;

interface WeslLinker {
	processFile(path: string): Promise<string | null>;
}

function createWeslLinker(): WeslLinker {
	const typesPlugin = rollupVite({
		extensions: [linkBuildExtension, staticBuildExtension],
		weslToml: './wesl.toml',
	}) as Plugin;

	const load = (typesPlugin.load as LoadFunction).bind({
		addWatchFile() {},
	});

	return {
		async processFile(path: string): Promise<string | null> {
			const output = await load(`${path}?static`);
			const match = /(?<=export const wgsl = `).+(?=`;\n)/is.exec(output);
			return match?.[0] ?? null;
		},
	};
}

const weslLinker = createWeslLinker();

// ============================================================================
// Code Generation
// ============================================================================

interface ProcessedShader {
	outputPath: string;
	code: string;
}

function processShaderCode(
	inputPath: string,
	inputCode: string,
	shaderDir: string,
): ProcessedShader | null {
	try {
		const workingDir = cwd();
		const shaderRoot = resolve(workingDir, shaderDir);
		const outputFolder = resolve(workingDir, SHADER_OUTPUT_DIR);

		const fileRelativePath = relative(shaderRoot, inputPath);
		const outputPath = resolve(outputFolder, fileRelativePath).replace(
			/\.\w+$/,
			'.mts',
		);
		const id = toCamelCase(basename(inputPath).replace(/\..+$/, ''));
		const reflect = new WgslReflect(inputCode);

		const entrypoints = {
			compute: Object.fromEntries(
				reflect.entry.compute.map((c) => [c.name, c.name]),
			),
			vertex: Object.fromEntries(
				reflect.entry.vertex.map((c) => [c.name, c.name]),
			),
			fragment: Object.fromEntries(
				reflect.entry.fragment.map((c) => [c.name, c.name]),
			),
		} as const;

		const generatedTypes = generate(inputCode, {
			inputPath,
			outputPath,
			moduleSyntax: 'esmodule',
			toTs: true,
		});

		const code = `
${generatedTypes}

export const entrypoints = ${JSON.stringify(entrypoints)} as const;
type KeysOfUnion<T> = T extends T ? keyof T: never;
export type TestEntrypoints = KeysOfUnion<(typeof entrypoints)[keyof typeof entrypoints]>;
export const code = \`
${inputCode.trim()}
\`;

export const ${id}Factory = (device:GPUDevice) => device.createShaderModule({code,label:'${id}Module'});

export default code;
`;

		return { code, outputPath };
	} catch (err) {
		if (err && typeof err === 'object' && 'toString' in err) {
			console.error((err as Error).toString());
		}
		console.error(err);
		return null;
	}
}

// ============================================================================
// File Operations
// ============================================================================

async function cleanOutputDirectory(outputDir: string): Promise<void> {
	await rm(outputDir, { recursive: true, force: true });
	await mkdir(outputDir, { recursive: true });
}

async function generateShaderFile(path: string): Promise<string | null> {
	const content = await weslLinker.processFile(path);
	if (content === null) {
		return null;
	}

	const processed = processShaderCode(path, content, SHADER_SOURCE_DIR);
	if (processed === null) {
		return null;
	}
	const formattedFile = await formatWithBiome(processed.code);
	await mkdir(dirname(processed.outputPath), { recursive: true });
	await writeFile(processed.outputPath, formattedFile);

	return processed.outputPath;
}

async function generateAllShaders(): Promise<void> {
	const files = await glob(`./${SHADER_SOURCE_DIR}/**/*${SHADER_EXTENSION}`);
	await Promise.all(files.map(generateShaderFile));
}

function isShaderFile(filePath: string): boolean {
	return filePath.endsWith(SHADER_EXTENSION);
}

// ============================================================================
// Astro Integration
// ============================================================================

type AstroDevServer = Parameters<
	NonNullable<AstroIntegration['hooks']['astro:server:setup']>
>[0]['server'];

function createWeslIntegration(): AstroIntegration {
	let server: AstroDevServer;
	let watcher: FSWatcher | null = null;

	async function handleFileAdd(filePath: string): Promise<void> {
		if (!isShaderFile(filePath)) {
			return;
		}

		console.log(`Shader file added: ${filePath}`);
		await generateShaderFile(filePath);
		server?.ws.send({ type: 'full-reload' });
	}

	async function handleFileChange(filePath: string): Promise<void> {
		if (!isShaderFile(filePath)) {
			return;
		}

		console.log(`Shader file changed: ${filePath}`);
		const outputPath = await generateShaderFile(filePath);

		if (!outputPath) {
			return;
		}

		const module = server?.moduleGraph.getModuleById(outputPath);
		if (module) {
			server?.moduleGraph.invalidateModule(module);
		}
		server?.ws.send({ type: 'full-reload' });
	}

	return {
		name: 'ruby-wesl-integration',
		hooks: {
			async 'astro:config:done'() {
				await cleanOutputDirectory(resolve(cwd(), SHADER_OUTPUT_DIR));
				await generateAllShaders();
			},

			async 'astro:server:setup'(options) {
				console.log('Server setup');
				server = options.server;

				if (watcher) {
					await watcher.close();
				}

				watcher = chokidar.watch(resolve(cwd(), SHADER_SOURCE_DIR), {
					ignoreInitial: true,
				});

				watcher.on('add', handleFileAdd);
				watcher.on('change', handleFileChange);
			},

			'astro:server:done'() {
				watcher?.close();
			},

			async 'astro:build:start'() {
				await generateAllShaders();
			},
		},
	};
}

// ============================================================================
// Astro Config
// ============================================================================

export default defineConfig({
	site: 'https://rquail-genuary26.rubyquail.design',
	output: 'static',
	compressHTML: false,
	vite: {
		build: {
			minify: false,
		},
	},
	integrations: [robots(), sitemap(), createWeslIntegration()],
});
