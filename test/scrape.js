import * as Scrape from '../src/scrape';

import {expect} from 'chai';

describe('lookup', function() {
  this.timeout(10000);    // Be loose with network IO

  it('should find firefox link', function() {
    return Scrape.findLatestFirefox()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*download\.mozilla\.org\/.*osx/));
  });
  it('should find nightly firefox link', function() {
    return Scrape.findNightlyFirefox()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*mozilla\.org\/.*\.dmg/));
  });
  it('should find nightly webkit link', function() {
    return Scrape.findNightlyWebkit()
        .then((latest) => expect(latest).to.match(/https?:\/\/.*webkit\.org\/.*\.dmg/));
  });
  it('should handle link lookup errors', function() {
    this.stub(global, 'fetch', () => Promise.resolve({status: 500}));
    return Scrape.findNightlyWebkit()
        .then(() => { throw new Error('failed'); })
        .catch((err) => expect(err).to.match(/500/));
  });

  it('should find edge vm link', function() {
    return Scrape.findEdgeVM()
        .then((latest) => {
          latest.forEach((latest) => {
            expect(latest.branch).to.match(/preview|stable/);
            expect(latest.build).to.match(/^1[45],*/);
            expect(latest.url).to.match(/https?:\/\/.*msecnd.net\/.*\.zip/);
          });
        });
  });
});
