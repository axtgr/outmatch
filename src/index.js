// Disclaimer: the code is optimized for performance and compatibility, hence the ugliness

'use strict'

function escapeRegExpChars(str) {
  var result = ''
  for (var i = 0; i < str.length; i++) {
    var char = str[i]
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
      result += '\\' + char
    } else {
      result += char
    }
  }
  return result
}

function expandBraces(pattern) {
  var scanning = false
  var openingBraces = 0
  var closingBraces = 0
  var handledUntil = -1
  var results = ['']
  var newResults, segment, alternatives, i, j, k, l

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
        segment = pattern.substring(handledUntil + 1, i)
        for (j = 0; j < results.length; j++) {
          results[j] += segment
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
        segment = pattern.substring(handledUntil + 1, i)
        alternatives.push(expandBraces(segment))
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
        continue
      } else {
        closingBraces--
      }
    } else if (!scanning && char === ',' && closingBraces === 1) {
      segment = pattern.substring(handledUntil + 1, i)
      alternatives.push(expandBraces(segment))
      handledUntil = i
      continue
    }

    if (scanning) {
      if (closingBraces === openingBraces || i === pattern.length - 1) {
        scanning = false
        i = handledUntil - 1
      }
      continue
    }
  }

  var unhandledFrom = pattern[handledUntil] === '{' ? handledUntil : handledUntil + 1
  segment = pattern.substr(unhandledFrom)
  for (j = 0; j < results.length; j++) {
    results[j] += segment
  }

  return results
}

function buildBasicPattern(pattern, wildcard) {
  var result = ''
  var openingBracket = pattern.length
  var closingBracket = -1
  var parenModifiers = []
  var openingParens = 0
  var closingParens = 0
  var parensHandledUntil = -1
  var searchingForParens = false

  for (var i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === '\\') {
      if (i < pattern.length - 1) {
        result += '\\' + pattern[++i]
      }
      continue
    }

    // HANDLE BRACKETS

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

    // HANDLE PARENS

    if (
      pattern[i + 1] === '(' &&
      (char === '@' || char === '?' || char === '*' || char === '+')
    ) {
      if (searchingForParens) {
        parenModifiers.push(char)
        openingParens++
      } else if (i > parensHandledUntil) {
        parensHandledUntil = i
        searchingForParens = true
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
      if (searchingForParens) {
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

    if (searchingForParens) {
      if (closingParens === openingParens || i === pattern.length - 1) {
        searchingForParens = false
        i = parensHandledUntil - 1
      }
      continue
    }

    // HANDLE OTHER STUFF

    if (char === '*') {
      if (pattern[i - 1] !== '*') {
        result += wildcard + '*'
      }
    } else if (char === '?') {
      result += wildcard
    } else if (
      char === '^' ||
      char === '$' ||
      char === '+' ||
      char === '.' ||
      char === '{' ||
      char === '}' ||
      char === '(' ||
      char === ')' ||
      char === '[' ||
      char === '|'
    ) {
      result += '\\' + char
    } else {
      result += char
    }
  }

  return result
}

function buildSeparatedPattern(pattern, options) {
  var separator = options.separator
  var segments = pattern.split(separator)
  var escSeparator = escapeRegExpChars(separator)
  var result = ''
  var wildcard

  if (separator.length > 1) {
    wildcard = '((?!' + escSeparator + ').)'
  } else {
    wildcard = '[^' + escSeparator + ']'
  }

  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i]
    if (i < segments.length - 1) {
      if (segment === '**') {
        result += '(' + wildcard + '*' + escSeparator + ')*'
      } else {
        result += buildBasicPattern(segment, wildcard) + escSeparator
      }
    } else {
      if (segment === '**') {
        result += '.*'
      } else {
        result += buildBasicPattern(segment, wildcard)
      }
    }
  }

  return result
}

function buildRegExpPattern(pattern, options) {
  if (pattern === '**') {
    return '.*'
  }

  if (options.separator) {
    pattern = buildSeparatedPattern(pattern, options)
  } else {
    pattern = buildBasicPattern(pattern, '.')
  }

  return pattern
}

function outmatch(patterns, options) {
  var regExpPattern = ''

  options = options && typeof options === 'object' ? options : { separator: options }

  if (options['{}'] !== false) {
    if (Array.isArray(patterns)) {
      var newPatterns = []
      for (var i = 0; i < patterns.length; i++) {
        var expandedPattern = expandBraces(patterns[i])
        for (var j = 0; j < expandedPattern.length; j++) {
          newPatterns.push(expandedPattern[j])
        }
      }
      patterns = newPatterns
    } else if (typeof patterns === 'string') {
      patterns = expandBraces(patterns)
    } else {
      throw new TypeError(
        'The "patterns" argument must be a string or an array of strings'
      )
    }
  }

  if (Array.isArray(patterns) && patterns.length === 1) {
    patterns = patterns[0]
  }

  if (Array.isArray(patterns)) {
    regExpPattern = '^('
    for (var k = 0; k < patterns.length; k++) {
      if (k > 0) {
        regExpPattern += '|'
      }
      regExpPattern += buildRegExpPattern(patterns[k], options)
    }
    regExpPattern += ')$'
  } else if (typeof patterns === 'string') {
    regExpPattern = '^' + buildRegExpPattern(patterns, options) + '$'
  } else {
    throw new TypeError(
      'The "patterns" argument must be a string or an array of strings'
    )
  }

  return new RegExp(regExpPattern)
}

module.exports = outmatch
