/* global fetch */
import 'isomorphic-fetch';

import cheerio from 'cheerio';

export function findLatestFirefox() {
  return loadDOM('https://www.mozilla.org/en-US/firefox/new/?scene=2')
      .then(($) => {
        return $('.os_osx .download-link').attr('href');
      })
      .then((url) => {
        if (!/https:\/\/download\.mozilla\.org\//.test(url)) {
          throw new Error(`Unable to find firefox url: ${url}`);
        }
        return url;
      });
}
export function findNightlyFirefox() {
  return loadDOM('https://nightly.mozilla.org/')
      .then(($) => {
        return $('#desktop-nightly-download [data-link-type="download"][data-display-name="OS X"][data-download-version="osx"][data-download-os="Desktop"]')
          .attr('href');
      })
      .then((url) => {
        if (!/https?:\/\/.*mozilla\.org\/.*\.dmg/.test(url)) {
          throw new Error(`Unable to find firefox nightly url: ${url}`);
        }
        return url;
      });
}

export function findNightlyWebkit() {
  return loadDOM('https://webkit.org/nightly/archives/')
      .then(($) => {
        return $('#search-results a').attr('href');
      })
      .then((url) => {
        if (!/https?:\/\/.*webkit\.org\/.*\.dmg/.test(url)) {
          throw new Error(`Unable to find webkit nightly url: ${url}`);
        }
        return url;
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
