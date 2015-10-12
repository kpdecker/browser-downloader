#!/usr/bin/env node
var downloader = require('../lib');

if (process.argv.length !== 3) {
  console.log('Usage: browser-downloader targetDir');
  console.log(process.argv);
  process.exit(1);
}

downloader(process.argv[2])
    .then(() => console.log('done'))
    .catch(function(err) {
      console.log(err.stack);
      process.exit(1);
    });
