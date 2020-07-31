var outmatch = require('../src')

// TODO: add true (platform-dependant), '\\', '//' and separators with wildcards
var SEPARATORS = [false, '/', '.', ' ', 'sep']

var testSet = Object.create(null)

function replaceSeparators(stringOrArray, separator) {
  if (Array.isArray(stringOrArray)) {
    return stringOrArray.map(function (p) {
      return p.replace(/\//g, separator)
    })
  } else {
    return stringOrArray.replace(/\//g, separator)
  }
}

function match(options) {
  var separator = options.separator || false
  var separatorReplacementNeeded = separator && separator !== '/'

  return function (pattern) {
    // Slashes in patterns and samples are replaced with the actual separator being used
    var preparedPattern = separatorReplacementNeeded
      ? replaceSeparators(pattern, separator)
      : pattern
    var isMatch = outmatch(preparedPattern, options)

    return function () {
      return Array.prototype.slice
        .call(arguments)
        .map(function (sample) {
          var args = { options: options, pattern: pattern, sample: sample }
          var argsStr = JSON.stringify(args)

          if (testSet[argsStr]) {
            throw new Error('Duplicate test found: ' + argsStr)
          }

          testSet[argsStr] = true
          return separatorReplacementNeeded
            ? replaceSeparators(sample, separator)
            : sample
        })
        .every(isMatch)
    }
  }
}

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

function decorateT(t, options) {
  options = options || {}
  var m = match(options)
  var _test = t.test

  t.test = function (description, fn) {
    // Naming the function "zora_spec_fn" is required to get the correct stack trace
    _test(description, function zora_spec_fn(t) {
      decorateT(t)
      fn(t)
    })
  }

  t.testPerSeparator = function (description, separators, fn) {
    if (!fn) {
      fn = separators
      separators = null
    }

    _test(description, function zora_spec_fn(t) {
      separators = separators || SEPARATORS
      separators.forEach(function (separator) {
        var sepDescription = separator ? 'Separator: ' + separator : 'No separator'
        // Naming the function "zora_spec_fn" is required to get the correct stack trace
        t.test(sepDescription, function zora_spec_fn(t) {
          var newOptions = assign(options)
          newOptions.separator = separator
          decorateT(t, newOptions)
          fn(t, separator)
        })
      })
    })
  }

  t.testOnPlatform = function (description, platform, fn) {
    // eslint-disable-next-line no-undef
    var testFn = process.platform === platform ? _test : t.skip
    testFn(description, function zora_spec_fn(t) {
      decorateT(t)
      fn(t)
    })
  }

  t.options = function (opts, overwrite) {
    options = overwrite ? opts || {} : assign(options, opts)
    m = match(options)
  }

  // Custom zora assertions
  // https://github.com/lorenzofox3/zora/issues/25

  t.match = function (pattern) {
    return function (sample) {
      var result = m(pattern)(sample)
      return t.collect({
        pass: result,
        actual: result,
        expected: true,
        description: '"' + sample + '" matches "' + pattern + '"',
        operator: 'ok',
      })
    }
  }

  t.dontMatch = function (pattern) {
    return function (sample) {
      var result = m(pattern)(sample)
      return t.collect({
        pass: !result,
        actual: result,
        expected: false,
        description: '"' + sample + '" doesn\'t match "' + pattern + '"',
        operator: 'notOk',
      })
    }
  }

  t.matchWhenSeparated = function (pattern) {
    if (options.separator) {
      return t.match(pattern)
    } else {
      return t.dontMatch(pattern)
    }
  }

  t.dontMatchWhenSeparated = function (pattern) {
    if (options.separator) {
      return t.dontMatch(pattern)
    } else {
      return t.match(pattern)
    }
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
