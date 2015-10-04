import * as Downloader from '../src';

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

  it('should find firefox link', function() {
    return Downloader.findLatestFirefox()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*download\.mozilla\.org\/.*osx/));
  });
  it('should find nightly firefox link', function() {
    return Downloader.findNightlyFirefox()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*mozilla\.org\/.*\.dmg/));
  });
  it('should find nightly webkit link', function() {
    return Downloader.findNightlyWebkit()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*webkit\.org\/.*\.dmg/));
  });
  it('should handle link lookup errors', function() {
    this.stub(global, 'fetch', () => Promise.resolve({status: 500}));
    return Downloader.findNightlyWebkit()
        .then(() => { throw new Error('failed'); })
        .catch((err) => expect(err).to.match(/500/));
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
  it('should extract package', function() {
    path = temp.mkdirSync({suffix: '.download'});
    return Downloader.extract(`${__dirname}/artifacts/disk.dmg`, path)
        .then(() => expect(fs.existsSync(`${path}/file.txt`)).to.be.true)
        .then(() => expect(fs.existsSync(`${path}/dir/sub/file.txt`)).to.be.true);
  });
});
