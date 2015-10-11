import * as App from '../src/app';

import {expect} from 'chai';
import fs from 'fs';
import temp from 'temp';
import rimraf from 'rimraf';

describe('app', function() {
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

  it('should extract package', function() {
    path = temp.mkdirSync({suffix: '.download'});
    return App.extract(`${__dirname}/artifacts/disk.dmg`, path)
        .then(() => expect(fs.existsSync(`${path}/The App.app/file.txt`)).to.be.true)
        .then(() => expect(fs.existsSync(`${path}/The App.app/sub/file.txt`)).to.be.true);
  });
});
