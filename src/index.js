// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

'use strict'

var expand = require('./expand')
var parse = require('./parse')

function flatMap(array, predicate) {
  var results = []
  for (var i = 0; i < array.length; i++) {
    var mappedValue = predicate(array[i])
    for (var j = 0; j < mappedValue.length; j++) {
      results.push(mappedValue[j])
    }
  }
  return results
}

function compile(patterns, options) {
  patterns = Array.isArray(patterns) ? patterns : [patterns]

  if (options['{}'] !== false) {
    patterns = flatMap(patterns, expand)
  }

  var positivePatterns = []
  var result = ''
  var parsedPattern

  for (var i = 0; i < patterns.length; i++) {
    parsedPattern = parse(patterns[i], options)

    if (parsedPattern.negated) {
      result += parsedPattern.pattern
    } else {
      positivePatterns.push(parsedPattern.pattern)
    }
  }

  if (positivePatterns.length > 1) {
    result += '(' + positivePatterns.join('|') + ')'
  } else if (positivePatterns.length === 1) {
    result += positivePatterns[0]
  } else if (result.length > 0) {
    result += '.*'
  }

  return '^' + result + '$'
}

function outmatch(patterns, options) {
  options = options && typeof options === 'object' ? options : { separator: options }
  var regExpPattern = compile(patterns, options)
  return new RegExp(regExpPattern)
}

module.exports = outmatch
