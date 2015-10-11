import downloader from '../src';

import * as App from '../src/app';
import * as Download from '../src/download';

import {expect} from 'chai';

describe('downloader', function() {
  it('download all browsers', function() {
    this.stub(Download, 'download', () => Promise.resolve());
    this.stub(App, 'extract', () => Promise.resolve());

    return downloader()
        .then(() => {
          expect(Download.download)
              .to.have.been.calledWith('https://dl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg')
              .to.have.been.calledWith('https://storage.googleapis.com/chrome-canary/GoogleChromeCanary.dmg');
        });
  });
});
