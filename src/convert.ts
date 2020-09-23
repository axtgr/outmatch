// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

import type { OutmatchOptions } from './index'

const IGNORE_DOT_PATTERN = '(?!\\.)'

function escapeRegExpChar(char: string) {
  if (
    char === '-' ||
    char === '^' ||
    char === '$' ||
    char === '+' ||
    char === '.' ||
    char === '(' ||
    char === ')' ||
    char === '|' ||
    char === '[' ||
    char === ']' ||
    char === '{' ||
    char === '}' ||
    char === '*' ||
    char === '?' ||
    char === '\\'
  ) {
    return '\\' + char
  } else {
    return char
  }
}

function escapeRegExpString(str: string) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += escapeRegExpChar(str[i])
  }
  return result
}

function convertBasicPattern(
  pattern: string,
  options: OutmatchOptions,
  wildcard?: string
) {
  let supportBrackets = options['[]'] !== false
  let supportParens = options['()'] !== false
  let supportQMark = options['?'] !== false
  let supportStar = options['*'] !== false
  let ignoreDot = options.ignoreDot !== false
  let openingBracket = pattern.length
  let closingBracket = -1
  let parenModifiers = []
  let openingParens = 0
  let closingParens = 0
  let parensHandledUntil = -1
  let scanningForParens = false
  let escapeChar = false
  let isGlob = false
  let maxI = pattern.length - 1
  let result = ''
  let buffer = ''

  wildcard = wildcard ?? '.'

  for (let i = 0; i <= maxI; i++) {
    let char = pattern[i]

    // The straightforward way to handle escaping would be to add the next character
    // to the result as soon as a backslash is found and skip the rest of the current iteration.
    // However, some processing has to be triggered for the last char in a pattern no matter
    // if it is escaped or not, so we can't do this. Instead, we set the escapeChar flag
    // for the next char and handle it in the next iteration (in which we have to be
    // extra careful to reset the flag whenever the iteration completes or continues).
    if (char === '\\') {
      if (i < maxI) {
        escapeChar = true
        continue
      } else {
        // If the last char in a pattern is a backslash, it is omitted
        char = ''
      }
    }

    if (supportBrackets) {
      if (i > openingBracket && i <= closingBracket) {
        // We are certainly in a complete character class
        // and should treat almost all characters literally
        if (escapeChar) {
          result += escapeRegExpChar(char)
        } else if (i === closingBracket) {
          result += ']'
          openingBracket = pattern.length
        } else if (char === '-' && i === closingBracket - 1) {
          result += '\\-'
        } else if (char === '!' && i === openingBracket + 1) {
          result += '^'
        } else if (char === ']') {
          result += '\\]'
        } else {
          result += char
        }
        escapeChar = false
        continue
      }

      if (i > openingBracket) {
        // We are in an open character class and are looking for a closing bracket
        // to make sure the class is terminated
        if (
          char === ']' &&
          !escapeChar &&
          i > openingBracket + 1 &&
          i > closingBracket
        ) {
          // Closing bracket is found; return to openingBracket
          // and treat all the in-between chars literally
          result += '['
          closingBracket = i
          i = openingBracket
          isGlob = true
        } else if (i === maxI) {
          // Closing bracket is not found; return to the opening bracket
          // and treat all the in-between chars as usual
          result += '\\['
          i = openingBracket
          openingBracket = pattern.length
          closingBracket = pattern.length
        }
        escapeChar = false
        continue
      }

      // An opening bracket is found; commence scanning for a closing bracket
      if (char === '[' && !escapeChar && i > closingBracket && i < maxI) {
        openingBracket = i
        escapeChar = false
        continue
      }
    }

    if (supportParens) {
      // When we find an opening extglob paren, we start counting opening and closing
      // parens and ignoring other chars until all the opened extglobes are closed
      // or the pattern ends. After we have counted the parens, we return to the char
      // we started from and proceed normally while transforming the extglobs that have
      // a closing paren.
      if (
        pattern[i + 1] === '(' &&
        !escapeChar &&
        (char === '@' || char === '?' || char === '*' || char === '+' || char === '!')
      ) {
        if (scanningForParens) {
          parenModifiers.push(char)
          openingParens++
        } else if (i > parensHandledUntil) {
          parensHandledUntil = i
          scanningForParens = true
          openingParens++
          parenModifiers.push(char)
        } else if (closingParens >= openingParens) {
          if (i > parensHandledUntil) {
            parensHandledUntil = i
          }
          if (char === '!') {
            result += '((?!'
            buffer = result
            result = ''
          } else {
            result += '('
          }
          openingParens--
          i++
          continue
        } else {
          openingParens--
        }
      } else if (char === ')' && !escapeChar) {
        if (scanningForParens) {
          closingParens++
        } else if (closingParens) {
          let modifier = parenModifiers.pop()
          if (modifier === '!') {
            buffer += result + ').*|(' + result + ').+)'
            result = buffer
          } else if (modifier === '@') {
            result += ')'
          } else {
            result += ')' + modifier
          }
          isGlob = true
          closingParens--
          continue
        }
      } else if (char === '|' && closingParens && !escapeChar) {
        result += '|'
        continue
      }

      if (scanningForParens) {
        if (closingParens === openingParens || i === maxI) {
          scanningForParens = false
          i = parensHandledUntil - 1
        }
        escapeChar = false
        continue
      }
    }

    if (!escapeChar && supportStar && char === '*') {
      if (i === maxI || pattern[i + 1] !== '*') {
        result += wildcard + '*'
      }
      isGlob = true
    } else if (!escapeChar && supportQMark && char === '?') {
      isGlob = true
      result += wildcard
    } else {
      result += escapeRegExpChar(char)
    }

    escapeChar = false
  }

  // Segments starting with a dot should not be matched unless specified otherwise in options,
  // or the pattern (or segment) explicitly starts with a dot
  if (ignoreDot && isGlob && pattern[0] !== '.') {
    return IGNORE_DOT_PATTERN + result
  } else {
    return result
  }
}

function convertSeparatedPattern(pattern: string, options: OutmatchOptions) {
  let supportGlobstar = options['**'] !== false
  let ignoreDot = options.ignoreDot !== false
  let ignoreDotPattern = ignoreDot ? IGNORE_DOT_PATTERN : ''

  // When separator === true, we may use different separators for splitting the pattern
  // and matching samples, so we need two separator variables
  let separatorSplitter = (options.separator === true
    ? '/'
    : options.separator) as string
  let separatorMatcher =
    options.separator === true ? '(/|\\\\)' : escapeRegExpString(separatorSplitter)

  // Multiple separators in a row are treated as a single one;
  // trailing separators are optional unless they are put in the pattern deliberately
  let optionalSeparator = '(' + separatorMatcher + ')*'
  let requiredSeparator = '(' + separatorMatcher + ')+'

  // When the separator consists of only one char, we use a character class
  // rather than a lookahead because it is faster
  let wildcard =
    separatorMatcher.length === 1
      ? '[^' + separatorMatcher + ']'
      : '((?!' + separatorMatcher + ').)'

  let segments = pattern.split(separatorSplitter)
  let result = ''

  for (let i = 0; i < segments.length; i++) {
    let segment = segments[i]
    let currentSeparator =
      i < segments.length - 1 ? requiredSeparator : optionalSeparator

    if (supportGlobstar && segment === '**') {
      result += '(' + ignoreDotPattern + wildcard + '*' + currentSeparator + ')*'
    } else {
      result += convertBasicPattern(segment, options, wildcard) + currentSeparator
    }
  }

  return result
}

function convert(pattern: string, options: OutmatchOptions) {
  if (typeof pattern !== 'string') {
    throw new TypeError('A pattern must be a string, but ' + typeof pattern + ' given')
  }

  if (options.separator === '\\') {
    throw new Error('\\ is not a valid separator')
  }

  let convertFn = options.separator ? convertSeparatedPattern : convertBasicPattern
  let supportNegation = options['!'] !== false
  let supportParens = options['()'] !== false
  let negated = false
  let i: number

  if (supportNegation) {
    for (i = 0; i < pattern.length && pattern[i] === '!'; i++) {
      if (supportParens && pattern[i + 1] === '(') {
        i--
        break
      }
      negated = !negated
    }

    if (i > 0) {
      pattern = pattern.substr(i)
    }
  }

  if (negated) {
    pattern = '(?!^' + convertFn(pattern, options) + '$)'
  } else {
    pattern = convertFn(pattern, options)
  }

  return {
    pattern: pattern,
    negated: negated,
  }
}

export default convert
