// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

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

function expandBraces(pattern) {
  var scanning = false
  var openingBraces = 0
  var closingBraces = 0
  var handledUntil = -1
  var results = ['']
  var newResults, span, alternatives, i, j, k, l

  for (i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === '\\') {
      i++
      continue
    }

    if (char === '{') {
      if (scanning) {
        openingBraces++
      } else if (i > handledUntil && !openingBraces) {
        span = pattern.substring(handledUntil + 1, i)
        for (j = 0; j < results.length; j++) {
          results[j] += span
        }
        alternatives = []
        handledUntil = i
        scanning = true
        openingBraces++
      } else {
        openingBraces--
      }
    } else if (char === '}') {
      if (scanning) {
        closingBraces++
      } else if (closingBraces === 1) {
        span = pattern.substring(handledUntil + 1, i)
        alternatives.push(expandBraces(span))
        newResults = []
        for (j = 0; j < results.length; j++) {
          for (k = 0; k < alternatives.length; k++) {
            for (l = 0; l < alternatives[k].length; l++) {
              newResults.push(results[j] + alternatives[k][l])
            }
          }
        }
        results = newResults
        handledUntil = i
        closingBraces--
      } else {
        closingBraces--
      }
    } else if (!scanning && char === ',' && closingBraces === 1) {
      span = pattern.substring(handledUntil + 1, i)
      alternatives.push(expandBraces(span))
      handledUntil = i
    }

    if (scanning && (closingBraces === openingBraces || i === pattern.length - 1)) {
      scanning = false
      i = handledUntil - 1
    }
  }

  if (handledUntil === -1) {
    return [pattern]
  }

  var unhandledFrom = pattern[handledUntil] === '{' ? handledUntil : handledUntil + 1
  if (unhandledFrom < pattern.length) {
    span = pattern.substr(unhandledFrom)
    for (j = 0; j < results.length; j++) {
      results[j] += span
    }
  }

  return results
}

function buildBasicPattern(pattern, options, wildcard) {
  var result = ''
  var openingBracket = pattern.length
  var closingBracket = -1
  var parenModifiers = []
  var openingParens = 0
  var closingParens = 0
  var parensHandledUntil = -1
  var scanningForParens = false
  var supportBrackets = options['[]'] !== false
  var supportParens = options['()'] !== false
  var supportQMark = options['?'] !== false
  var supportStar = options['*'] !== false

  wildcard = wildcard || '.'

  for (var i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === '\\') {
      if (i < pattern.length - 1) {
        result += '\\' + pattern[++i]
      }
      continue
    }

    if (supportBrackets) {
      if (i > openingBracket && i <= closingBracket) {
        // We are certainly in a complete character class
        // and should treat almost all characters literally
        if (i === closingBracket) {
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
        continue
      }

      if (i > openingBracket) {
        // We are in an open character class and are looking for a closing bracket
        // to make sure the class is terminated
        if (char === ']' && i > openingBracket + 1 && i > closingBracket) {
          // Closing bracket is found; return to openingBracket
          // and treat all the in-between chars literally
          result += '['
          closingBracket = i
          i = openingBracket
        } else if (i === pattern.length - 1) {
          // Closing bracket is not found; return to the opening bracket
          // and treat all the in-between chars as usual
          result += '\\['
          i = openingBracket
          openingBracket = pattern.length
          closingBracket = pattern.length
        }
        continue
      }

      if (char === '[' && i > closingBracket && i < pattern.length - 1) {
        openingBracket = i
        continue
      }
    }

    if (supportParens) {
      if (
        pattern[i + 1] === '(' &&
        (char === '@' || char === '?' || char === '*' || char === '+')
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
          result += '('
          openingParens--
          i++
          continue
        } else {
          openingParens--
        }
      } else if (char === ')') {
        if (scanningForParens) {
          closingParens++
        } else if (closingParens) {
          var modifier = parenModifiers.pop()
          result += modifier === '@' ? ')' : ')' + modifier
          closingParens--
          continue
        }
      } else if (char === '|' && closingParens) {
        result += '|'
        continue
      }

      if (scanningForParens) {
        if (closingParens === openingParens || i === pattern.length - 1) {
          scanningForParens = false
          i = parensHandledUntil - 1
        }
        continue
      }
    }

    if (supportStar && char === '*') {
      if (pattern[i - 1] !== '*') {
        result += wildcard + '*'
      }
    } else if (supportQMark && char === '?') {
      result += wildcard
    } else {
      result += escapeRegExpChar(char)
    }
  }

  return result
}

function buildSeparatedPattern(pattern, options) {
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
        result += buildBasicPattern(segment, options, wildcard) + escapedSeparator
      }
    } else {
      if (supportGlobstar && segment === '**') {
        result += '.*'
      } else {
        result += buildBasicPattern(segment, options, wildcard)
      }
    }
  }

  return result
}

function negatePattern(pattern, options, buildFn) {
  var isNegated = false

  for (var i = 0; i < pattern.length && pattern[i] === '!'; i++) {
    isNegated = !isNegated
  }

  if (i > 0) {
    pattern = pattern.substr(i)
  }

  if (isNegated) {
    return '(?!^' + buildFn(pattern, options) + '$).*'
  } else {
    return buildFn(pattern, options)
  }
}

function expandPatterns(patterns) {
  if (Array.isArray(patterns)) {
    var results = []
    for (var i = 0; i < patterns.length; i++) {
      var expandedPattern = expandBraces(patterns[i])
      for (var j = 0; j < expandedPattern.length; j++) {
        results.push(expandedPattern[j])
      }
    }
    return results
  } else if (typeof patterns === 'string') {
    return expandBraces(patterns)
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function buildRegExpPattern(patterns, options) {
  var supportNegation = options['!'] !== false
  var buildFn = options.separator ? buildSeparatedPattern : buildBasicPattern
  var result = ''

  if (options['{}'] !== false) {
    patterns = expandPatterns(patterns)
  }

  if (Array.isArray(patterns) && patterns.length === 1) {
    patterns = patterns[0]
  }

  if (Array.isArray(patterns)) {
    result = ''
    for (var k = 0; k < patterns.length; k++) {
      if (k > 0) {
        result += '|'
      }
      result += negatePattern(patterns[k], options, buildFn)
    }
    return '^(' + result + ')$'
  } else if (typeof patterns === 'string') {
    if (supportNegation) {
      return '^' + negatePattern(patterns, options, buildFn) + '$'
    } else {
      return '^' + buildFn(patterns, options) + '$'
    }
  }

  throw new TypeError('Patterns must be a string or an array of strings')
}

function outmatch(patterns, options) {
  options = options && typeof options === 'object' ? options : { separator: options }
  var regExpPattern = buildRegExpPattern(patterns, options)
  return new RegExp(regExpPattern)
}

module.exports = outmatch
