import {exec} from 'child_process';
import {dirname, join, resolve} from 'path';
import rimraf from 'rimraf';

export function extract(zipFile) {
  zipFile = resolve(zipFile);

  let cwd = dirname(zipFile),
      base = 'MSEdge - Win10_preview',
      vmDir = `${cwd}/`,
      vmx = join(vmDir, `${base}.vmx`);

  return stopVM(vmx)
      .then(() => deleteVM(vmx))
      .then(() => cleanup(join(cwd, base)))
      .then(() => decompress(zipFile, cwd))
      .then(() => cleanup(zipFile))
      .then(() => cleanup(`${zipFile}.etag`));
}

function decompress(file, cwd) {
  return run(`7za -y x "${file}"`, {cwd})
      .then((stdout) => {
        let match = (/Extracting *(.*\.vmx)/.exec(stdout));
        if (match) {
          return match[1];
        } else {
          throw new Error(`Unexpected decompress output: ${stdout}`);
        }
      });
}

function stopVM(vmx) {
  return run(`vmrun stop "${vmx}"`);
}

function deleteVM(vmx) {
  console.log(`Removing old VM from ${vmx}`);
  return run(`vmrun deleteVM "${vmx}"`);
}
function cleanup(vmdir) {
  return new Promise((resolve, reject) => {
    rimraf(vmdir, function(err) {
      /* istanbul ignore next */
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function run(command, options) {
  return new Promise((resolve, reject) => {
    console.log('run', command);
    exec(command, options, function(err, stdout, stderr) {
      /* istanbul ignore if */
      if (err
          && !(/The virtual machine is not powered on/.test(stdout))
          && !(/The virtual machine cannot be found/.test(stdout))) {
        console.log(err, stdout, stderr);
        reject(err);
      } else if (!stdout) {
        reject(err || stderr || new Error('No output'));
      } else {
        resolve(stdout);
      }
    });
  });
}

