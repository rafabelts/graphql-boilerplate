#! /usr/bin/env node
'use strict';

const path = require('path');
const util = require('util');
const packageJson = require('../package.json');
const fs = require('fs');
const { version } = require('os');
const exec = util.promisify(require('child_process').exec);

// executes commands
async function runCmd(command) {
	try {
		const { stdout, stderr } = await exec(command);
		console.log(stdout);
		console.log(stderr);
	} catch (error) {
		console.log('\x1b[31m', error, '\x1b[0m'); // shows errors in red
	}
}

async function promptUser(question) {
	return new Promise((resolve) => {
		process.stdout.write(question);
		process.stdin.once('data', (data) => {
			resolve(data.toString().trim());
		});
	});
}

//  verifies that user has entered the project name
if (process.argv.length < 3) {
	console.log('\x1b[31m', 'You have to provide name to your app.');
	console.log('For example:');
	console.log('    npx create-graphapi myApp', '\x1b[0m');
	process.exit(1);
}

const ownPath = process.cwd();
const folderName = process.argv[2];
const appPath = path.join(ownPath, folderName);
const repo = 'https://github.com/rafabelts/graphql-boilerplate.git';

if (fs.existsSync(appPath)) {
	console.log(
		'\x1b[31m',
		`Error: La carpeta "${folderName}" ya existe. Elige otro nombre o elimina la carpeta existente.`,
		'\x1b[0m'
	);
	process.exit(1);
}

async function setup() {
	try {
		console.log('\x1b[33m', 'Downloading the project structure...', '\x1b[0m');
		await runCmd(`git clone --depth 1 ${repo} ${folderName}`);

		// Ensure that the directory exists before proceeding
		if (!fs.existsSync(appPath)) {
			throw new Error('Failed to clone repository.');
		}

		// Change working directory to the new project folder
		process.chdir(appPath);

		// delete script
		fs.rmdirSync(path.join(appPath, 'bin'), { recursive: true });

		// ask for the package name
		const packageName = (await promptUser(`package name (${folderName}): `)) || folderName;

		// ask for the version
		const version = (await promptUser('version (1.0.0): ')) || '1.0.0';

		// ask for description
		const description = await promptUser('description: ');

		// ask for the repo
		const repoUrl = await promptUser('git repo: ');

		// ask for keywoards
		let keywoards_arr = [];
		const keywoards = await promptUser('keywoards: ');

		if (keywoards !== '') {
			keywoards_arr = keywoards.split(',');
		}

		// Ensure package.json exists before trying to delete it
		const packageJsonPath = path.join(appPath, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			fs.unlinkSync(packageJsonPath);
		}

		// Create new package.json
		buildPackageJson(packageJson, packageName, version, description, repoUrl, keywoards_arr);

		console.log('\x1b[34m', 'Installing dependencies...', '\x1b[0m');
		await runCmd('npm install');

		// Remove the existing .git directory to detach from original repo
		await runCmd('npx rimraf ./.git');

		console.log('\x1b[32m', 'The installation is done, this is ready to use!', '\x1b[0m');
		console.log('\x1b[34m', 'You can start by typing:');
		console.log(`    cd ${folderName}`);
		console.log('    npm run dev', '\x1b[0m');

		// Cierra la entrada estándar para que el proceso termine correctamente
		process.stdin.pause();
	} catch (error) {
		console.log('\x1b[31m', error, '\x1b[0m');
	}
}

setup();

function buildPackageJson(packageJson, packageName, version, description, repo, keywoards) {
	// deletes unnecessary properties from base package.json
	const { bin, ...newPackage } = packageJson;

	Object.assign(newPackage, {
		name: packageName,
		version: version,
		keywoards: keywoards,
		author: 'Rafael Alejandro Beltran Santos',
		description: description,
		repository: {
			type: 'git',
			url: repo
		},
		bugs: `${repo}/issues`,
		main: 'dist/index.js',
		types: 'dist/index.d.ts',
		scripts: {
			compile: 'tsc',
			test: 'jest',
			'test:watch': 'jest --watchAll',
			'test:coverage': 'jest --coverage',
			dev: 'concurrently "ts-node-dev --respawn --watch ./**/**/*.graphql ./src/index.ts" "npm run generate"',
			generate: 'graphql-codegen --watch "src/graphql/schema.graphql"'
		},
		dependencies: {
			'@apollo/server': '^4.11.3',
			'@parcel/watcher': '^2.5.1',
			graphql: '^16.10.0',
			'graphql-tag': '^2.12.6',
			rimraf: '^6.0.1',
			'lru-cache': '^10.0.0' // Added as replacement for inflight
		},
		devDependencies: {
			'@babel/plugin-transform-class-properties': '^7.23.3', // Updated from proposal
			'@babel/plugin-transform-object-rest-spread': '^7.23.3', // Updated from proposal
			'@eslint/js': '^9.20.0',
			'@graphql-codegen/cli': '^5.0.4',
			'@graphql-codegen/typescript': '^4.1.3',
			'@graphql-codegen/typescript-resolvers': '^4.4.2',
			'@types/jest': '^29.5.14',
			concurrently: '^9.1.2',
			eslint: '^9.20.0',
			'eslint-config-prettier': '^10.0.1',
			'eslint-plugin-prettier': '^5.2.3',
			globals: '^15.14.0',
			jest: '^29.7.0',
			nodemon: '^3.1.9',
			prettier: '^3.4.2',
			supertest: '^7.0.0',
			'ts-jest': '^29.2.5',
			'typescript-eslint': '^8.23.0'
		}
	});
	fs.writeFileSync(`${process.cwd()}/package.json`, JSON.stringify(newPackage, null, 2), 'utf-8');
}
