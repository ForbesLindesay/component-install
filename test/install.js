require('mocha-as-promised')();
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var join = require('path').join;
var fs = require('fs');
var assert = require('assert');
var install = require('../');

describe('install', function () {
  beforeEach(function (done) {
    copyDir(join(__dirname, 'fixture', 'install'), join(__dirname, 'output', 'install'), done);
  });
  describe('install(directory, false)', function () {
    it('installs the component along with its dependencies to that directory', function () {
      return install(join(__dirname, 'output', 'install'), false)
        .then(function () {
          equalDir(join(__dirname, 'output', 'install'), join(__dirname, 'fixture', 'install-res-1'));
        });
    });
  });
  describe('install(directory, true)', function () {
    it('installs the component along with its dependencies + development dependencies to that directory', function () {
      return install(join(__dirname, 'output', 'install'), true)
        .then(function () {
          equalDir(join(__dirname, 'output', 'install'), join(__dirname, 'fixture', 'install-res-2'));
        });
    });
  });
  describe('install(directory, false, output)', function () {
    it('installs the component along with its dependencies into the output directory', function (done) {
      return install(join(__dirname, 'output', 'install'), false, join(__dirname, 'output', 'install', 'deps'))
        .then(function () {
          equalDir(join(__dirname, 'output', 'install'), join(__dirname, 'fixture', 'install-res-3'));
        });
    });
  });
  afterEach(function () {
    rimraf.sync(join(__dirname, 'output'));
  });
});

function copyDir(src, dest, cb) {
  mkdirp(dest, function (err) {
    if (err) return cb(err);
    var remaining = 1;
    var files = fs.readdirSync(src);
    for(var i = 0; i < files.length; i++) {
      var current = fs.statSync(join(src, files[i]));
      if(current.isDirectory()) {
        remaining++;
        copyDir(join(src, files[i]), join(dest, files[i]), completeOne);
      } else if (current.isFile()) {
        remaining++;
        copy(join(src, files[i]), join(dest, files[i]), completeOne);
      }
    }
    completeOne();
    var done = false;
    function completeOne(err) {
      if (err && !done) {
        done = true;
        return cb(err);
      }
      if (0 === --remaining && !done) {
        done = true;
        return cb();
      }
    }
  });
}
function copy(src, dest, cb) {
  var oldFile = fs.createReadStream(src);
  var newFile = fs.createWriteStream(dest);
  oldFile.pipe(newFile);
  oldFile.on('error', cb);
  newFile.on('error', cb);
  newFile.on('close', cb);
}

function equalDir(src, dest) {
  var files = fs.readdirSync(src);
  for(var i = 0; i < files.length; i++) {
    var current = fs.statSync(join(src, files[i]));
    if(current.isDirectory()) {
      equalDir(join(src, files[i]), join(dest, files[i]));
    } else if (current.isFile()) {
      equal(join(src, files[i]), join(dest, files[i]));
    }
  }
}
function equal(src, dest) {
  if (/\.js$/i.test(src) || /\.json$/i.test(src) || /\.html$/i.test(src) || /\.css$/i.test(src)) {
    var a = fs.readFileSync(src).toString().replace(/\r/g, '');
    var b = fs.readFileSync(dest).toString().replace(/\r/g, '');
    assert.equal(a, b);
  }
}
