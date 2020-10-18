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
  console.log('\n' + event.currentTarget.name)
}

function handleCycle(event) {
  var name = event.target.name.padEnd(event.currentTarget.longestName.length + 2)
  var hz = formatNumber(event.target.hz)
  console.log(' ', name, hz, 'ops/sec')
}

var OPTIONS = {
  outmatch: { separator: false, '**': false },
  outmatchSep: { separator: '/' },
  globrex: { globstar: false, filepath: false, extended: true, strict: false },
  globrexSep: { globstar: true, filepath: true, extended: true, strict: false },
  picomatchSep: {
    nobrace: true,
    nounique: true,
    noquantifiers: true,
    nobracket: false,
    noextglob: false,
    nonegate: false,
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
  return (str || 'asd') + '/test/**/*.?s'
}

function sample() {
  return 'src/test/foo/bar.js'
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
  .on('start', handleStart)
  .on('cycle', handleCycle)
  .run()

new Suite('Matching')
  .add('outmatch', match(MATCHERS.outmatch))
  .add('outmatch separated', match(MATCHERS.outmatchSep))
  .add('globrex', match(MATCHERS.globrex))
  .add('globrex separated', match(MATCHERS.globrexSep))
  .add('picomatch separated', match(MATCHERS.picomatchSep))
  .add('matcher', match(matcher.isMatch.bind(null, pattern())))
  .on('start', handleStart)
  .on('cycle', handleCycle)
  .run()

// Compilation
//   outmatch                  1,106,172 ops/sec
//   outmatch separated          644,122 ops/sec
//   globrex                   1,318,078 ops/sec
//   globrex separated           403,270 ops/sec
//   picomatch                   256,077 ops/sec
//   picomatch separated         253,864 ops/sec

// Matching
//   outmatch                 43,276,103 ops/sec
//   outmatch separated       28,203,622 ops/sec
//   globrex                  28,432,880 ops/sec
//   globrex separated        22,283,523 ops/sec
//   picomatch separated       9,510,707 ops/sec
//   matcher                   1,738,161 ops/sec
