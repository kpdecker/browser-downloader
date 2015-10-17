/* global fetch */
import 'isomorphic-fetch';

import fs from 'fs';
import {basename, join} from 'path';

export function download(url, destination) {
  if (url.build) {
    return checkVersion(url, destination)
        .then((doIt) => {
          if (doIt) {
            return download(url.url);
          }
        });
  } else {
    return download(url);
  }

  function download(url) {
    return fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(`Failed to lookup url: ${response.status}`);
        }

        url = decodeURI(response.url);
        let outputFile = join(destination, basename(url));

        return new Promise((resolve, reject) => {
          let output = fs.createWriteStream(outputFile);
          response.body.pipe(output)
              .on('error', reject)
              .on('finish', () => resolve(outputFile));
        });
      });
  }
}

export function checkVersion({url, build}, destination) {
  return new Promise((resolve, reject) => {
    destination = join(destination, `${basename(url)}.build`);

    fs.readFile(destination, function(err, version) {
      /* istanbul ignore if */
      if (err && err.code !== 'ENOENT') {
        return reject(err);
      } else {
        return resolve((version + '') != build);   // eslint-disable-line prefer-template
      }
    });
  });
}

export function writeVersion({url, build}, destination) {
  return new Promise((resolve, reject) => {
    destination = join(destination, `${basename(url)}.build`);

    fs.writeFile(destination, build, function(err) {
      /* istanbul ignore if */
      if (err) {
        return reject(err);
      } else {
        return resolve();
      }
    });
  });
}
