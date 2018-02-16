'use strict';
const backoff = require('..').backoff;
const assert = require('assert');
describe('#backoff(attempt)', function () {
    var actual = [];
    before(function () {
        var bf = backoff(100);
        for (let i = 1; i < 6; i++) {
            actual.push(bf(i));
        }
    });
    it('should return exponential backoff', function () {
        var expected = [100, 200, 400, 800, 1600];
        assert.deepEqual(actual, expected);
    });
});
