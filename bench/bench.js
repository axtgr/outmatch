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
  outmatch: { '{}': false },
  outmatchSep: { separator: '/', '{}': false },
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
//   outmatch                  1,609,454 ops/sec
//   outmatch separated          845,102 ops/sec
//   globrex                   1,250,397 ops/sec
//   globrex separated           382,384 ops/sec
//   picomatch                   189,945 ops/sec
//   picomatch separated         193,740 ops/sec

// Matching
//   outmatch                 28,379,367 ops/sec
//   outmatch separated       26,202,168 ops/sec
//   globrex                  28,636,718 ops/sec
//   globrex separated        23,280,770 ops/sec
//   picomatch separated      10,435,150 ops/sec
//   matcher                   1,610,490 ops/sec
