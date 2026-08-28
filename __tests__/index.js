import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import path from 'node:path';
import fs from 'node:fs/promises';
import nock from 'nock';
import tempfile from 'tempfile';
import decompress from '@xhmikosr/decompress';
import m from '../index.js';

const thisDirname = import.meta.dirname;

async function pathExists (path) {
	let result;

	try {
		await fs.access(path);
		result = true;
	} catch {
		result = false;
	}

	return result;
}

function fixturePath (name) {
	return path.join(thisDirname, 'fixtures', name);
}

function autoCommand (temp) {
  return [
		'autoreconf -ivf',
		`./configure --disable-gifview --disable-gifdiff --prefix="${temp}" --bindir="${temp}"`,
		'make install',
	];
}

describe('bin-build', () => {
	let temporaryFile;

	beforeEach(() => {
		temporaryFile = tempfile();
	});

	afterEach(async () => {
		let recursive = false;
		const exists = await pathExists(temporaryFile);
		if (exists) {
			const stats = await fs.stat(temporaryFile);
			recursive = stats.isDirectory();
		}
		await fs.rm(temporaryFile, {
			force: true,
			recursive
		});
	});

	test('download and build source', async () => {
		nock('http://foo.com')
			.get('/gifsicle.tar.gz')
			.replyWithFile(200, fixturePath('test.tar.gz'));

		await m.url('http://foo.com/gifsicle.tar.gz', autoCommand(temporaryFile));

		assert.ok(await pathExists(path.join(temporaryFile, 'gifsicle')));
	});

	test('build source from existing archive', async () => {
		await m.file(fixturePath('test.tar.gz'), autoCommand(temporaryFile));

		assert.ok(await pathExists(path.join(temporaryFile, 'gifsicle')));
	});

	test('build source from directory', async () => {
		await fs.mkdir(temporaryFile, {
			recursive: true
		});

		await decompress(fixturePath('test.tar.gz'), temporaryFile, {strip: 1});
		await m.directory(temporaryFile, autoCommand(temporaryFile));

		assert.ok(await pathExists(path.join(temporaryFile, 'gifsicle')));
	});

	test('directory accepts a string', () => {
		return assert.rejects(m.directory([]), {
			message: 'Expected a `string`, got `object`'
		});
	});

	test('file accepts a string', () => {
		return assert.rejects(m.file([]), {
			message: 'Expected a `string`, got `object`'
		});
	});

	test('url accepts a string', () => {
		return assert.rejects(m.url([]), {
			message: 'Expected a `string`, got `object`'
		});
	});
});

