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

    findEdgeVM()
      .then((latest) => checkVersion(latest, destination))
      .then((needsUpdate) => {
        if (needsUpdate) {
          throw new Error('Edge VM is out of date. Please manually install');
        }
      })
  ]);
}

export function installVM(destination) {
  return findEdgeVM()
    .then((latest) => {
      return checkVersion(latest, destination)
        .then((needsUpdate) => needsUpdate ? latest : Promise.reject(new Error('VM already at latest')));
    })
    .then((url) => {
      return new Promise((resolve) => {
        console.log(`Downloading Edge from ${url.url}`);
        resolve();
      })
      .then(() => download(url, destination))
      .then((zipPath) => {
        console.log(`Extracting ${zipPath} to ${destination}`);
        return extractVM(zipPath, destination)
              .then(() => writeVersion(url, destination));
      });
    });
}
