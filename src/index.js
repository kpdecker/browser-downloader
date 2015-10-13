import {findLatestFirefox, findNightlyFirefox, findNightlyWebkit, findEdgeVM} from './scrape';
import {download} from './download';
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
  function logDownloadVM(browser, url) {
    return new Promise((resolve) => {
      console.log(`Downloading ${browser} from ${url.url}`);
      resolve();
    })
    .then(() => download(url, destination))
    .then((zipPath) => {
      // If we didn't download, then hope and assume that everything worked properly
      if (!zipPath) {
        return;
      }

      console.log(`Extracting ${zipPath} to ${destination}`);
      return extractVM(zipPath, destination);
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
      .then((latest) => logDownloadVM('edge', latest))
  ]);
}
