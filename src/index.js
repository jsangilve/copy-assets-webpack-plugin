/**
 * Webpack plugin that watches and copies files from build directory
 * to specific directories.
 *
 */

const fs = require('fs');
const path = require('path');

const isString = (str) => typeof str === 'string' && str !== '';

function log(msg) {
  console.log('[copy-assets-webpack-plugin] ' + msg); // eslint-disable-line no-console
}

function error(msg) {
  throw '[copy-assets-webpack-plugin] '+ msg;
}

function absolutePath(file, webpackOutput) {
  if (path.isAbsolute(file)) {
    return file;
  }

  return path.resolve(webpackOutput, file);

}

function writeFile(dest, data, fname) {
  fs.stat(dest, (err, stats) => {
    if (err) {
      log(`${fdest} is not a valid destination`);
      return;
    }

    let fdest = (path.isAbsolute(dest)) ? dest : path.resolve(dest);
    if (stats.isDirectory()) {
      fdest = path.join(fdest, fname);
    } else if(!stats.isFile()) {
      error(`dest ${dest} is not a file or directoryr`);
    }

    // Copy asset to destination
    fs.writeFile(fdest, data, (err) => {
      if (err) throw err;
      log(`Copied ${fdest}`);
    });
  });
}


function CopyAssetsPlugin(files = []) {
  if (!Array.isArray(files)) {
    error('files parameter must be an array');
  }

  files.forEach(obj => {
    if (!isString(obj.file) || !isString(obj.dest)) {
      throw new Error('file and destination attributes must be string');
    }
  });

  const apply = (compiler) => {
    compiler.plugin('after-emit', function(compilation, cb) {
      let webpackOutput = path.resolve(compilation.outputOptions.path);
      files.map(obj => {
        let fname = absolutePath(obj.file, webpackOutput);
        let dest = obj.dest;

        fs.readFile(fname, (err, data) => {
          if (err) {
            error(`${fname} asset is not part of the bundle`);
          } else {
            log(`Copying ${fname}`);
            let output = obj.name ? obj.name : path.basename(fname);
            writeFile(dest, data, output);
          }
        });
      });

      cb();
    });
  };

  return {
    apply
  };

}

module.exports = CopyAssetsPlugin;
