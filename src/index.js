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
  if (options['{}'] !== false) {
    patterns = Array.isArray(patterns) ? flatMap(patterns, expand) : expand(patterns)
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
      result += parse(patterns[k], options).pattern
    }
    return '^(' + result + ')$'
  } else if (typeof patterns === 'string') {
    return '^' + parse(patterns, options).pattern + '$'
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function outmatch(patterns, options) {
  options = options && typeof options === 'object' ? options : { separator: options }
  var regExpPattern = compile(patterns, options)
  return new RegExp(regExpPattern)
}

module.exports = outmatch
