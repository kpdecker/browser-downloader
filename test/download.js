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
    return Downloader.download('https://developer.apple.com/safari/download/', path)
        .then(() => {
          let content = fs.readFileSync(`${path}/download`);
          expect(content).to.match(/<html/);
        });
  });
  it('should handle download errors', function() {
    this.stub(global, 'fetch', () => Promise.resolve({status: 500}));
    return Downloader.download('http://nightly.webkit.org/', path)
        .then(() => { throw new Error('failed'); })
        .catch((err) => expect(err).to.match(/500/));
  });

  it('should download if build does not exist', function() {
    path = temp.mkdirSync({suffix: '.html'});
    return Downloader.download({build: 1, url: 'https://developer.apple.com/safari/download/'}, path)
        .then(() => Downloader.writeVersion({build: 1, url: 'https://developer.apple.com/safari/download/'}, path))
        .then(() => {
          let content = fs.readFileSync(`${path}/download`);
          expect(content).to.match(/<html/);

          content = fs.readFileSync(`${path}/download.build`, 'utf8');
          expect(content).to.equal('1');
        });
  });

  it('should not download if build is the same', function() {
    path = temp.mkdirSync({suffix: '.html'});
    fs.writeFileSync(`${path}/nightly.webkit.org.build`, '1');

    return Downloader.download({build: 1, url: 'http://nightly.webkit.org/'}, path)
        .then(() => Downloader.writeVersion({build: 1, url: 'http://nightly.webkit.org/'}, path))
        .then(() => {
          expect(fs.existsSync(`${path}/nightly.webkit.org`)).to.be.false;

          let content = fs.readFileSync(`${path}/nightly.webkit.org.build`, 'utf8');
          expect(content).to.equal('1');
        });
  });

  it('should download if build has changed', function() {
    path = temp.mkdirSync({suffix: '.html'});
    fs.writeFileSync(`${path}/nightly.webkit.org.build`, '10');

    return Downloader.download({build: 1, url: 'https://developer.apple.com/safari/download/'}, path)
        .then(() => Downloader.writeVersion({build: 1, url: 'https://developer.apple.com/safari/download/'}, path))
        .then(() => {
          let content = fs.readFileSync(`${path}/download`);
          expect(content).to.match(/<html/);

          content = fs.readFileSync(`${path}/download.build`, 'utf8');
          expect(content).to.equal('1');
        });
  });
});
