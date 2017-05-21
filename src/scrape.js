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
  return fetch('https://download.mozilla.org/?product=firefox-nightly-latest-ssl&os=osx&lang=en-US', {redirect: 'manual'})
      .then((res) => {
        return res.headers.get('location');
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
        json.forEach((entry) => {
          entry.url = entry.software
                .find(({name}) => /VMware/.test(name))
                .files
                .map(({url}) => url)
                .find((url) => /\.zip$/.test(url));
        });

        return json
            .filter(({name}) => /Edge/.test(name))
            .map((entry) => {
              let match = /(\S+) \((.*)\)/.exec(entry.name);

              entry.branch = match[1].toLowerCase();
              entry.build = match[2];

              return entry;
            });
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
