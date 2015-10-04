/* global fetch */
import 'isomorphic-fetch';

import cheerio from 'cheerio';
import fs from 'fs';
import Dmg from 'dmg';
import {ncp} from 'ncp';
import rimraf from 'rimraf';
import glob from 'glob';
import {basename, join, relative} from 'path';

/* istanbul ignore next: Too slow and too many external dependencies for unit testing */
export default function(destination) {
  function logDownload(browser, url) {
      return new Promise((resolve) => {
        console.log(`Downloading ${browser} from ${url}`);
        resolve();
      })
      .then(() => download(url, destination))
      .then((dmgPath) => {
        console.log(`Extracting ${dmgPath} to ${destination}`);
        return extract(dmgPath, destination);
      });
  }

  return Promise.all([
    logDownload('Chrome', 'https://dl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg'),
    logDownload('Canary', 'https://storage.googleapis.com/chrome-canary/GoogleChromeCanary.dmg'),
    findLatestFirefox()
      .then((latest) => logDownload('Firefox', latest)),
    findNightlyFirefox()
      .then((latest) => logDownload('Firefox', latest)),
    findNightlyWebkit()
      .then((latest) => logDownload('WebKit', latest))
  ]);
}

export function findLatestFirefox() {
  return loadDOM('https://www.mozilla.org/en-US/firefox/new/?scene=2')
      .then(($) => {
        return $('.os_osx .download-link').attr('href');
      });
}
export function findNightlyFirefox() {
  return loadDOM('https://nightly.mozilla.org/')
      .then(($) => {
        return $('#builds #Desktop .mac.first a').attr('href');
      });
}


export function findNightlyWebkit() {
  return loadDOM('http://nightly.webkit.org/builds/trunk/mac/1')
      .then(($) => {
        return $('#archives a').attr('href');
      });
}

function loadDOM(url) {
  return fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(`Failed to lookup ${url}: ${response.status}`);
        }

        return response.text();
      })
      .then((data) => {
        return cheerio.load(data);
      });
}

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

export function extract(dmg, destination) {
  return mount(dmg)
      .then((volume) => cleanup(volume, destination))
      .then((volume) => copy(volume, destination))
      .then((volume) => new Promise((resolve) => setTimeout(() => resolve(volume), 1000)))
      .then((volume) => unmount(volume));
}

export function mount(dmg) {
  return new Promise((resolve, reject) => {
    Dmg.mount(dmg, function(err, volume) {
      /* istanbul ignore if */
      if (err) {
        reject(err);
      } else {
        resolve(volume);
      }
    });
  });
}
export function unmount(volume) {
  return new Promise((resolve) => {
    Dmg.unmount(volume, function(err, volume) {
      // TODO: Figure out how to make this less brittle
      /* istanbul ignore if */
      if (err) {
        console.log(err.stack);
      }

      resolve(volume);
    });
  });
}

export function cleanup(source, destination) {
  return Promise.all(
    glob.sync(join(source, '*')).map((file) => {
      file = relative(source, file);

      return new Promise((resolve, reject) => {
        let toRemove = JSON.stringify(join(destination, file));
        console.log(`Removing ${toRemove}`);
        rimraf(toRemove, function(err) {
          /* istanbul ignore if */
          if (err) {
            return reject(err);
          } else {
            resolve();
          }
        });
      });
    })
  )
  .then(() => source);
}

export function copy(volume, destination) {
  return new Promise((resolve, reject) => {
    ncp(volume, destination, {stopOnError: true, filter(name) {
        return !(/\/ $|\/\.Trashes|\/\.fseventsd|\/\.background|\.VolumeIcon.icns/.test(name));
      }}, function(err) {
      /* istanbul ignore if */
      if (err) {
        reject(err);
      } else {
        resolve(volume);
      }
    });
  });
}
