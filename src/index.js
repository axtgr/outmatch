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

function split(pattern, separator) {
  if (pattern.length === 0) {
    return ['']
  }

  var segments = []
  var segmentStart = 0
  var isSeparator = false
  var separatorCharIndex = 0
  var separatorStart = 0

  for (var i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === separator[separatorCharIndex]) {
      if (separatorCharIndex === 0) {
        isSeparator = true
        separatorStart = i
      }

      if (isSeparator) {
        if (separatorCharIndex === separator.length - 1) {
          isSeparator = false
          separatorCharIndex = 0
          segments[segments.length] = pattern.substr(
            segmentStart,
            separatorStart - segmentStart
          )
          if (i === pattern.length - 1) {
            segments[segments.length] = ''
          } else {
            segmentStart = i + 1
          }
        } else {
          separatorCharIndex++
        }
      }
    } else if (i === pattern.length - 1) {
      segments[segments.length] = pattern.substr(segmentStart, i - segmentStart + 1)
    } else {
      isSeparator = false
      separatorCharIndex = 0
    }
  }
  return segments
}

function buildBasicPattern(pattern, wildcard) {
  var result = ''
  var parens = []
  var openingBracket = pattern.length
  var closingBracket = -1

  for (var i = 0; i < pattern.length; i++) {
    var char = pattern[i]

    if (char === '\\') {
      if (i < pattern.length - 1) {
        result += '\\' + pattern[++i]
      }
      continue
    }

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
    } else if (parens.length > 0 && char === ')') {
      result += ')' + parens.pop()
    } else if (pattern[i + 1] === '(') {
      parens.push(char === '@' ? '' : char)
      result += '('
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
      char === '[' ||
      (char === '|' && parens.length === 0)
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
  var segments = split(pattern, separator)
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

  var regExpPattern

  if (options.separator) {
    regExpPattern = buildSeparatedPattern(pattern, options)
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
