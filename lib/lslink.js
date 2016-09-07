// show the installed versions of packages
//
// --parseable creates output like this:
// <fullpath>:<name@ver>:<realpath>:<flags>
// Flags are a :-separated list of zero or more indicators

module.exports = exports = lsLink

var path = require('path')
var fs = require('graceful-fs')
var asyncMap = require('slide').asyncMap
var npm = require('./npm.js')
var link = require('./link.js')
var usage = require('./utils/usage')
var output = require('./utils/output.js')

lsLink.usage = 'npm ls-link'

function lsLink (args, cb) {

  if (npm.config.get('global')) {
    return cb(new Error(
      'lslink should never be --global.\n' +
      'Please re-run this command with --local'
    ))
  }

  var linkedPackages = [];

  fs.readdir(npm.dir, function (er, children) {
    // Any error other than ENOTDIR means it's not readable, or doesn't exist.
    // Give up.
    if (er && er.code !== 'ENOTDIR') return cb(er)

    asyncMap(children, function(pkg, cb) {

      var pkgPath = path.resolve(npm.dir, pkg)
      var linkedPath = path.resolve(npm.globalDir, pkg)

      fs.lstat(pkgPath, function(er, stat) {
        if (er) return cb(er)

        if (stat.isSymbolicLink()) {
          return cb(null, {name: pkg, src: linkedPath, target: pkgPath})
        }
        return cb()
      })

      return true
    }, function(err, pkgs) {
      outputSymLinkedPackages(pkgs, cb)
    })
  })
}

function outputSymLinkedPackages (pkgs, cb) {

  var text = []
  text.push('\nNPM Directory: ' + npm.dir)

  if (pkgs.length) {
    text.push('Number of Linked Modules: ' + pkgs.length + '\n')
  } else {
    text.push('No linked packages found.\n')
  }

  output(text.join('\n'))

  pkgs.forEach(function (pkg) {
    link.resultPrinter(pkg.name, pkg.src, pkg.target, pkg.src, function(result) {
    })
  });

  output('')

  cb()
}

