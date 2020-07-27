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
  var result = ''
  var maxI = pattern.length - 1
  var buffer

  wildcard = wildcard || '.'

  for (var i = 0; i <= maxI; i++) {
    var char = pattern[i]

    if (char === '\\') {
      if (i < pattern.length - 1) {
        result += escapeRegExpChar(pattern[++i])
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
        } else if (i === maxI) {
          // Closing bracket is not found; return to the opening bracket
          // and treat all the in-between chars as usual
          result += '\\['
          i = openingBracket
          openingBracket = pattern.length
          closingBracket = pattern.length
        }
        continue
      }

      if (char === '[' && i > closingBracket && i < maxI) {
        openingBracket = i
        continue
      }
    }

    if (supportParens) {
      if (
        pattern[i + 1] === '(' &&
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
      } else if (char === ')') {
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
      } else if (char === '|' && closingParens) {
        result += '|'
        continue
      }

      if (scanningForParens) {
        if (closingParens === openingParens || i === maxI) {
          scanningForParens = false
          i = parensHandledUntil - 1
        }
        continue
      }
    }

    if (supportStar && char === '*') {
      if (i === maxI || pattern[i + 1] !== '*') {
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
  if (options.separator === '\\') {
    throw new Error('\\ is not a valid separator')
  }

  var convertFn = options.separator ? convertSeparatedPattern : convertBasicPattern
  var supportNegation = options['!'] !== false
  var negated = false

  if (supportNegation) {
    for (
      var i = 0;
      i < pattern.length && pattern[i] === '!' && pattern[i + 1] !== '(';
      i++
    ) {
      negated = !negated
    }

    if (i > 0) {
      pattern = pattern.substr(i)
    }
  }

  if (negated) {
    pattern = '(?!^' + convertFn(pattern, options) + '$).*'
  } else {
    pattern = convertFn(pattern, options)
  }

  return {
    pattern: pattern,
    negated: negated,
  }
}

module.exports = parse
