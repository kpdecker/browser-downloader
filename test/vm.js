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
        callback(undefined, '', '');
      }
    });

    return VM.extract(`${path}/foo/bar`)
        .then(() => {
          let args = childProcess.exec.args.map((arg) => arg[0]);
          expect(args).to.eql([
            `vmrun stop "${path}/foo/MsEdge-Win10TH2-VMware.vmwarevm"`,
            `vmrun deleteVM "${path}/foo/MsEdge-Win10TH2-VMware.vmwarevm"`,
            `7za -y x "${path}/foo/bar"`,
            `"/Applications/VMware OVF Tool/ovftool" -o "${path}/foo/foo.ovf" "${path}/foo/"`,
            `vmrun upgradevm "${path}/foo/MsEdge-Win10TH2-VMware.vmwarevm"`,
            `vmrun start "${path}/foo/MsEdge-Win10TH2-VMware.vmwarevm"`
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
