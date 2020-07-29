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

function outmatch() {
  var pattern, sample, options, fn

  if (arguments.length === 0) {
    return outmatch
  }

  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i]

    if (typeof arg === 'string') {
      if (typeof pattern === 'undefined') {
        pattern = arg
      } else if (typeof sample === 'undefined') {
        sample = arg
      } else {
        throw new Error('Pattern and sample are already specified')
      }
    } else if (Array.isArray(arg)) {
      if (typeof pattern === 'undefined') {
        pattern = arg
      } else {
        throw new Error('Pattern is already specified')
      }
    } else if (typeof arg === 'object' && arg !== null) {
      options = arg
    } else {
      throw new TypeError('Unknown argument ' + arg)
    }
  }

  options = options || DEFAULT_OPTIONS

  if (typeof pattern !== 'undefined') {
    var regExpPattern = compile(pattern, options)
    var regExp = new RegExp(regExpPattern)

    if (typeof sample === 'undefined') {
      fn = isMatch.bind(null, regExp, options)
      fn.options = options
      fn.pattern = pattern
      fn.regExp = regExp
      return fn
    } else {
      return isMatch(regExp, options, sample)
    }
  } else {
    fn = outmatch.bind(null, options)
    fn.options = options
    return fn
  }
}

outmatch.options = DEFAULT_OPTIONS
module.exports = outmatch
