var { Suite } = require('benchmark')
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
var REGEXPS = {
  outmatch: outmatch('src/**/*.?s', OPTIONS.outmatch),
  outmatchSep: outmatch('src/**/*.?s', OPTIONS.outmatchSep),
  globrex: globrex('src/**/*.?s', OPTIONS.globrex).regex,
  globrexSep: globrex('src/**/*.?s', OPTIONS.globrexSep).regex,
  picomatchSep: picomatch('src/**/*.?s', OPTIONS.picomatchSep),
}

function pattern() {
  var str = 'src'
  return `${str || 'asd'}/zxc/**/*.?${'s'}`
}

function sample() {
  return 'src/test/foo.js'
}

new Suite('Compilation')
  .add('outmatch', () => outmatch(pattern()), OPTIONS.outmatch)
  .add('outmatch separated', () => outmatch(pattern(), OPTIONS.outmatchSep))
  .add('globrex', () => globrex(pattern(), OPTIONS.globrex))
  .add('globrex separated', () => globrex(pattern(), OPTIONS.globrexSep))
  .add('picomatch', () => picomatch(pattern()))
  .add('picomatch separated', () => picomatch(pattern(), OPTIONS.picomatchSep))
  .on('start', (event) => {
    console.log(event.currentTarget.name)
  })
  .on('cycle', (event) => {
    var name = event.target.name.padEnd('outmatch with no separator'.length + 2)
    var hz = formatNumber(event.target.hz.toFixed(0)).padStart('100,000,000'.length + 2)
    console.log(' ', name, hz, 'ops/sec')
  })
  .run()

new Suite('Matching')
  .add('outmatch', () => REGEXPS.outmatch.test(sample()))
  .add('outmatch separated', () => REGEXPS.outmatchSep.test(sample()))
  .add('globrex', () => REGEXPS.globrex.test(sample()))
  .add('globrex separated', () => REGEXPS.globrexSep.test(sample()))
  .add('picomatch separated', () => REGEXPS.picomatchSep(sample()))
  .add('matcher', () => matcher.isMatch(pattern(), sample()))
  .on('start', (event) => {
    console.log(`\n${event.currentTarget.name}`)
  })
  .on('cycle', (event) => {
    var name = event.target.name.padEnd('anymatch - precompiled'.length + 2)
    var hz = formatNumber(event.target.hz.toFixed(0)).padStart('100,000,000'.length + 2)
    console.log(' ', name, hz, 'ops/sec')
  })
  .run()

// Compilation
//   outmatch                     1,772,519 ops/sec
//   outmatch separated           1,429,059 ops/sec
//   globrex                      1,185,760 ops/sec
//   globrex separated              377,129 ops/sec
//   picomatch                      190,596 ops/sec
//   picomatch separated            190,609 ops/sec

// Matching
//   outmatch                    28,155,155 ops/sec
//   outmatch separated          25,603,147 ops/sec
//   globrex                     26,169,739 ops/sec
//   globrex separated           22,374,638 ops/sec
//   picomatch separated         10,524,039 ops/sec
//   matcher                      1,200,544 ops/sec
