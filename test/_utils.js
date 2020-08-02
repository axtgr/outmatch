var outmatch = require('../src')

// TODO: add '\\', '//' and separators with wildcards
var SEPARATORS = [false, '/', '.', ' ', 'sep']

// We assume that tests are run in an ES5 environment, which don't have Object.assign
function assign(to, from) {
  if (!from) {
    from = to
    to = {}
  }
  Object.keys(from).forEach(function (key) {
    to[key] = from[key]
  })
  return to
}

// Replaces slashes in patterns and samples with the actual separator being used
function replaceSeparators(stringOrArray, separator) {
  if (Array.isArray(stringOrArray)) {
    return stringOrArray.map(function (p) {
      return p.replace(/\//g, separator)
    })
  } else {
    return stringOrArray.replace(/\//g, separator)
  }
}

// Used for test deduplication
var testSet = Object.create(null)

function match(pattern, options) {
  var separator =
    options.separator && typeof options.separator === 'string'
      ? options.separator
      : false
  var preparedPattern = separator ? replaceSeparators(pattern, separator) : pattern
  var isMatch = outmatch(preparedPattern, options)

  return function (sample) {
    var args = { options: options, pattern: pattern, sample: sample }
    var argsStr = JSON.stringify(args)

    if (testSet[argsStr]) {
      throw new Error('Duplicate test found: ' + argsStr)
    }

    testSet[argsStr] = true
    sample = separator ? replaceSeparators(sample, separator) : sample
    return isMatch(sample)
  }
}

// Decorates a test with custom assertions and helper methods
// Test functions must be named "zora_spec_fn" to get the correct stack trace
// https://github.com/lorenzofox3/zora/issues/25
function decorateT(t, options, skip) {
  var _test = t.test
  options = options || {}

  t.collectMatchResult = function (pattern, sample, actual, expected) {
    t.collect({
      pass: actual === expected,
      actual: actual,
      expected: expected,
      description:
        '"' +
        pattern +
        (expected ? '" matches "' : '" doesn\'t match "') +
        sample +
        '"',
      operator: expected ? 'ok' : 'notOk',
    })
  }

  t.test = skip
    ? t.skip
    : function (description, fn) {
        _test(description, function zora_spec_fn(t) {
          decorateT(t, options)
          fn(t)
        })
      }

  t.testPerSeparator = skip
    ? t.skip
    : function (description, separators, fn) {
        if (!fn) {
          fn = separators
          separators = null
        }

        _test(description, function zora_spec_fn(t) {
          separators = separators || SEPARATORS
          separators.forEach(function (separator) {
            var sepDescription = separator ? 'Separator: ' + separator : 'No separator'
            t.test(sepDescription, function zora_spec_fn(t) {
              var newOptions = assign(options)
              newOptions.separator = separator
              decorateT(t, newOptions)
              fn(t, separator)
            })
          })
        })
      }

  t.platform = function (platform, description, fn) {
    if (!fn) {
      fn = description
      description = platform
    }

    var newT
    _test(description, function zora_spec_fn(t) {
      // eslint-disable-next-line no-undef
      decorateT(t, options, process.platform !== platform)
      fn && fn(t)
      newT = t
    })
    return newT
  }

  t.options = function (options, description, fn) {
    if (!fn && typeof description === 'function') {
      fn = description
      description = undefined
    }

    var newT
    _test(description, function zora_spec_fn(t) {
      decorateT(t, options)
      fn && fn(t)
      newT = t
    })
    return newT
  }

  t.pattern = function (pattern) {
    var isMatch = match(pattern, options)
    var matcher = {
      matches: function () {
        if (!skip) {
          for (var i = 0; i < arguments.length; i++) {
            t.collectMatchResult(pattern, arguments[i], isMatch(arguments[i]), true)
          }
        }
        return matcher
      },
      matchesWhenSeparated: function () {
        if (!skip) {
          for (var i = 0; i < arguments.length; i++) {
            t.collectMatchResult(
              pattern,
              arguments[i],
              isMatch(arguments[i]),
              Boolean(options.separator)
            )
          }
        }
        return matcher
      },
      doesntMatch: function () {
        if (!skip) {
          for (var i = 0; i < arguments.length; i++) {
            t.collectMatchResult(pattern, arguments[i], isMatch(arguments[i]), false)
          }
        }
        return matcher
      },
      doesntMatchWhenSeparated: function () {
        if (!skip) {
          for (var i = 0; i < arguments.length; i++) {
            t.collectMatchResult(
              pattern,
              arguments[i],
              isMatch(arguments[i]),
              !options.separator
            )
          }
        }
        return matcher
      },
    }
    return matcher
  }
}

function suite(fn) {
  return function (t) {
    decorateT(t)
    return fn(t)
  }
}

module.exports.SEPARATORS = SEPARATORS
module.exports.match = match
module.exports.suite = suite
