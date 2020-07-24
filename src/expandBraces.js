'use strict'

function processNoCommaBraces(span) {
  if (span.length < 3) {
    return '{' + span + '}'
  }

  var separatorI = -1

  for (var i = 2; i < span.length; i++) {
    if (span[i] === '.' && span[i - 1] === '.' && (i < 2 || span[i - 2] !== '\\')) {
      if (separatorI > -1) {
        return '{' + span + '}'
      }

      separatorI = i - 1
    }
  }

  if (separatorI > -1) {
    var rangeStart = span.substr(0, separatorI)
    var rangeEnd = span.substr(separatorI + 2)

    if (rangeStart.length > 0 && rangeEnd.length > 0) {
      return '[' + span.substr(0, separatorI) + '-' + span.substr(separatorI + 2) + ']'
    }
  }

  return '{' + span + '}'
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

        if (alternatives.length > 0) {
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
        } else {
          span = processNoCommaBraces(span)
          for (j = 0; j < results.length; j++) {
            results[j] += span
          }
        }

        handledUntil = i
        closingBraces--
      } else {
        closingBraces--
      }
    } else if (!scanning && char === ',' && closingBraces - openingBraces === 1) {
      // closingBraces - openingBraces === 1 means we are in top-level braces
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

module.exports = expandBraces
