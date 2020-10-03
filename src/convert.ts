// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

import type { OutmatchOptions } from './index'

const EXCLUDE_DOT_PATTERN = '(?!\\.)'

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

function findSeparatorEnd(pattern: string, i: number, separator: string) {
  let separatorEnd = -1

  for (let j = 0; ; j++) {
    let sepI = j % separator.length
    let patI = i + j

    // A complete separator is found, but there could be more right next to it, so we continue
    if (j > 0 && sepI === 0) {
      separatorEnd = patI - 1
    }

    if (separator[sepI] !== pattern[patI]) {
      break
    }
  }

  return separatorEnd
}

function convertPattern(
  pattern: string,
  options: OutmatchOptions,
  excludeDot: boolean
) {
  let excludeDotPattern = excludeDot ? EXCLUDE_DOT_PATTERN : ''

  // When separator === true, we may use different separators for splitting the pattern
  // and matching samples, so we need more than one separator variables
  let separator = options.separator
  let separatorSplitter = separator === true ? '/' : separator || ''
  let separatorMatcher =
    separator === true
      ? '(/|\\\\)'
      : separatorSplitter && escapeRegExpString(separatorSplitter)

  // Multiple separators in a row are treated as a single one;
  // trailing separators are optional unless they are put in the pattern deliberately
  let optionalSeparator = '(' + separatorMatcher + ')*'
  let requiredSeparator = '(' + separatorMatcher + ')+'

  if (pattern.length === 0) {
    return optionalSeparator
  }

  // When the separator consists of only one char, we use a character class
  // rather than a lookahead because it is faster
  let wildcard = separatorMatcher
    ? separatorMatcher.length === 1
      ? '[^' + separatorMatcher + ']'
      : '((?!' + separatorMatcher + ').)'
    : '.'

  let supportGlobstar = options['**'] !== false
  let supportBrackets = options['[]'] !== false
  let supportParens = options['()'] !== false
  let supportQMark = options['?'] !== false
  let supportStar = options['*'] !== false
  let openingBracket = pattern.length
  let closingBracket = -1
  let parenModifiers = []
  let openingParens = 0
  let closingParens = 0
  let parensHandledUntil = -1
  let scanningForParens = false
  let separatorStart = -1
  let separatorEnd = -1
  let patternEnd = pattern.length - 1
  let segmentStart = 0
  let segmentEnd = patternEnd
  let escapeChar = false
  let result = ''
  let buffer = ''
  let prefix = ''

  // Iterating from -1 to patternEnd + 1 could help us simplify the iteration logic,
  // but apparently it makes the compiler add bounds checks, which degrade performance
  // significantly
  for (let i = 0; i <= patternEnd; i++) {
    let char = pattern[i]
    let nextChar = pattern[i + 1]

    if (
      separator &&
      separatorEnd === -1 &&
      i + separatorSplitter.length <= patternEnd
    ) {
      if (i === 0) {
        separatorStart = i
        separatorEnd = findSeparatorEnd(pattern, separatorStart, separatorSplitter)
      }

      if (i > 0 || separatorEnd === -1) {
        separatorStart = i + 1
        separatorEnd = findSeparatorEnd(pattern, separatorStart, separatorSplitter)

        if (separatorEnd !== -1) {
          segmentEnd = i
        } else {
          separatorStart = -1
        }
      }
    }

    // The straightforward way to handle escaping would be to add the next character
    // to the result as soon as a backslash is found and skip the rest of the current iteration.
    // However, some processing has to be triggered for the last char in a pattern no matter
    // if it is escaped or not, so we can't do this. Instead, we set the escapeChar flag
    // for the next char and handle it in the next iteration (in which we have to be
    // extra careful to reset the flag whenever the iteration completes or continues).
    if (char === '\\') {
      if (i < segmentEnd) {
        escapeChar = true
        continue
      } else {
        // If the last char in a pattern is a backslash, it is omitted
        char = ''
      }
    }

    if (supportBrackets && !scanningForParens) {
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
          prefix = openingBracket === segmentStart ? excludeDotPattern : ''
          result += prefix + '['
          closingBracket = i
          i = openingBracket
        } else if (i === segmentEnd) {
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
      if (char === '[' && !escapeChar && i > closingBracket && i < segmentEnd) {
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
        nextChar === '(' &&
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
          prefix = i === segmentStart ? excludeDotPattern : ''
          if (i > parensHandledUntil) {
            parensHandledUntil = i
          }
          if (char === '!') {
            result += prefix + '((?!'
            buffer = result
            result = ''
          } else {
            result += prefix + '('
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
          closingParens--
          continue
        }
      } else if (char === '|' && closingParens && !escapeChar) {
        result += '|'
        continue
      }

      if (scanningForParens) {
        if (closingParens === openingParens || i === segmentEnd) {
          scanningForParens = false
          i = parensHandledUntil - 1
        }
        escapeChar = false
        continue
      }
    }

    let isGlobstar =
      separator &&
      supportGlobstar &&
      i === segmentEnd &&
      segmentEnd - segmentStart === 1 &&
      pattern[segmentStart] === '*' &&
      pattern[segmentEnd] === '*'

    if (i < separatorStart || i > separatorEnd) {
      if (!escapeChar && supportStar && char === '*') {
        if (i === segmentStart) {
          result += excludeDotPattern
        }
        if ((i === segmentEnd && !isGlobstar) || (i < segmentEnd && nextChar !== '*')) {
          result += wildcard + '*'
        }
      } else if (!escapeChar && supportQMark && char === '?') {
        prefix = i === segmentStart ? excludeDotPattern : ''
        result += prefix + wildcard
      } else {
        result += escapeRegExpChar(char)
      }
    }

    // Add a separator matcher if the current char is the last one in a segment or it is
    // a part of a separator (which can happen if the pattern starts with a separator)
    if (separator && (i === segmentEnd || (i >= separatorStart && i <= separatorEnd))) {
      let currentSeparator = i < patternEnd ? requiredSeparator : optionalSeparator

      if (isGlobstar) {
        result += '(' + excludeDotPattern + wildcard + '*' + currentSeparator + ')*'
      } else {
        result += currentSeparator
      }

      if (i < patternEnd) {
        i = separatorEnd
        segmentStart = separatorEnd + 1
        segmentEnd = patternEnd
        separatorEnd = -1
      }
    }

    escapeChar = false
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
    pattern = '(?!^' + convertPattern(pattern, options, false) + '$)'
  } else {
    pattern = convertPattern(pattern, options, options.excludeDot !== false)
  }

  return {
    pattern: pattern,
    negated: negated,
  }
}

export default convert
