const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const tsb = require('gulp-tsb');
const es = require('event-stream');
const exec = require('child_process').exec;

/*gulp.task('copy-kode-extensions', () => {
	gulp.src('kodeExtensions/**')
	.pipe(gulp.dest(path.join(process.cwd(), 'out-vscode', 'kodeExtensions')));
});*/

const tsCompiler = tsb.create({
	target: 'es6',
	module: 'commonjs',
	declaration: false
});

gulp.task('task', function (cb) {
	exec('ping localhost', function (err, stdout, stderr) {
		console.log(stdout);
		console.log(stderr);
		cb(err);
	});
});

function execute(command, cwd) {
	return new Promise((resolve, reject) => {
		exec(command, {cwd}, (error, stdout, stderr) => {
			console.log(stdout);
			console.log(stderr);
			resolve();
		});
	});
}

async function compile() {
	const extensions = fs.readdirSync('kodeExtensions');
	for (const ext of extensions) {
		console.log(ext + ':');
		await execute('npm install', path.join('kodeExtensions', ext));

		if (ext === 'haxe') {
			await execute('haxelib run vshaxe-build --target vshaxe --mode both', path.join('kodeExtensions', ext));
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
