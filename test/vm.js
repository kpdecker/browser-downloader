import * as VM from '../src/vm';

import {expect} from 'chai';
import temp from 'temp';
import rimraf from 'rimraf';
import childProcess from 'child_process';

describe('vm', function() {
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
    path = temp.mkdirSync({suffix: '.vmtest'});
    this.stub(childProcess, 'exec', function(command, options, callback) {
      if (/7za -y x/.test(command)) {
        callback(undefined, 'Extracting foo.ovf', '');
      } else {
        callback(undefined, 'foo', '');
      }
    });

    return VM.extract(`${path}/foo/bar`)
        .then(() => {
          let args = childProcess.exec.args.map((arg) => arg[0]);
          expect(args).to.eql([
            `vmrun stop "${path}/foo/MSEdge - Win10_preview.vmx"`,
            `vmrun deleteVM "${path}/foo/MSEdge - Win10_preview.vmx"`,
            `7za -y x "${path}/foo/bar"`,
            `vmrun upgradevm "${path}/foo/MSEdge - Win10_preview.vmx"`,
            `vmrun start "${path}/foo/MSEdge - Win10_preview.vmx"`
          ]);
        });
  });
  it('should handle run error', function() {
    path = temp.mkdirSync({suffix: '.vmtest'});
    this.stub(childProcess, 'exec', function(command, options, callback) {
      callback('my fail', 'Not one of the matches', '');
    });

    return VM.extract(`${path}/foo/bar`)
        .then(() => {
          throw new Error('should have failed');
        }, (err) => {
          expect(err).to.equal('my fail');
        });
  });
});
