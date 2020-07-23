// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

'use strict'

var expandBraces = require('./expandBraces')
var build = require('./build')

function negatePattern(pattern, options, buildFn) {
  var isNegated = false

  for (var i = 0; i < pattern.length && pattern[i] === '!'; i++) {
    isNegated = !isNegated
  }

  if (i > 0) {
    pattern = pattern.substr(i)
  }

  if (isNegated) {
    return '(?!^' + buildFn(pattern, options) + '$).*'
  } else {
    return buildFn(pattern, options)
  }
}

function expandPatterns(patterns) {
  if (Array.isArray(patterns)) {
    var results = []
    for (var i = 0; i < patterns.length; i++) {
      var expandedPattern = expandBraces(patterns[i])
      for (var j = 0; j < expandedPattern.length; j++) {
        results.push(expandedPattern[j])
      }
    }
    return results
  } else if (typeof patterns === 'string') {
    return expandBraces(patterns)
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function buildRegExpPattern(patterns, options) {
  var supportNegation = options['!'] !== false
  var buildFn = options.separator ? build.separatedPattern : build.basicPattern
  var result = ''

  if (options['{}'] !== false) {
    patterns = expandPatterns(patterns)
  }

  if (Array.isArray(patterns) && patterns.length === 1) {
    patterns = patterns[0]
  }

  if (Array.isArray(patterns)) {
    result = ''
    for (var k = 0; k < patterns.length; k++) {
      if (k > 0) {
        result += '|'
      }
      result += negatePattern(patterns[k], options, buildFn)
    }
    return '^(' + result + ')$'
  } else if (typeof patterns === 'string') {
    if (supportNegation) {
      return '^' + negatePattern(patterns, options, buildFn) + '$'
    } else {
      return '^' + buildFn(patterns, options) + '$'
    }
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function outmatch(patterns, options) {
  options = options && typeof options === 'object' ? options : { separator: options }
  var regExpPattern = buildRegExpPattern(patterns, options)
  return new RegExp(regExpPattern)
}

module.exports = outmatch
