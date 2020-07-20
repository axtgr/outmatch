var Suite = require('benchmark').Suite
var globrex = require('globrex')
var picomatch = require('picomatch')
var matcher = require('matcher')
var outmatch = require('../src')

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
//   outmatch                  1,664,949 ops/sec
//   outmatch separated          867,888 ops/sec
//   globrex                   1,098,645 ops/sec
//   globrex separated           392,906 ops/sec
//   picomatch                   199,922 ops/sec
//   picomatch separated         195,299 ops/sec

// Matching
//   outmatch                 27,471,410 ops/sec
//   outmatch separated       26,725,717 ops/sec
//   globrex                  27,453,953 ops/sec
//   globrex separated        24,380,026 ops/sec
//   picomatch separated      10,903,060 ops/sec
//   matcher                   1,687,066 ops/sec
