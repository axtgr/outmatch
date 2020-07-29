'use strict'

function escapeRegExpChar(char) {
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
    char === '?'
  ) {
    return '\\' + char
  } else {
    return char
  }
}

function escapeRegExpString(str) {
  var result = ''
  for (var i = 0; i < str.length; i++) {
    result += escapeRegExpChar(str[i])
  }
  return result
}

function convertBasicPattern(pattern, options, wildcard) {
  var supportBrackets = options['[]'] !== false
  var supportParens = options['()'] !== false
  var supportQMark = options['?'] !== false
  var supportStar = options['*'] !== false
  var openingBracket = pattern.length
  var closingBracket = -1
  var parenModifiers = []
  var openingParens = 0
  var closingParens = 0
  var parensHandledUntil = -1
  var scanningForParens = false
  var escapeChar = false
  var maxI = pattern.length - 1
  var result = ''
  var buffer

  wildcard = wildcard || '.'

  for (var i = 0; i <= maxI; i++) {
    var char = pattern[i]

    // The straightforward way to handle escaping would be to add the next character
    // to the result as soon as a backslash is found and skip the rest of the current iteration.
    // However, some processing has to be triggered for the last char in a pattern no matter
    // if it is escaped or not, so we can't do this. Instead, we set the escapeChar flag
    // for the next char and handle it in the next iteration (in which we have to be
    // extra careful to reset the flag whenever it completes or continues).
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

      if (char === '[' && !escapeChar && i > closingBracket && i < maxI) {
        openingBracket = i
        escapeChar = false
        continue
      }
    }

    if (supportParens) {
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
          var modifier = parenModifiers.pop()
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
    } else if (!escapeChar && supportQMark && char === '?') {
      result += wildcard
    } else {
      result += escapeRegExpChar(char)
    }

    escapeChar = false
  }

  return result
}

function convertSeparatedPattern(pattern, options) {
  var separator = options.separator
  var segments = pattern.split(separator)
  var escapedSeparator = escapeRegExpString(separator)
  var result = ''
  var supportGlobstar = options['**'] !== false
  var wildcard

  if (separator.length > 1) {
    wildcard = '((?!' + escapedSeparator + ').)'
  } else {
    wildcard = '[^' + escapedSeparator + ']'
  }

  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i]
    if (i < segments.length - 1) {
      if (supportGlobstar && segment === '**') {
        result += '(' + wildcard + '*' + escapedSeparator + ')*'
      } else {
        result += convertBasicPattern(segment, options, wildcard) + escapedSeparator
      }
    } else {
      if (supportGlobstar && segment === '**') {
        result += '.*'
      } else {
        result += convertBasicPattern(segment, options, wildcard)
      }
    }
  }

  return result
}

function parse(pattern, options) {
  if (typeof pattern !== 'string') {
    throw new TypeError('A pattern must be a string, but ' + typeof pattern + ' given')
  }

  if (options.separator === '\\') {
    throw new Error('\\ is not a valid separator')
  }

  var convertFn = options.separator ? convertSeparatedPattern : convertBasicPattern
  var supportNegation = options['!'] !== false
  var supportParens = options['()'] !== false
  var negated = false

  if (supportNegation) {
    for (var i = 0; i < pattern.length && pattern[i] === '!'; i++) {
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

module.exports = parse
