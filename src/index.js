import {findLatestFirefox, findNightlyFirefox, findNightlyWebkit, findEdgeVM} from './scrape';
import {download, checkVersion, writeVersion} from './download';
import {extract as extractApp} from './app';
import {extract as extractVM} from './vm';

export default function(destination) {
  function logDownload(browser, url) {
    return new Promise((resolve) => {
      console.log(`Downloading ${browser} from ${url}`);
      resolve();
    })
    .then(() => download(url, destination))
    .then((dmgPath) => {
      console.log(`Extracting ${dmgPath} to ${destination}`);
      return extractApp(dmgPath, destination);
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
      .then((latest) => logDownload('WebKit', latest)),

    checkEdgeVMs(destination)
      .then((needsUpdate) => {
        if (needsUpdate) {
          throw new Error('Edge VM is out of date. Please manually install');
        }
      })
  ]);
}

export function checkEdgeVMs(destination) {
  return findEdgeVM()
    .then((latest) => {
      return latest.reduce((prev, version) => {
        return prev
          .then((needsUpdate) => needsUpdate || checkVersion(version, `${destination}/edge/${version.branch}`));
      }, Promise.resolve());
    });
}


export function installEdgeVMs(destination) {
  return findEdgeVM()
    .then((latest) => {
      let errors = [];

      return latest.reduce((prev, version) => {
        return prev
          .then(() => installVM(version, `${destination}/edge/${version.branch}`))
          .catch((err) => errors.push(err.stack));
      }, Promise.resolve())
      .then(() => {
        if (errors.length) {
          return Promise.reject(new Error(JSON.stringify(errors)));
        }
      });
    });
}

function installVM(version, destination) {
  return checkVersion(version, destination)
    .then((needsUpdate) => {
      if (needsUpdate) {
        console.log(`Downloading Edge from ${version.url}`);
        return download(version, destination)
          .then((zipPath) => {
            console.log(`Extracting ${zipPath} to ${destination}`);
            return extractVM(zipPath, destination)
                  .then(() => writeVersion(version, destination));
          });
      }
    });
}
