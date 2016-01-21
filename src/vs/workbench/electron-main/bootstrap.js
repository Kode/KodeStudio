/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/* global __filename, __dirname, global, process */

// Perf measurements
global.vscodeStart = Date.now();

var app = require('electron').app;
var fs = require('fs');
var path = require('path');

var argv = process.argv.slice(1);
var file = null;
for (var i = 0; i < argv.length; i++) {
	if (argv[i].trim().length > 0 && argv[i] !== '.' && argv[i][0] !== '-') {
		file = argv[i];
		break;
	}
}

if (file) {
	try {
		// Override app name and version.
		var packagePath = path.resolve(file);
		var packageJsonPath = path.join(packagePath, 'package.json');
		if (fs.existsSync(packageJsonPath)) {
			var packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
			if (packageJson.version)
				app.setVersion(packageJson.version);
			if (packageJson.productName)
				app.setName(packageJson.productName);
			else if (packageJson.name)
				app.setName(packageJson.name);
			app.setPath('userData', path.join(app.getPath('appData'), app.getName()));
			app.setPath('userCache', path.join(app.getPath('cache'), app.getName()));
			app.setAppPath(packagePath);
		}

		// Run the app.
		require('module')._load(packagePath, module, true);
	} catch(e) {
		if (e.code == 'MODULE_NOT_FOUND') {
			app.focus();
			dialog.showErrorBox(
				'Error opening app',
				'The app provided is not a valid Electron app, please read the docs on how to write one:\n' +
				`https://github.com/atom/electron/tree/v${process.versions.electron}/docs\n\n${e.toString()}`
			);
			process.exit(1);
		} else {
			console.error('App threw an error when running', e);
			throw e;
		}
	}
}
else {

// Change cwd if given via env variable
try {
	process.env.VSCODE_CWD && process.chdir(process.env.VSCODE_CWD);
} catch (err) {
	// noop
}

// Set path according to being built or not
if (!!process.env.VSCODE_DEV) {
	var appData = app.getPath('appData');
	app.setPath('userData', path.join(appData, 'KodeStudio-Development'));
}

// Mac: when someone drops a file to the not-yet running VSCode, the open-file event fires even before
// the app-ready event. We listen very early for open-file and remember this upon startup as path to open.
global.macOpenFiles = [];
app.on('open-file', function(event, path) {
	global.macOpenFiles.push(path);
});

// TODO: Duplicated in:
// * src\bootstrap.js
// * src\vs\workbench\electron-main\bootstrap.js
// * src\vs\platform\plugins\common\nativePluginService.ts
function uriFromPath(_path) {
	var pathName = path.resolve(_path).replace(/\\/g, '/');

	if (pathName.length > 0 && pathName.charAt(0) !== '/') {
		pathName = '/' + pathName;
	}

	return encodeURI('file://' + pathName);
}

// Load our code once ready
app.once('ready', function() {
	var loader = require('../../loader');

	loader.config({
		nodeRequire: require,
		nodeMain: __filename,
		baseUrl: uriFromPath(path.dirname(path.dirname(path.dirname((__dirname)))))
	});

	loader(['vs/workbench/electron-main/main'], function(main) {
		// Loading done
	}, function (err) { console.error(err); });
});

}
