#!/usr/bin/env node

import { spawn } from 'child_process';
import { rm } from 'fs/promises';
import path from 'path';
import readline from 'readline';

// === CONFIG ===
const repo = 'https://github.com/shaishabcoding/express-it.git';
const target = process.argv[2] || '.';

// === Prompt Utility ===
const ask = (question: string) =>
	new Promise<string>((resolve) => {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.trim().toLowerCase());
		});
	});

// === Clone ===
const git = spawn('git', ['clone', '--depth', '1', repo, target], {
	stdio: ['ignore', process.stdout, process.stderr],
});

git.on('close', async (code) => {
	if (code !== 0) return process.exit(1);

	try {
		await rm(path.join(target, '.git'), { recursive: true, force: true });
	} catch {
		// ignore
	}

	// === Step 1: Ask to install ===
	const installAns = await ask(
		'\n📦 Do you want to install dependencies? (y/N): '
	);
	if (installAns === 'y') {
		const install = spawn('npm', ['install'], {
			cwd: target,
			stdio: 'inherit',
			shell: true,
		});

		install.on('close', async (code) => {
			if (code !== 0) return process.exit(1);

			// === Step 2: Ask to run ===
			const runAns = await ask('\n🚀 Do you want to run the project? (y/N): ');
			if (runAns === 'y') {
				spawn('npm', ['run', 'dev'], {
					cwd: target,
					stdio: 'inherit',
					shell: true,
				});
			}
		});
	} else {
		console.log('✅ Done.');
		process.exit(0);
	}
});
