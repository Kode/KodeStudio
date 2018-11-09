const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const es = require('event-stream');
const exec = require('child_process').exec;

function deleteDirectory(dir) {
	if (!fs.existsSync(dir)) {
		return;
	}

	for (const file of fs.readdirSync(dir)) {
		const fullPath = path.join(dir, file);
		if (fs.lstatSync(fullPath).isDirectory()) {
			deleteDirectory(fullPath);
		}
		else {
			fs.unlinkSync(fullPath);
		}
	}
	fs.rmdirSync(dir);
}

function execute(command, cwd) {
	return new Promise((resolve, reject) => {
		exec(command, {cwd}, (error, stdout, stderr) => {
			console.log(stdout);
			console.log(stderr);
			if (error) {
				reject(command + ' failed with code ' + error.code + '.');
			}
			else {
				resolve();
			}
		});
	});
}

async function compile() {
	const extensions = fs.readdirSync('kodeExtensions');
	for (const ext of extensions) {
		console.log(ext + ':');
		if (ext !== 'hashlink-debug') {
			await execute('npm install', path.join('kodeExtensions', ext));
		}

		if (ext === 'haxe') {
			await execute('haxelib run vshaxe-build --target vshaxe --mode both', path.join('kodeExtensions', ext));
		}
		else if (ext === 'checkstyle') {
			// compilation fails, add manually
		}
		else if (ext === 'hashlink-debug') {
			// npm install fails
		}
		else if (fs.existsSync(path.join('kodeExtensions', ext, 'build-release.hxml'))) {
			await execute('haxe build-release.hxml', path.join('kodeExtensions', ext));
		}
		else if (fs.existsSync(path.join('kodeExtensions', ext, 'build.hxml'))) {
			await execute('haxe build.hxml', path.join('kodeExtensions', ext));
		}
		else if (fs.existsSync(path.join('kodeExtensions', ext, 'gulpfile.js'))) {
			await execute('gulp', path.join('kodeExtensions', ext));
		}
		else if (fs.existsSync(path.join('kodeExtensions', ext, 'src', 'tsconfig.json'))) {
			await execute('tsc', path.join('kodeExtensions', ext, 'src'));
		}

		if (ext !== 'hashlink-debug') {
			deleteDirectory(path.join('kodeExtensions', ext, 'node_modules'));
			await execute('npm install --production', path.join('kodeExtensions', ext));
		}
	}
}

gulp.task('clean-kode', () => {

});

gulp.task('compile-kode', () => {
	return compile();
});

gulp.task('watch-kode', () => {
	return compile();
});

gulp.task('clean-kode-build', () => {

});

gulp.task('compile-kode-build', () => {
	return compile();
});

gulp.task('watch-kode-build', () => {
	return compile();
});
