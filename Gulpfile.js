var Gulp = require('gulp'),

    Linoleum = require('@kpdecker/linoleum');

require('@kpdecker/linoleum-node');

Gulp.task('build', ['clean', 'lint'], function(done) {
  Linoleum.runTask('babel', done);
});
Gulp.task('test', ['build'], function(done) {
  Linoleum.runTask('test:mocha', done);
});
Gulp.task('cover', ['build'], function(done) {
  Linoleum.runTask('cover:mocha', done);
});

Linoleum.watch(Linoleum.jsFiles(), 'cover');

Gulp.task('watch', ['watch:cover']);
Gulp.task('default', ['cover']);
