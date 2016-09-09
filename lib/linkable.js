// show the installed versions of packages
//
// --parseable creates output like this:
// <fullpath>:<name@ver>:<realpath>:<flags>
// Flags are a :-separated list of zero or more indicators

module.exports = exports = linkable

var path = require('path')
var fs = require('graceful-fs')
var asyncMap = require('slide').asyncMap
var npm = require('./npm.js')
var link = require('./link.js')
var usage = require('./utils/usage')
var output = require('./utils/output.js')

linkable.usage = 'npm linkable'

function linkable (args, cb) {

  if (npm.config.get('global')) {
    return cb(new Error(
      'linkable should never be --global.\n' +
      'Please re-run this command with --local'
    ))
  }

  fs.readdir(npm.globalDir, function (er, children) {
    // Any error other than ENOTDIR means it's not readable, or doesn't exist.
    // Give up.
    if (er && er.code !== 'ENOTDIR') return cb(er)

    asyncMap(children, function(pkg, cb) {

      var pkgPath = path.resolve(npm.globalDir, pkg)

      fs.lstat(pkgPath, function(er, stat) {
        if (er) return cb(er)

        if (stat.isSymbolicLink()) {
          return cb(null, {name: pkg, target: pkgPath})
        }
        return cb()
      })
    }, function(err, pkgs) {
      outputLinkablePackages(pkgs, cb)
    })
  })
}

function outputLinkablePackages (pkgs, cb) {

  var text = []
  text.push('\nNPM Global Directory: ' + npm.globalDir)

  if (pkgs.length) {
    text.push('Number of Linkable Modules: ' + pkgs.length + '\n')
  } else {
    text.push('No linked packages found.\n')
  }

  output(text.join('\n'))

  pkgs.forEach(function (pkg) {
    link.resultPrinter(pkg.name, pkg.target, pkg.name, function(result) {
      // how to remove?
    })
  });

  output('')
  cb()
}

