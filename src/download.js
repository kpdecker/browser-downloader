/* global fetch, Headers */
import 'isomorphic-fetch';

import fs from 'fs';
import mkdirp from 'mkdirp';
import {basename, join} from 'path';

export function download(url, destination) {
  mkdirp.sync(destination);

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
    let outputFile = join(destination, basename(url));
    let headers;
    try {
      const currentETag = fs.readFileSync(`${outputFile}.etag`, 'utf8').trim();
      headers = new Headers();
      headers.append('if-none-match', currentETag);
    } catch (err) {
      /* NOP */
    }

    return fetch(url, {headers})
      .then((response) => {

        url = decodeURI(response.url);
        let outputFile = join(destination, basename(url));

        if (response.status === 304) {
          return outputFile;
        }
        if (response.status !== 200) {
          return Promise.reject(`Failed to lookup url: ${response.status}`);
        }

        let length = response.headers.get('content-length'),
            etag = response.headers.get('etag');

        return new Promise((resolve, reject) => {
          let output = fs.createWriteStream(outputFile);
          response.body.pipe(output)
              .on('error', reject)
              .on('finish', () => {
                let stat = fs.statSync(outputFile);
                if (length != null && stat.size != length) {
                  console.log(response.headers);
                  return reject(new Error(`Invalid length ${stat.size}. Expected ${length}`));
                }

                fs.writeFile(`${outputFile}.etag`, etag, (err) => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve(outputFile);
                  }
                });
              });
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
