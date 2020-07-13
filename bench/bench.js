var Suite = require('benchmark').Suite
var globrex = require('globrex')
var picomatch = require('picomatch')
var matcher = require('matcher')
var outmatch = require('../src')

function formatNumber(number) {
  return String(number)
    .split('')
    .reverse()
    .join('')
    .replace(/\d{3}/g, '$&,')
    .split('')
    .reverse()
    .join('')
    .replace(/^,/, '')
}

var OPTIONS = {
  outmatch: null,
  outmatchSep: { separator: '/' },
  globrex: { globstar: false, filepath: false, extended: true, strict: true },
  globrexSep: { globstar: true, filepath: true, extended: true, strict: true },
  picomatchSep: {
    nobrace: true,
    nobracket: false,
    nounique: true,
    noextglob: false,
    nonegate: true,
    noquantifiers: true,
    noglobstar: false,
  },
}
var MATCHERS = {
  outmatch: outmatch('src/**/*.?s', OPTIONS.outmatch),
  outmatchSep: outmatch('src/**/*.?s', OPTIONS.outmatchSep),
  globrex: globrex('src/**/*.?s', OPTIONS.globrex).regex,
  globrexSep: globrex('src/**/*.?s', OPTIONS.globrexSep).regex,
  picomatchSep: picomatch('src/**/*.?s', OPTIONS.picomatchSep),
}

function pattern() {
  // Making sure the engine doesn't optimize for static strings
  var str = 'src'
  return (str || 'asd') + '/zxc/**/*.?s'
}

function sample() {
  return 'src/test/foo.js'
}

function compile(fn, options) {
  return function () {
    fn(pattern(), options)
  }
}

function match(matcher) {
  if (matcher instanceof RegExp) {
    return function () {
      return matcher.test(sample())
    }
  } else {
    return function () {
      return matcher(sample())
    }
  }
}

new Suite('Compilation')
  .add('outmatch', compile(outmatch, OPTIONS.outmatch))
  .add('outmatch separated', compile(outmatch, OPTIONS.outmatchSep))
  .add('globrex', compile(globrex, OPTIONS.globrex))
  .add('globrex separated', compile(globrex, OPTIONS.globrexSep))
  .add('picomatch', compile(picomatch))
  .add('picomatch separated', compile(picomatch, OPTIONS.picomatchSep))
  .on('start', function (event) {
    console.log(event.currentTarget.name)
  })
  .on('cycle', function (event) {
    var name = event.target.name.padEnd('picomatch separated'.length + 2)
    var hz = formatNumber(event.target.hz.toFixed(0)).padStart('100,000,000'.length + 2)
    console.log(' ', name, hz, 'ops/sec')
  })
  .run()

new Suite('Matching')
  .add('outmatch', match(MATCHERS.outmatch))
  .add('outmatch separated', match(MATCHERS.outmatchSep))
  .add('globrex', match(MATCHERS.globrex))
  .add('globrex separated', match(MATCHERS.globrexSep))
  .add('picomatch separated', match(MATCHERS.picomatchSep))
  .add('matcher', match(matcher.isMatch.bind(null, pattern())))
  .on('start', function (event) {
    console.log('\n' + event.currentTarget.name)
  })
  .on('cycle', function (event) {
    var name = event.target.name.padEnd('picomatch separated'.length + 2)
    var hz = formatNumber(event.target.hz.toFixed(0)).padStart('100,000,000'.length + 2)
    console.log(' ', name, hz, 'ops/sec')
  })
  .run()

// Compilation
//   outmatch                  1,803,039 ops/sec
//   outmatch separated        1,483,489 ops/sec
//   globrex                   1,249,040 ops/sec
//   globrex separated           379,373 ops/sec
//   picomatch                   193,992 ops/sec
//   picomatch separated         191,981 ops/sec

// Matching
//   outmatch                 26,669,481 ops/sec
//   outmatch separated       25,857,271 ops/sec
//   globrex                  26,247,172 ops/sec
//   globrex separated        23,403,820 ops/sec
//   picomatch separated      10,574,971 ops/sec
//   matcher                   1,618,739 ops/sec
