const chai = require('chai');
const assert = chai.assert;
const rp = require('request-promise');
const Promise = require('bluebird');

const measuresData = require('../../index.js');

function checkUrl(s) {
  return rp({method: 'HEAD', uri: s.url})
    .then(body => {
      let valid = /4\d\d/.test(body.statusCode) === false;
      return ({
        measureId: s.measureId,
        submissionMethod: s.url,
        success: valid,
        httpStatus: body.statusCode
      });
    });
};

describe('measures specification', function() {
  it('should have valid specification links', function(done) {
    this.timeout(300000); // 5 minutes timeout.
    let specs = [];
    let measures = measuresData.getMeasuresData();
    measures
      .map(m => ({measureId: m.measureId, measureSpecification: m.measureSpecification}))
      .filter(s => !!s.measureSpecification)
      .forEach(s => {
        Object.keys(s.measureSpecification).forEach(key => {
          let url = s.measureSpecification[key];
          specs.push({measureId: s.measureId, url: url});
        });
      });

    Promise.map(specs, s => checkUrl(s))
      .then(results => {
        let failuers = results.filter(r => !r.success);
        if (failuers.length > 0) {
          console.log(failuers);
        }
        assert.equal(0, failuers.length, 'One or more measure specifications link is invalid');
        done();
      });
  });
});
