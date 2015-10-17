import downloader, {installVM} from '../src';

import * as App from '../src/app';
import * as VM from '../src/vm';
import * as Download from '../src/download';

import {expect} from 'chai';

describe('index', function() {
  it('download all browsers', function() {
    this.stub(Download, 'download', () => Promise.resolve());
    this.stub(Download, 'checkVersion', () => Promise.resolve());
    this.stub(Download, 'writeVersion', () => Promise.resolve());
    this.stub(App, 'extract', () => Promise.resolve());

    return downloader()
        .then(() => {
          expect(Download.download)
              .to.have.been.calledWith('https://dl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg')
              .to.have.been.calledWith('https://storage.googleapis.com/chrome-canary/GoogleChromeCanary.dmg');
        });
  });
  it('error on out of date VM', function() {
    this.stub(Download, 'download', () => Promise.resolve());
    this.stub(Download, 'checkVersion', () => Promise.resolve(true));
    this.stub(Download, 'writeVersion', () => Promise.resolve());
    this.stub(App, 'extract', () => Promise.resolve());

    return downloader()
        .then(() => {
          throw new Error('Should have rejected');
        }, (err) => {
          expect(err).to.match(/Edge VM is out of date. Please manually install/);
        });
  });

  it('should install VM', function() {
    this.stub(Download, 'download', () => Promise.resolve('foo'));
    this.stub(Download, 'checkVersion', () => Promise.resolve(true));
    this.stub(Download, 'writeVersion', () => Promise.resolve());
    this.stub(VM, 'extract', () => Promise.resolve());

    return installVM()
        .then(() => {
          expect(Download.writeVersion).to.have.been.called;
        });
  });
  it('should install VM', function() {
    this.stub(Download, 'download', () => Promise.resolve('foo'));
    this.stub(Download, 'checkVersion', () => Promise.resolve());
    this.stub(Download, 'writeVersion', () => Promise.resolve());
    this.stub(VM, 'extract', () => Promise.resolve());

    return installVM()
        .then(() => {
          throw new Error('Should have rejected');
        }, (err) => {
          expect(err).to.match(/VM already at latest/);
        });
  });
});
