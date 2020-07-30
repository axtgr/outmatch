// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

'use strict'

var expand = require('./expand')
var parse = require('./parse')

var DEFAULT_OPTIONS = { separator: '/' }

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

function isMatch(regExp, options, sample) {
  if (typeof sample !== 'string') {
    throw new TypeError('Sample must be a string, but ' + typeof sample + ' given')
  }

  return regExp.test(sample)
}

function outmatch(pattern, options) {
  if (typeof pattern !== 'string' && !Array.isArray(pattern)) {
    throw new TypeError(
      'Pattern must be a string or an array of strings, but ' +
        typeof pattern +
        ' given'
    )
  }

  if (
    arguments.length === 2 &&
    (Array.isArray(options) ||
      (typeof options !== 'object' && typeof options !== 'undefined'))
  ) {
    throw new TypeError('Options must be an object, but ' + typeof options + ' given')
  }

  options = options || DEFAULT_OPTIONS

  var regExpPattern = compile(pattern, options)
  var regExp = new RegExp(regExpPattern)

  var fn = isMatch.bind(null, regExp, options)
  fn.options = options
  fn.pattern = pattern
  fn.regExp = regExp
  return fn
}

outmatch.options = DEFAULT_OPTIONS
module.exports = outmatch
