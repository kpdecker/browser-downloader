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
