require('mocha-as-promised')();
var rimraf = require('rimraf');
var join = require('path').join;
var fs = require('fs');
var assert = require('assert');
var download = require('../lib/download-file');

function checkDownloaded(res) {
  assert.equal(
    (res || fs.readFileSync(join(__dirname, 'output', 'download-file', 'test.html')).toString()).replace(/\r/g, ''),
    fs.readFileSync(join(__dirname, 'fixture', 'download-file', 'test.html')).toString().replace(/\r/g, ''));
}

describe('download file', function () {
  describe('download(src, {destination: "foo"})', function () {
    it('downloads src and puts it at destination then returns a promise', function () {
      return download('https://raw.github.com/jepso-ci-examples/minimum/master/test.html',
        {destination: join(__dirname, 'output', 'download-file', 'test.html')})
        .then(function () {
          checkDownloaded();
        });
    });
  });
  describe('download(src, {destination: "foo"}, callback)', function () {
    it('downloads src and puts it at destination then calls `callback(err)`', function (done) {
      download('https://raw.github.com/jepso-ci-examples/minimum/master/test.html',
        {destination: join(__dirname, 'output', 'download-file', 'test.html')},
        function (err) {
          if (err) return done(err);
          checkDownloaded();
          done();
        });
    });
  });
  describe('download(src)', function () {
    it('downloads src and puts it at destination then returns a promise(res)', function () {
      return download('https://raw.github.com/jepso-ci-examples/minimum/master/test.html')
        .then(function (res) {
          checkDownloaded(res);
        });
    });
  });
  describe('download(src, callback)', function () {
    it('downloads src and puts it at destination then calls `callback(err, res)`', function (done) {
      download('https://raw.github.com/jepso-ci-examples/minimum/master/test.html',
        function (err, res) {
          if (err) return done(err);
          checkDownloaded(res);
          done();
        });
    });
  });
  describe('download(src, {json: true})', function () {
    it('downloads src and puts it at destination then returns a promise(parsed)', function () {
      return download('https://raw.github.com/jepso-ci-examples/minimum/master/.jepso-ci.json', {json: true})
        .then(function (res) {
          assert.equal(typeof res, 'object');
        });
    });
  });
  describe('download(src, {json: true}, callback)', function () {
    it('downloads src and puts it at destination then calls `callback(err, parsed)`', function (done) {
      download('https://raw.github.com/jepso-ci-examples/minimum/master/.jepso-ci.json', {json: true},
        function (err, res) {
          if (err) return done(err);
          assert.equal(typeof res, 'object');
          done();
        });
    });
  });
  afterEach(function () {
    rimraf.sync(join(__dirname, 'output'));
  });
});