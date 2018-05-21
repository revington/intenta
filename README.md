[![Build Status](https://travis-ci.org/revington/intenta.svg?branch=master)](https://travis-ci.org/revington/intenta)
[![Coverage Status](https://coveralls.io/repos/github/revington/intenta/badge.svg?branch=master)](https://coveralls.io/github/revington/intenta?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/revington/intenta/badge.svg?targetFile=package.json)](https://snyk.io/test/github/revington/intenta?targetFile=package.json)
# intenta

`#intenta(fn, options)`
Dead simple, zero deps, async retry with built in exponential backoff.

## Super simple to use

```
const retry = require('intenta');

function updateDB(id, data, callback){
....
}

let retryUpdateDB = retry(updateDB);

retryUpdateDB(id, data, function(err, result){
....
});
```

## Options

You can pass some options to `intenta`
* `limit`(Number) number of attempts to be made
* `report` (Bool) On success append the number of attempts made to callback arguments
* `backoff` (Function) A custom backoff function with the signature `fn(attempt, error)` where `attempt` is an integer > 0. It should return the number of miliseconds to backoff. You can cancel retrying by returning -1. This allows you to stop retrying early i.e does not make any sense to retry after a 404 error.

### report = true example


```
const retry = require('intenta');

function updateDB(id, data, callback){
....
}

let retryUpdateDB = retry(updateDB, {report: true});

retryUpdateDB(id, data, function(err, result, attemptsMade){
....
});
```
