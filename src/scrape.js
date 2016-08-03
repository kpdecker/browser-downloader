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
  return loadDOM('https://webkit.org/nightly/archives/')
      .then(($) => {
        return $('#search-results a').attr('href');
      });
}

export function findEdgeVM() {
  return fetch('https://dev.modern.ie/api/tools/vms/')
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        let edge = json.find(({name}) => (/Microsoft Edge/.test(name))),
            vmWare = edge.software.find(({name}) => (/VMware/.test(name))),
            file = vmWare.files.find(({name}) => (/\.zip$/.test(name)));
        return {
          build: edge.name,
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
