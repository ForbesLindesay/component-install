var Q = require('q');
var request = require('superagent')
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

var res = Q(null);
module.exports = function (src, options, callback) {
  if (typeof options === 'function' && typeof callback === 'undefined') {
    callback = options;
    options = null;
  }
  if (typeof options === 'string') {
    options = {destination: options};
  }
  var temp = (res = res.then(null, function () {})
    .then(function () { return downloadFile(src, options); }));
  temp.then(function () {
    if (temp === res) res = Q(null);
  });
  return res.nodeify(callback);
}
function downloadFile(src, options) {
  options = options || {};
  if (options.destination && options.json) throw new Error('`options.destination` is not compatible with `options.json`');
  var req = request.get(src);
  req.set('Accept-Encoding', 'gzip');
  if (options.auth) req.auth(options.auth.user, options.auth.pass);
  if (options.destination) {
    return mkdirp(dirname(options.destination))
      .then(function () {
        return Q.promise(function (resolve, reject) {
          req.buffer(false);
          req.end(function (res) {
            if (res.error) return reject(error(res, src));
            var file = res.pipe(fs.createWriteStream(options.destination));
            res.on('error', reject);
            file.on('error', reject);
            file.on('close', resolve);
          })
          req.on('error', reject);
        });
      });
  } else {
    return Q.promise(function (resolve, reject) {
      req.buffer(true);
      req.end(function (res) {
        if (res.ok) {
          var result = res.text;
          if (options.json) {
            try {
              result = JSON.parse(result);
            } catch (err) {
              err.message += ' in ' + src;
              return reject(src);
            }
          }
          resolve(result);
        } else {
          reject(error(res, src));
        }
      });

      req.on('error', function(err){
        if ('getaddrinfo' == err.syscall) err.message = 'dns lookup failed';
        reject(err);
      });
    });
  }
}

/**
 * Return an error for `res` / `url`.
 *
 * @param {Response} res
 * @param {String} url
 * @return {Error}
 * @api private
 */

function error(res, url) {
  var name = http.STATUS_CODES[res.status];
  var err = new Error('failed to fetch ' + url + ', got ' + res.status + ' "' + name + '"');
  err.status = res.status;
  return err;
}