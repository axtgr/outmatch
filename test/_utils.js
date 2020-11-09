/* eslint-env node */

import outmatch from '../build'

// TODO: add '\\', '//' and separators with wildcards
const SEPARATORS = [true, false, '/', ' ', 's', 'sep']

// We assume that tests are run in an ES5 environment, which don't have Object.assign
function assign(to, from) {
  if (!from) {
    from = to
    to = {}
  }
  Object.keys(from).forEach((key) => {
    to[key] = from[key]
  })
  return to
}

// Replaces slashes in patterns and samples with the actual separator being used
function replaceSeparators(stringOrArray, separator) {
  if (Array.isArray(stringOrArray)) {
    return stringOrArray.map((p) => replaceSeparators(p, separator))
  } else {
    return stringOrArray.replace(/\//g, separator)
  }
}

// Used for test deduplication
let testSet = Object.create(null)

function match(pattern, options) {
  let replaceSep = typeof options.separator === 'string'
  let prepPattern = replaceSep ? replaceSeparators(pattern, options.separator) : pattern
  let isMatch = outmatch(prepPattern, options)

  return (sample) => {
    let args = JSON.stringify({ options, pattern, sample })

    if (testSet[args]) {
      throw new Error(`Duplicate test found: ${args}`)
    }

    testSet[args] = true
    sample = replaceSep ? replaceSeparators(sample, options.separator) : sample
    return isMatch(sample)
  }
}

// Decorates a test with custom assertions and helper methods
// Test functions must be named "zora_spec_fn" to get the correct stack trace
// https://github.com/lorenzofox3/zora/issues/25
function decorateT(t, options, skip) {
  let _test = t.test
  options = options || {}

  t.collectMatchResult = (pattern, sample, actual, expected) => {
    t.collect({
      actual,
      expected,
      pass: actual === expected,
      description: `"${pattern}${
        expected ? '" matches "' : '" doesn\'t match "'
      }${sample}"`,
      operator: expected ? 'ok' : 'notOk',
    })
  }

  t.test = skip
    ? t.skip
    : (description, fn) => {
        _test(description, (t) => {
          decorateT(t, options)
          fn(t)
        })
      }

  t.testPerSeparator = skip
    ? t.skip
    : (description, separators, fn) => {
        if (!fn) {
          fn = separators
          separators = null
        }

        _test(description, (t) => {
          separators = separators || SEPARATORS
          separators.forEach((separator) => {
            let sepDescription = separator ? `Separator: ${separator}` : 'No separator'
            let newOptions = assign(options)
            newOptions.separator = separator
            t.test(sepDescription, (t) => {
              decorateT(t, newOptions)
              fn(t, separator)
            })
          })
        })
      }

  t.platform = skip
    ? () => t
    : (platform) => {
        let newT
        _test(undefined, (t) => {
          newT = decorateT(t, options, process.platform !== platform)
        })
        return newT
      }

  t.options = skip
    ? () => t
    : (options) => {
        let newT
        _test(undefined, (t) => {
          newT = decorateT(t, options)
        })
        return newT
      }

  t.pattern = (pattern) => {
    let isMatch = match(pattern, options)
    let matchSamples = (expected) => (...samples) => {
      if (skip) {
        return matcher
      }

      samples.forEach((sample) => {
        t.collectMatchResult(pattern, sample, isMatch(sample), expected)
      })

      return matcher
    }
    let matcher = {
      matches: matchSamples(true),
      matchesWhenSeparated: matchSamples(Boolean(options.separator)),
      doesntMatch: matchSamples(false),
      doesntMatchWhenSeparated: matchSamples(!options.separator),
    }
    return matcher
  }

  return t
}

function suite(fn) {
  return (t) => {
    decorateT(t)
    return fn(t)
  }
}

export { SEPARATORS, match, suite }
