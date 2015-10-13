import {findLatestFirefox, findNightlyFirefox, findNightlyWebkit} from './scrape';
import {download} from './download';
import {extract as extractApp} from './app';

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
      .then((latest) => logDownload('WebKit', latest))
  ]);
}
