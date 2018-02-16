'use strict';
const retry = require('..');
const assert = require('assert');
describe('#intenta(fn, options)', function () {
    var attempt = 0;
    var attemptList = [];
    var doneArgs;
    before(function (done) {
        function someAsyncFunction(a, b, callback) {
            var error = new Error('Err' + (++attempt));
            error.args = Array.prototype.slice.call(arguments);
            attemptList.push(error.args);
            return callback(error);
        }
        let fn = retry(someAsyncFunction);
        fn('a', 'b', function () {
            doneArgs = Array.prototype.slice.call(arguments);
            return done();
        });
    });
    it('should retry up to "options.limit" times before it gives up', function () {
        assert.equal(attempt, 5);
    });
    it('should pass the arguments to the callback', function () {
        assert.deepEqual(doneArgs[0].message, 'Err5');
    });
    describe('option.report', function () {
        function test(report, callback) {
            var left = 3;

            function someAsyncFunction(callback) {
                left--;
                if (left === 0) {
                    return callback(null);
                }
                return callback(new Error('some'));
            }
            let fn = retry(someAsyncFunction, {
                report
            });
            fn(callback);
        }
        describe('is set to  true', function () {
            it('callback includes the number of attempts', function (done) {
                test(true, function (err, attemptsMade) {
                    assert(!err);
                    assert.equal(attemptsMade, 3);
                    return done();
                });
            });
        });
        describe('is set to  false', function () {
            it('callback does not include the number of attempts', function (done) {
                test(false, function (err, attemptsMade) {
                    assert(!err);
                    assert.equal(attemptsMade, null);
                    return done();
                });
            });
        });
    });
});
