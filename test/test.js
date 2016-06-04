// var should = require('chai').should();
var supertest = require('supertest');
var api = supertest('http://letz1.apps.exosite-dev.io');
function makeid () {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}

describe('User', function () {
  var user = 'dominicletz+15@exosite.com';
  var newuser = 'dominicletz+' + makeid() + '@exosite.com';
  var passw = 'secr*etpassw0rd';

  before(function (done) {
    api.get('/debug/clean')
    .end(function () {
      api.put('/user/' + user)
      .set('Accept', 'application/json')
//      .set('Accept-Encoding', '')
      .send({password: passw})
  //    .expect('Content-Type', /json/)
      .end(done);
    });
  });

  it('create duplicate user', function (done) {
    api.put('/user/' + user)
    .send({password: passw})
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, function (res) {
      console.log('hi' + res.text);
      done();
    });
  });

  /* it('create new user', function (done) {
    api.put('/user/' + newuser)
    .send({password: passw})
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, done);
  });*/
});
