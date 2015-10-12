/* global fetch */
import 'isomorphic-fetch';

import cheerio from 'cheerio';

export function findLatestFirefox() {
  return loadDOM('https://www.mozilla.org/en-US/firefox/new/?scene=2')
      .then(($) => {
        return $('.os_osx .download-link').attr('href');
      });
}
export function findNightlyFirefox() {
  return loadDOM('https://nightly.mozilla.org/')
      .then(($) => {
        return $('#builds #Desktop .mac.first a').attr('href');
      });
}

export function findNightlyWebkit() {
  return loadDOM('http://nightly.webkit.org/builds/trunk/mac/1')
      .then(($) => {
        return $('#archives a').attr('href');
      });
}

export function findEdgeVM() {
  return fetch('https://dev.modern.ie/api/tools/vms/')
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        let vmWare = json.softwareList.find((vm) => vm.softwareName === 'VMware'),
            edge = vmWare.vms.find((vm) => vm.version === 'msedge'),
            file = edge.files.find((file) => (/\.zip$/).test(file.name));
        return {
          build: edge.build,
          url: file.url
        };
      });
}


function loadDOM(url) {
  return fetch(url)
      .then((response) => {
        if (response.status !== 200) {
          return Promise.reject(`Failed to lookup ${url}: ${response.status}`);
        }

        return response.text();
      })
      .then((data) => {
        return cheerio.load(data);
      });
}
