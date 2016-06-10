var assert = require('chai').assert;
var request = require('sync-request');

function api (method) {
  return function (path, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.headers['Connection'] = 'keep-alive';
    return request(method, 'http://letz1.apps.exosite-dev.io' + path, options);
  };
}

// blocking 'it'
var bit = function (label, fun) {
  it(label, function (done) { fun(); done(); });
};

var get = api('get');
var put = api('put');
var post = api('post');

/*
get(path, options)

Request options:
  qs - an object containing querystring values to be appended to the uri
  headers - http headers (default: {})
  body - body for PATCH, POST and PUT requests. Must be a Buffer or String (only strings are accepted client side)
  json - sets body but to JSON representation of value and adds Content-type: application/json. Does not have any affect on how the response is treated.
  cache - Set this to 'file' to enable a local cache of content. A separate process is still spawned even for cache requests. This option is only used if running in node.js
  followRedirects - defaults to true but can be explicitly set to false on node.js to prevent then-request following redirects automatically.
  maxRedirects - sets the maximum number of redirects to follow before erroring on node.js (default: Infinity)
  gzip - defaults to true but can be explicitly set to false on node.js to prevent then-request automatically supporting the gzip encoding on responses.
  timeout (default: false) - times out if no response is returned within the given number of milliseconds.
  socketTimeout (default: false) - calls req.setTimeout internally which causes the request to timeout if no new data is seen for the given number of milliseconds. This option is ignored in the browser.
  retry (default: false) - retry GET requests. Set this to true to retry when the request errors or returns a status code greater than or equal to 400
  retryDelay (default: 200) - the delay between retries in milliseconds
  maxRetries (default: 5) - the number of times to retry before giving up.

Response:
  statusCode - a number representing the HTTP status code
  headers - http response headers
  body - a string if in the browser or a buffer if on the server
*/

var user = 'dominicletz+15@exosite.com';
var passw = 'secr*etpassw0rd';

describe('User', function () {
  before(function (done) {
    get('/debug/clean');
    done();
  });

  bit('create new user', function () {
    var res = put('/user/' + user, {
      json: {password: passw}
    });

    assert.equal(res.statusCode, 200);
  });

  bit('create duplicate user', function () {
    var res = put('/user/' + user, {
      json: {password: passw}
    });

    assert.equal(res.statusCode, 400);
  });

  bit('login without activation', function () {
    var res = post('/session', {
      json: {email: user, password: passw}
    });

    assert.equal(res.statusCode, 400);
  });

  bit('login after activation', function () {
    get('/debug/activate');
    var res = post('/session', {
      json: {email: user, password: passw}
    });

    assert.equal(res.statusCode, 200);
  });
});

describe('Provisioning', function () {
  var token;
  before('login to get token', function () {
    var res = post('/session', {
      json: {email: user, password: passw}
    });
    assert.equal(res.statusCode, 200);
    token = JSON.parse(res.body).token;
  });
  before('remove claimed dvice', function () {
    post('/user/' + user + '/lightbulbs', {
      json: {serialnumber: 1, link: false},
      headers: {'Cookie': 'sid=' + token}
    });
  });

  bit('claim a device', function () {
    var res = post('/user/' + user + '/lightbulbs', {
      json: {serialnumber: 1, link: true},
      headers: {'Cookie': 'sid=' + token}
    });

    console.log(res.body.toString());
    assert.equal(res.statusCode, 200);
  });
  bit('claim a device twice', function () {
    var res = post('/user/' + user + '/lightbulbs', {
      json: {serialnumber: 1, link: true},
      headers: {'Cookie': 'sid=' + token}
    });

    assert.equal(res.statusCode, 409);
  });

  bit('read device status', function () {
    var res = get('/user/' + user + '/lightbulbs', {
      headers: {'Cookie': 'sid=' + token}
    });

    console.log(res.body.toString());
    assert.equal(res.statusCode, 200);
  });



});
