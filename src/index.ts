import expand from './expand'
import convert from './convert'

interface OutmatchOptions {
  separator?: string | boolean
  '!'?: boolean
  '?'?: boolean
  '*'?: boolean
  '**'?: boolean
  '[]'?: boolean
  '()'?: boolean
  '{}'?: boolean
  '.'?: boolean
}

const DEFAULT_OPTIONS = { separator: true }

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

  let positivePatterns = []
  let result = ''
  let convertedPattern

  for (let i = 0; i < patterns.length; i++) {
    convertedPattern = convert(patterns[i], options)

    if (convertedPattern.negated) {
      result += convertedPattern.pattern
    } else {
      positivePatterns.push(convertedPattern.pattern)
    }
  }

  if (positivePatterns.length > 1) {
    result += '(' + positivePatterns.join('|') + ')'
  } else if (positivePatterns.length === 1) {
    result += positivePatterns[0]
  } else if (result.length > 0) {
    result += convert('**', options).pattern
  }

  return '^' + result + '$'
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
  regExp: RegExp

  /** The original pattern or an array of patterns that was used to compile the RegExp */
  pattern: string | string[]

  /** The options that were used to compile the RegExp */
  options: OutmatchOptions
}

function isMatch(regExp: RegExp, sample: string) {
  if (typeof sample !== 'string') {
    throw new TypeError('Sample must be a string, but ' + typeof sample + ' given')
  }

  return regExp.test(sample)
}

/**
 * Creates an isMatch function from one or more glob patterns. The isMatch function
 * takes a sample string as its only argument and returns true if the string matches
 * the pattern.
 *
 * ```js
 * outmatch('src/*.js')('src/index.js') //=> true
 * ```
 *
 * ```js
 * const isMatch = outmatch('components/*.{?s,?sx}')
 * isMatch('components/head.jsx') //=> true
 * isMatch('components/body/readme.md') //=> false
 * ```
 */
function outmatch(pattern: string | string[], options?: OutmatchOptions): isMatch {
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

  let regExpPattern = compile(pattern, options)
  let regExp = new RegExp(regExpPattern)

  let fn = isMatch.bind(null, regExp) as isMatch
  fn.options = options
  fn.pattern = pattern
  fn.regExp = regExp
  return fn
}

outmatch.options = DEFAULT_OPTIONS

export { outmatch as default, OutmatchOptions }
