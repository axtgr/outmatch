'use strict'

function handleNoCommaBraces(span: string) {
  if (span.length < 3) {
    return '{' + span + '}'
  }

  let separatorI = -1

  for (let i = 2; i < span.length; i++) {
    if (span[i] === '.' && span[i - 1] === '.' && (i < 2 || span[i - 2] !== '\\')) {
      if (separatorI > -1) {
        return '{' + span + '}'
      }

      separatorI = i - 1
    }
  }

  if (separatorI > -1) {
    let rangeStart = span.substr(0, separatorI)
    let rangeEnd = span.substr(separatorI + 2)

    if (rangeStart.length > 0 && rangeEnd.length > 0) {
      return '[' + span.substr(0, separatorI) + '-' + span.substr(separatorI + 2) + ']'
    }
  }

  return '{' + span + '}'
}

function expand(pattern: string): string[] {
  if (typeof pattern !== 'string') {
    throw new TypeError('A pattern must be a string, but ' + typeof pattern + ' given')
  }

  let scanning = false
  let openingBraces = 0
  let closingBraces = 0
  let handledUntil = -1
  let results = ['']
  let alternatives = []
  let span

  for (let i = 0; i < pattern.length; i++) {
    let char = pattern[i]

    if (char === '\\') {
      i++
      continue
    }

    if (char === '{') {
      if (scanning) {
        openingBraces++
      } else if (i > handledUntil && !openingBraces) {
        span = pattern.substring(handledUntil + 1, i)
        for (let j = 0; j < results.length; j++) {
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
          let newResults = []
          alternatives.push(expand(span))
          for (let j = 0; j < results.length; j++) {
            for (let k = 0; k < alternatives.length; k++) {
              for (let l = 0; l < alternatives[k].length; l++) {
                newResults.push(results[j] + alternatives[k][l])
              }
            }
          }
          results = newResults
        } else {
          span = handleNoCommaBraces(span)
          for (let j = 0; j < results.length; j++) {
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
      alternatives.push(expand(span))
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

  let unhandledFrom = pattern[handledUntil] === '{' ? handledUntil : handledUntil + 1
  if (unhandledFrom < pattern.length) {
    span = pattern.substr(unhandledFrom)
    for (let j = 0; j < results.length; j++) {
      results[j] += span
    }
  }

  return results
}

export default expand
