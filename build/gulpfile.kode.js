const path = require('path');
const gulp = require('gulp');

gulp.task('copy-kode-extensions', () => {
	gulp.src('kodeExtensions/**')
	.pipe(gulp.dest(path.join(process.cwd(), 'out-vscode')));
});
