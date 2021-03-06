var Q = require('q');
var concat = require('concat-stream');
var request = require('hyperquest');
var http = require('http');
var mkdirp = Q.nfbind(require('mkdirp'));
var dirname = require('path').dirname;
var fs = require('fs');
var zlib = require('zlib');

/**
 * Asynchronously download a file.  If a destination is provided the file is streamed and the result is null.
 *
 * @param {String}   src           The url of the file to download
 * @param {Object}   [options]     Hash with optional properties `auth` and `json`
 * @param {String}   [options.destination] The file path to save the file to.
 * @param {Object}   [options.auth]        Hash with `user` and `pass` for basic authentication
 * @param {Boolean}  [options.json]         Set to true to recieve a JSON parsed response (not compatible with "destination")
 * @param {Function} [callback]    Optional callback(err, res), if absent, a promise will be returned
 * @api private
 */

module.exports = function (src, options, callback) {
  if (typeof options === 'function' && typeof callback === 'undefined') {
    callback = options;
    options = null;
  }
  if (typeof options === 'string') {
    options = {destination: options};
  }
  return downloadFile(src, options).nodeify(callback);
}
function downloadFile(src, options) {
  options = options || {};
  if (options.destination && options.json) throw new Error('`options.destination` is not compatible with `options.json`');
  if (options.destination) {
    return mkdirp(dirname(options.destination))
      .then(function () {
        return Q.promise(function (resolve, reject) {
          var req = basicGet(src, reject);

          var file = req.pipe(fs.createWriteStream(options.destination));
          file.on('error', reject);
          file.on('close', resolve);
        });
      });
  } else {
    return Q.promise(function (resolve, reject) {
      var req = basicGet(src, reject);

      req.pipe(concat(function (err, res) {
        if (err) return reject(err);
        res = res.toString();
        if (options.json) {
          try {
            res = JSON.parse(res);
          } catch (err) {
            err.message += ' in ' + src;
            return reject(err);
          }
        }
        resolve(res);
      }));
    });
  }
}

function basicGet(src, reject) {
  var req = request(src);

  req.setHeader('Accept-Encoding', 'gzip');

  req.on('error', function(err){
    if ('getaddrinfo' == err.syscall) err.message = 'dns lookup failed';
    reject(err);
  });

  req.on('response', function (res) {
    if (res.statusCode >= 400) {
      var name = http.STATUS_CODES[res.statusCode];
      var err = new Error('failed to fetch ' + src + ', got ' + res.statusCode + ' "' + name + '"');
      err.statusCode = res.statusCode;
      reject(err);
    }
  });

  return req.pipe(zlib.createGunzip());
}