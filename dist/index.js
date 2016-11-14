'use strict';

/**
 * Webpack plugin that watches and copies files from build directory
 * to specific directories.
 *
 */

var fs = require('fs');
var path = require('path');

var isString = function isString(str) {
  return typeof str === 'string' && str !== '';
};

function log(msg) {
  console.log('[copy-assets-webpack-plugin] ' + msg); // eslint-disable-line no-console
}

function error(msg) {
  throw '[copy-assets-webpack-plugin] ' + msg;
}

function absolutePath(file, webpackOutput) {
  if (path.isAbsolute(file)) {
    return file;
  }

  return path.resolve(webpackOutput, file);
}

function writeFile(dest, data, fname) {
  fs.stat(dest, function (err, stats) {
    if (err) {
      log(fdest + ' is not a valid destination');
      return;
    }

    var fdest = path.isAbsolute(dest) ? dest : path.resolve(dest);
    if (stats.isDirectory()) {
      fdest = path.join(fdest, fname);
    } else if (!stats.isFile()) {
      error('dest ' + dest + ' is not a file or directoryr');
    }

    // Copy asset to destination
    fs.writeFile(fdest, data, function (err) {
      if (err) throw err;
      log('Copied ' + fdest);
    });
  });
}

function CopyAssetsPlugin() {
  var files = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  if (!Array.isArray(files)) {
    error('files parameter must be an array');
  }

  files.forEach(function (obj) {
    if (!isString(obj.file) || !isString(obj.dest)) {
      throw new Error('file and destination attributes must be string');
    }
  });

  var apply = function apply(compiler) {
    compiler.plugin('after-emit', function (compilation, cb) {
      var webpackOutput = path.resolve(compilation.outputOptions.path);
      files.map(function (obj) {
        var fname = absolutePath(obj.file, webpackOutput);
        var dest = obj.dest;

        fs.readFile(fname, function (err, data) {
          if (err) {
            error(fname + ' asset is not part of the bundle');
          } else {
            log('Copying ' + fname);
            var output = obj.name ? obj.name : path.basename(fname);
            writeFile(dest, data, output);
          }
        });
      });

      cb();
    });
  };

  return {
    apply: apply
  };
}

module.exports = CopyAssetsPlugin;
