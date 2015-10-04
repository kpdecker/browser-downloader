var Gulp = require('gulp');

// Init global state
var Linoleum = require('linoleum');

// Include optional linoleum tasks
require('linoleum/tasks/clean');
require('linoleum/tasks/lint');
require('linoleum/tasks/babel');
require('linoleum/tasks/test');
require('linoleum/tasks/cover');

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
