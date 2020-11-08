import type { OutmatchOptions } from './common'
import expand from './expand'
import negate from './negate'
import convert from './convert'

function flatMap<T, R>(array: Array<T>, predicate: (arg: T) => Array<R>) {
  let results = []
  for (let i = 0; i < array.length; i++) {
    let mappedValue = predicate(array[i])
    for (let j = 0; j < mappedValue.length; j++) {
      results.push(mappedValue[j])
    }
  }
  return results
}

function compile(patterns: string | string[], options: OutmatchOptions) {
  patterns = Array.isArray(patterns) ? patterns : [patterns]

  if (options['{}'] !== false) {
    patterns = flatMap(patterns, expand)
  }

  let positiveResults = []
  let negativeResults = []
  let result = ''

  for (let i = 0; i < patterns.length; i++) {
    let negatedPattern = negate(patterns[i], options)
    let convertedPattern = convert(
      negatedPattern.pattern,
      options,
      !negatedPattern.isNegated
    )

    if (negatedPattern.isNegated) {
      negativeResults.push(convertedPattern)
    } else {
      positiveResults.push(convertedPattern)
    }
  }

  if (negativeResults.length) {
    result = `(?!(?:${negativeResults.join('|')})$)`
  }

  if (positiveResults.length > 1) {
    result += `(?:${positiveResults.join('|')})`
  } else if (positiveResults.length === 1) {
    result += positiveResults[0]
  } else if (result.length) {
    result += convert('**', options, true)
  }

  return `^${result}$`
}

interface isMatch {
  /**
   * Tests if a sample string matches the pattern(s)
   *
   * ```js
   * isMatch('foo') //=> true
   * ```
   */
  (sample: string): boolean

  /** The compiled regular expression */
  regexp: RegExp

  /** The original pattern or array of patterns that was used to compile the RegExp */
  pattern: string | string[]

  /** The options that were used to compile the RegExp */
  options: OutmatchOptions
}

function isMatch(regexp: RegExp, sample: string) {
  if (typeof sample !== 'string') {
    throw new TypeError(`Sample must be a string, but ${typeof sample} given`)
  }

  return regexp.test(sample)
}

/**
 * Compiles one or more glob patterns into a RegExp and returns an isMatch function.
 * The isMatch function takes a sample string as its only argument and returns true
 * if the string matches the pattern(s).
 *
 * ```js
 * outmatch('src/*.js')('src/index.js') //=> true
 * ```
 *
 * ```js
 * const isMatch = outmatch('*.example.com', '.')
 * isMatch('foo.example.com') //=> true
 * isMatch('foo.bar.com') //=> false
 * ```
 */
function outmatch(
  pattern: string | string[],
  options?: OutmatchOptions | string | boolean
): isMatch {
  if (typeof pattern !== 'string' && !Array.isArray(pattern)) {
    throw new TypeError(
      `The first argument must be a single pattern string or an array of patterns, but ${typeof pattern} given`
    )
  }

  if (typeof options === 'string' || typeof options === 'boolean') {
    options = { separator: options }
  }

  if (
    arguments.length === 2 &&
    !(
      typeof options === 'undefined' ||
      (typeof options === 'object' && options !== null && !Array.isArray(options))
    )
  ) {
    throw new TypeError(
      `The second argument must be an options object or a string/boolean separator, but ${typeof options} given`
    )
  }

  options = options || {}

  if (options.separator === '\\') {
    throw new Error('\\ is not a valid separator')
  }

  let regexpPattern = compile(pattern, options)
  let regexp = new RegExp(regexpPattern, options.flags)

  let fn = isMatch.bind(null, regexp) as isMatch
  fn.options = options
  fn.pattern = pattern
  fn.regexp = regexp
  return fn
}

export default outmatch
