import * as Downloader from '../src/download';

import {expect} from 'chai';
import fs from 'fs';
import temp from 'temp';
import rimraf from 'rimraf';

describe('downloader', function() {
  this.timeout(10000);    // Be loose with network IO

  let path;
  afterEach((done) => {
    if (path) {
      rimraf(path, done);
      path = undefined;
    } else {
      done();
    }
  });

  it('should download file', function() {
    path = temp.mkdirSync({suffix: '.html'});
    return Downloader.download('http://nightly.webkit.org/', path)
        .then(() => {
          let content = fs.readFileSync(`${path}/nightly.webkit.org`);
          expect(content).to.match(/<html/);
        });
  });
  it('should handle download errors', function() {
    this.stub(global, 'fetch', () => Promise.resolve({status: 500}));
    return Downloader.download('http://nightly.webkit.org/', path)
        .then(() => { throw new Error('failed'); })
        .catch((err) => expect(err).to.match(/500/));
  });
});
