// The code is optimized for performance and compatibility, hence the ugliness

'use strict'

function escapeSeparator(separator) {
  var result = ''
  for (var i = 0; i < separator.length; i++) {
    var char = separator[i]
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

function buildBasicPattern(pattern, wildcard) {
  var result = ''
  var parens = []

  for (var i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === '\\') {
      if (i < pattern.length - 1) {
        result += '\\' + pattern[++i]
      }
      continue
    }

    if (parens.length > 0 && char === ')') {
      result += ')' + parens.pop()
    } else if (pattern[i + 1] === '(') {
      parens.push(char === '@' ? '' : char)
      result += '('
      i++
    } else if (char === '[' && pattern[i + 1] === '!') {
      result += '[^'
      i++
    } else if (char === '*') {
      if (result[result.length - 1] !== '*') {
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
      (char === '|' && parens.length === 0)
    ) {
      result += '\\' + char
    } else {
      result += char
    }
  }

  return result
}

function buildSeparatedPattern(pattern, sep) {
  var escSep = escapeSeparator(sep)
  var wildcard = sep.length > 1 ? '((?!' + escSep + ').)' : '[^' + escSep + ']'
  var maxI = pattern.length - 1
  var sepEnd = -1
  var sepI = 0
  var stars = 0
  var parens = []
  var result = ''

  for (var i = 0; i <= maxI; i++) {
    var char = pattern[i]

    if (char === sep[sepI] && i >= sepEnd) {
      if (sepI === sep.length - 1) {
        // Separator complete
        if (stars === 2) {
          result += '(' + wildcard + '*' + escSep + ')*'
        } else if (stars > 0) {
          result += wildcard + '*' + escSep
        } else {
          result += escSep
        }

        sepEnd = i
        sepI = 0
        stars = 0
      } else if (i === maxI) {
        // Separator incomplete, ignore and go back
        sepEnd = i + 1
        sepI = 0
      } else {
        // Separator continues
        sepI++
      }
    } else if (char === '*') {
      stars++
    } else {
      // The previous char was a star, but this one isn't
      if (stars > 0) {
        result += wildcard + '*'
      }

      stars = 0
      sepI = 0

      if (char === '\\') {
        if (i < maxI) {
          result += '\\' + pattern[++i]
        }
      } else if (parens.length > 0 && char === ')') {
        result += ')' + parens.pop()
      } else if (pattern[i + 1] === '(') {
        parens.push(char === '@' ? '' : char)
        result += '('
        i++
      } else if (char === '[' && pattern[i + 1] === '!') {
        result += '[^'
        i++
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
        (char === '|' && parens.length === 0)
      ) {
        result += '\\' + char
      } else {
        result += char
      }
    }
  }

  if (stars === 2 && sepEnd === i - stars - 1) {
    result += '.*'
  } else if (stars > 0) {
    result += wildcard + '*'
  }

  return result
}

function buildRegExpPattern(pattern, options) {
  if (pattern === '**') {
    return '.*'
  }

  var regExpPattern

  if (options.separator) {
    regExpPattern = buildSeparatedPattern(pattern, options.separator)
  } else {
    regExpPattern = buildBasicPattern(pattern, '.')
  }

  return regExpPattern
}

function outmatch(patterns, options) {
  var regExpPattern = ''

  options = options && typeof options === 'object' ? options : { separator: options }

  if (Array.isArray(patterns)) {
    regExpPattern = '^('
    for (var i = 0; i < patterns.length; i++) {
      if (i > 0) {
        regExpPattern += '|'
      }
      regExpPattern += buildRegExpPattern(patterns[i], options)
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
