// eslint-disable-next-line prefer-destructuring
var Suite = require('benchmark').Suite
var globrex = require('globrex')
var picomatch = require('picomatch')
var matcher = require('matcher')
var outmatch = require('../build')

function formatNumber(number) {
  return String(number.toFixed(0))
    .split('')
    .reverse()
    .join('')
    .replace(/\d{3}/g, '$&,')
    .split('')
    .reverse()
    .join('')
    .replace(/^,/, '')
    .padStart('100,000,000'.length + 2)
}

function handleStart(event) {
  var longestName = ''
  for (var i = 0; i < event.currentTarget.length; i++) {
    if (event.currentTarget[i].name.length > longestName.length) {
      longestName = event.currentTarget[i].name
    }
  }
  event.currentTarget.longestName = longestName
  // eslint-disable-next-line prefer-template
  console.log('\n' + event.currentTarget.name)
}

function handleCycle(event) {
  var name = event.target.name.padEnd(event.currentTarget.longestName.length + 2)
  var hz = formatNumber(event.target.hz)
  console.log(' ', name, hz, 'ops/sec')
}

function pattern() {
  // Make sure the engine doesn't optimize for static strings
  var str = 'src'
  return `${str || 'asd'}/test/**/*.?s`
}

function sample() {
  return 'src/test/foo/bar.js'
}

var OPTIONS = {
  outmatch: { separator: false, '**': false },
  outmatchSep: { separator: true },
  globrex: { globstar: false, filepath: false, extended: true, strict: false },
  globrexSep: { globstar: true, filepath: true, extended: true, strict: false },
  picomatchSep: {
    nobrace: false,
    nounique: true,
    noquantifiers: true,
    nobracket: false,
    noextglob: false,
    nonegate: false,
    noglobstar: false,
  },
}
var MATCHERS = {
  outmatch: outmatch(pattern(), OPTIONS.outmatch),
  outmatchSep: outmatch(pattern(), OPTIONS.outmatchSep),
  globrex: globrex(pattern(), OPTIONS.globrex).regex,
  globrexSep: globrex(pattern(), OPTIONS.globrexSep).regex,
  picomatchSep: picomatch(pattern(), OPTIONS.picomatchSep),
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
  .add('globrex', compile(globrex, OPTIONS.globrex))
  .add('globrex separated', compile(globrex, OPTIONS.globrexSep))
  .add('picomatch', compile(picomatch))
  .add('picomatch separated', compile(picomatch, OPTIONS.picomatchSep))
  .add('outmatch', compile(outmatch, OPTIONS.outmatch))
  .add('outmatch separated', compile(outmatch, OPTIONS.outmatchSep))
  .on('start', handleStart)
  .on('cycle', handleCycle)
  .run()

new Suite('Matching')
  .add('matcher', match(matcher.isMatch.bind(null, pattern())))
  .add('globrex', match(MATCHERS.globrex))
  .add('globrex separated', match(MATCHERS.globrexSep))
  .add('picomatch separated', match(MATCHERS.picomatchSep))
  .add('outmatch', match(MATCHERS.outmatch))
  .add('outmatch separated', match(MATCHERS.outmatchSep))
  .on('start', handleStart)
  .on('cycle', handleCycle)
  .run()

// Compilation
//   globrex                   1,212,953 ops/sec
//   globrex separated           398,357 ops/sec
//   outmatch                  1,122,997 ops/sec
//   outmatch separated          695,059 ops/sec
//   picomatch                   260,891 ops/sec
//   picomatch separated         260,646 ops/sec

// Matching
//   matcher                   1,728,087 ops/sec
//   globrex                  30,153,608 ops/sec
//   globrex separated        25,169,136 ops/sec
//   picomatch separated      10,710,969 ops/sec
//   outmatch                 48,106,255 ops/sec
//   outmatch separated       31,488,635 ops/sec
