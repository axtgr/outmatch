// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

'use strict'

var expandBraces = require('./expandBraces')
var build = require('./build')

function expand(patterns) {
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

function parse(patterns, options) {
  if (options['{}'] !== false) {
    patterns = expand(patterns)
  }

  if (Array.isArray(patterns) && patterns.length === 1) {
    patterns = patterns[0]
  }

  if (Array.isArray(patterns)) {
    var result = ''
    for (var k = 0; k < patterns.length; k++) {
      if (k > 0) {
        result += '|'
      }
      result += build(patterns[k], options)
    }
    return '^(' + result + ')$'
  } else if (typeof patterns === 'string') {
    return '^' + build(patterns, options) + '$'
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function outmatch(patterns, options) {
  options = options && typeof options === 'object' ? options : { separator: options }
  var regExpPattern = parse(patterns, options)
  return new RegExp(regExpPattern)
}

module.exports = outmatch
