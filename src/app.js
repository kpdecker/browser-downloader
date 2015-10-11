import {exec} from 'child_process';
import Dmg from 'dmg';
import glob from 'glob';
import {join, relative} from 'path';

export function extract(dmg, destination) {
  return mount(dmg)
      .then((volume) => cleanup(volume, destination))
      .then((volume) => copy(volume, destination))
      .then((volume) => new Promise((resolve) => setTimeout(() => resolve(volume), 1000)))
      .then((volume) => unmount(volume));
}

export function mount(dmg) {
  return new Promise((resolve, reject) => {
    Dmg.mount(dmg, function(err, volume) {
      /* istanbul ignore if */
      if (err) {
        reject(err);
      } else {
        resolve(volume);
      }
    });
  });
}
export function unmount(volume) {
  return new Promise((resolve) => {
    Dmg.unmount(volume, function(err, volume) {
      // TODO: Figure out how to make this less brittle
      /* istanbul ignore if */
      if (err) {
        console.log(err.stack);
      }

      resolve(volume);
    });
  });
}

export function cleanup(source, destination) {
  return Promise.all(
    glob.sync(join(source, '*.app')).map((file) => {
      file = relative(source, file);

      return new Promise((resolve, reject) => {
        let toRemove = JSON.stringify(join(destination, file));
        console.log(`Removing ${toRemove}`);
        exec(`rm -rf "${toRemove}"`, function(err) {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    })
  )
  .then(() => source);
}

export function copy(volume, destination) {
  return new Promise((resolve, reject) => {
    exec(`cp -a "${volume}"/*.app "${destination}"`, function(err) {
      /* istanbul ignore if */
      if (err) {
        reject(err);
      } else {
        resolve(volume);
      }
    });
  });
}
