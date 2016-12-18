#!/usr/bin/env node
var downloader = require('../lib');

var destination = process.argv[2],
    action = downloader.default;
if (process.argv.length === 4 && process.argv[2] === 'vm') {
  destination = process.argv[3];
  action = downloader.installEdgeVMs;
} else if (process.argv.length !== 3) {
  console.log('Usage: browser-downloader [vm] targetDir');
  console.log(process.argv);
  process.exit(1);
}

action(destination)
    .then(() => console.log('done'))
    .catch(function(err) {
      console.log(err.stack);
      process.exit(1);
    });
