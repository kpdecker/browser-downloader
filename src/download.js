/* global fetch */
import 'isomorphic-fetch';

import fs from 'fs';
import {basename, join} from 'path';

export function download(url, destination) {
  return fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(`Failed to lookup url: ${response.status}`);
        }

        url = decodeURI(response.url);
        destination = join(destination, basename(url));

        return new Promise((resolve, reject) => {
          let output = fs.createWriteStream(destination);
          response.body.pipe(output)
              .on('error', reject)
              .on('finish', () => resolve(destination));
        });
      });
}
