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
      result += wildcard + '*'
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

function buildSeparatedPattern(pattern, separator) {
  var segments = split(pattern, separator)
  var escSeparator = escapeRegExpChars(separator)
  var result = ''
  var wildcard

  if (separator && separator.length > 1) {
    wildcard = '((?!' + escSeparator + ').)'
  } else if (separator) {
    wildcard = '[^' + escSeparator + ']'
  } else {
    wildcard = '.'
  }

  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i]

    if (i === 0 && segment === '**') {
      result = '(.*' + escSeparator + ')?'
      continue
    } else if (segment === '**') {
      segment = '(' + escSeparator + '.*)?'
    } else {
      segment = buildBasicPattern(segment, wildcard)
    }

    if (i < segments.length - 1 && segments[i + 1] !== '**') {
      result += segment + escSeparator
    } else {
      result += segment
    }
  }
  return result
}

function buildRegExpPattern(pattern, separator) {
  if (pattern === '**') {
    return '.*'
  }

  var regExpPattern

  if (separator) {
    regExpPattern = buildSeparatedPattern(pattern, separator)
  } else {
    regExpPattern = buildBasicPattern(pattern, '.')
  }

  return regExpPattern
}

function outmatch(pattern, separator) {
  var options = typeof separator === 'object' ? separator : { separator: separator }
  var regExpPattern = ''

  if (Array.isArray(pattern)) {
    regExpPattern = '^('
    for (var i = 0; i < pattern.length; i++) {
      if (i > 0) {
        regExpPattern += '|'
      }
      regExpPattern += buildRegExpPattern(pattern[i], options.separator)
    }
    regExpPattern += ')$'
  } else {
    regExpPattern = '^' + buildRegExpPattern(pattern, options.separator) + '$'
  }

  return new RegExp(regExpPattern)
}

module.exports = outmatch
