'use strict';
const retry = require('..');
const assert = require('assert');
describe('#intenta(fn, options)', function () {
    var attempt = 0;
    var attemptList = [];
    var doneArgs;
    var startTime;
    before(function (done) {
        startTime = Date.now();

        function someAsyncFunction(a, b, callback) {
            var error = new Error('Err' + (++attempt));
            error.args = Array.prototype.slice.call(arguments);
            attemptList.push([error.args, Date.now()]);
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
    it('should backoff before retry', function () {
        var times = [0];
        var previousTookLess = true;
        for (let i = 1; i < attemptList.length; i++) {
            times[i] = attemptList[i][1] - attemptList[i - 1][1];
            previousTookLess = previousTookLess && (times[i] > times[i - 1]);
        }
        assert(previousTookLess, times);
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
    describe('`attempt` is consecutive and starts at 1', function () {
        var attemptList = [];
        var totalMadeAttempts;
        before(function (done) {
            function willFail(callback) {
                return callback(new Error('something'));
            }

            function backoff(attempt) {
                attemptList.push(attempt);
                return 1;
            }
            let fn = retry(willFail, {
                backoff,
                report: true
            });
            fn(function callback(err, _totalMadeAttempts) {
                totalMadeAttempts = _totalMadeAttempts;
                return done();
            });
        });
        it('should be consecutive', function () {
            assert.deepEqual([1, 2, 3, 4], attemptList);
        });
        it('should start at 1', function () {
            assert.deepEqual(attemptList[0], 1);
        });
        it('reported attempts should be 1+ greater than the last received attempt argument ', function () {
            assert.deepEqual(totalMadeAttempts, attemptList[attemptList.length-1] + 1);
        });
    });
    describe('When backoff function returns -1', function () {
        var tries = 0;
        var error;
        before(function (done) {
            function willFail(callback) {
                tries++;
                return callback(new Error('something'));
            }

            function backoff() {
                return -1;
            }
            let fn = retry(willFail, {
                backoff
            });
            fn(function callback(err) {
                error = err;
                return done();
            });
        });
        it('should not retry', function () {
            assert.deepEqual(tries, 1);
        });
        it('backoff function should receive the error', function () {
            assert.deepEqual(error.message, 'something');
        });
    });
});
