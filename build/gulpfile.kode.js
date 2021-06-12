/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Kode Studio team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const path = require('path');
const gulp = require('gulp');

gulp.task('copy-kode-extensions', () => {
	gulp.src('kodeExtensions/**')
	.pipe(gulp.dest(path.join(process.cwd(), 'out-vscode')));
});
