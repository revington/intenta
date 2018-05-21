'use strict';
var defaults = {
    limit: 5,
    backoff: backoff(100),
    report: false
};

function backoff(ms) {
    return function backoffImpl(attempt) {
        return Math.ceil(0.5 * (Math.pow(2, attempt) - 1)) * ms;
    };
}

function intenta(fn, options) {
    var attempt = 0,
        args,
        callback;
    options = Object.assign({}, defaults, options);

    function cb(err) {
        var backoffMS;
        if (err && attempt === options.limit) {
            if (options.report) {
                return callback(err, attempt);
            }
            return callback(err);
        }
        if (err) {
            backoffMS = options.backoff(attempt, err);
        }
        if (err && backoffMS > -1) {
            return setTimeout(req, backoffMS);
        }
        if (!options.report) {
            return callback.apply(null, arguments);
        }
        let args = Array.prototype.slice.call(arguments);
        args.push(attempt);
        return callback.apply(null, args);
    }

    function req() {
        attempt++;
        fn.apply(null, args);
    }
    return function wrapper() {
        args = Array.prototype.slice.call(arguments);
        callback = args.pop();
        args.push(cb);
        req();
    };
}
exports = module.exports = intenta;
exports.backoff = backoff;
