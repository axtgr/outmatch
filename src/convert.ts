import type { OutmatchOptions } from './index'
import { Pattern, Segment, Result, State } from './entities'
import { escapeRegExpChar } from './utils'

// We use typescript-transform-macros to inline functions that handle various glob features.
// These functions are called for every char in a pattern, and using them without explicit
// inlining degrades performance. Having them in a separate file would be nice, but it
// isn't supported, unfortunately.
declare function MACRO<T>(t: T): T

// This is used in place of the return value in inlined functions to skip to the next char
const CONTINUE = MACRO(() => {
  // @ts-expect-error
  continue
})

const EXCLUDE_DOT_PATTERN = '(?!\\.)'

function add(state: ReturnType<typeof State>, addition: string, excludeDot?: boolean) {
  if (state.addToUnmatch) {
    state.result.unmatch += addition
  }

  if (state.addToMatch) {
    if (excludeDot && !state.dotHandled) {
      addition = EXCLUDE_DOT_PATTERN + addition
    }

    state.dotHandled = true
    state.result.match += addition
  }

  return state.result
}

const convertEscaping = MACRO((state: ReturnType<typeof State>) => {
  // The straightforward way to handle escaping would be to add the next character
  // to the result as soon as a backslash is found and skip the rest of the current iteration.
  // However, some processing has to be triggered for the last char in a pattern no matter
  // if it is escaped or not, so we can't do this. Instead, we set the escapeChar flag
  // for the next char and handle it in the next iteration (in which we have to be
  // extra careful to reset the flag whenever the iteration completes or continues)
  if (state.char === '\\') {
    if (state.i < state.segment.end) {
      state.escapeChar = true
      return CONTINUE()
    } else {
      // If the last char in a pattern is a backslash, it is ignored
      state.char = ''
    }
  }
})

const convertBrackets = MACRO((state: ReturnType<typeof State>) => {
  let { pattern, segment, char, i } = state

  if (pattern.support.brackets && !state.scanningForParens) {
    if (i > state.openingBracket && i <= state.closingBracket) {
      // We are certainly in a complete character class
      // and should treat almost all characters literally
      if (state.escapeChar) {
        add(state, escapeRegExpChar(char))
      } else if (i === state.closingBracket) {
        add(state, ']')
        state.openingBracket = segment.source.length
      } else if (char === '-' && i === state.closingBracket - 1) {
        add(state, '\\-')
      } else if (char === '!' && i === state.openingBracket + 1) {
        add(state, '^')
      } else if (char === ']') {
        add(state, '\\]')
      } else {
        add(state, char)
      }
      state.escapeChar = false
      return CONTINUE()
    }

    if (i > state.openingBracket) {
      // We are in an open character class and are looking for a closing bracket
      // to make sure the class is terminated
      if (
        char === ']' &&
        !state.escapeChar &&
        i > state.openingBracket + 1 &&
        i > state.closingBracket
      ) {
        // Closing bracket is found; return to openingBracket
        // and treat all the in-between chars literally
        state.closingBracket = i
        state.i = state.openingBracket
        if (pattern.separator) {
          add(state, `(?!${pattern.separatorMatcher})[`, true)
        } else {
          add(state, '[', true)
        }
      } else if (i === segment.end) {
        // Closing bracket is not found; return to the opening bracket
        // and treat all the in-between chars as usual
        add(state, '\\[')
        state.i = state.openingBracket
        state.openingBracket = segment.source.length
        state.closingBracket = segment.source.length
      }
      state.escapeChar = false
      return CONTINUE()
    }

    // An opening bracket is found; commence scanning for a closing bracket
    if (
      char === '[' &&
      !state.escapeChar &&
      i > state.closingBracket &&
      i < segment.end
    ) {
      state.openingBracket = i
      state.escapeChar = false
      return CONTINUE()
    }
  }
})

const convertExtglob = MACRO((state: ReturnType<typeof State>) => {
  if (state.pattern.support.extglobs) {
    let { extglobModifiers, char, nextChar, i } = state

    // When we find an opening extglob paren, we start counting opening and closing
    // parens and ignoring other chars until all the opened extglobes are closed
    // or the pattern ends. After we have counted the parens, we return to the char
    // we started from and proceed normally while transforming the extglobs that have
    // a closing paren.
    if (
      nextChar === '(' &&
      !state.escapeChar &&
      (char === '@' || char === '?' || char === '*' || char === '+' || char === '!')
    ) {
      if (state.scanningForParens) {
        state.openingParens++
      } else if (i > state.parensHandledUntil && !state.closingParens) {
        state.parensHandledUntil = i
        state.scanningForParens = true
        state.openingParens++
      } else if (state.closingParens >= state.openingParens) {
        if (char === '!') {
          state.addToMatch = true
          state.addToUnmatch = false
          add(state, `${state.pattern.wildcard}*?`, true)
          state.addToMatch = false
          state.addToUnmatch = true
          state.result.useUnmatch = true
        }
        extglobModifiers.push(char)
        add(state, '(?:', true)
        state.openingParens--
        state.i++
        return CONTINUE()
      } else {
        state.openingParens--
      }
    } else if (char === ')' && !state.escapeChar) {
      if (state.scanningForParens) {
        state.closingParens++
      } else if (extglobModifiers.length) {
        let modifier = extglobModifiers.pop()
        if (modifier === '!' && extglobModifiers.indexOf('!') !== -1) {
          throw new Error("Nested negated extglobs aren't supported")
        }
        modifier = modifier === '!' || modifier === '@' ? '' : modifier
        add(state, `)${modifier}`)
        state.addToMatch = true
        state.addToUnmatch = true
        state.closingParens--
        return CONTINUE()
      }
    } else if (
      char === '|' &&
      state.closingParens &&
      !state.scanningForParens &&
      !state.escapeChar
    ) {
      add(state, '|')
      return CONTINUE()
    }

    if (state.scanningForParens) {
      if (state.closingParens === state.openingParens || i === state.segment.end) {
        state.scanningForParens = false
        state.i = state.parensHandledUntil - 1
      }
      state.escapeChar = false
      return CONTINUE()
    }
  }
})

const convertSingleChar = MACRO((state: ReturnType<typeof State>) => {
  let { pattern } = state
  let { support } = pattern

  if (!state.escapeChar && support.star && state.char === '*') {
    if (state.i === state.segment.end || state.nextChar !== '*') {
      add(state, `${pattern.wildcard}*?`, true)
    }
  } else if (!state.escapeChar && support.qMark && state.char === '?') {
    add(state, pattern.wildcard, true)
  } else {
    add(state, escapeRegExpChar(state.char))
  }
})

function convertSegment(
  pattern: ReturnType<typeof Pattern>,
  segment: ReturnType<typeof Segment>,
  result: ReturnType<typeof Result>
) {
  let { support } = pattern
  let state = State(pattern, segment, result)
  let separatorMatcher = segment.isLast
    ? pattern.optionalSeparator
    : pattern.requiredSeparator

  if (!support.excludeDot) {
    state.dotHandled = true
  }

  if (segment.end === -1) {
    return segment.isLast && !segment.isFirst ? result : add(state, separatorMatcher)
  }

  if (support.globstar && segment.source === '**') {
    let prefix = !state.dotHandled ? EXCLUDE_DOT_PATTERN : ''
    let globstarSegment = `${prefix + pattern.wildcard}*?${separatorMatcher}`
    return add(state, `(?:${globstarSegment})*?`)
  }

  while (++state.i <= segment.end) {
    state.char = state.segment.source[state.i]
    state.nextChar = state.i < segment.end ? segment.source[state.i + 1] : ''

    // The order is important
    convertEscaping(state)
    convertBrackets(state)
    convertExtglob(state)
    convertSingleChar(state)

    state.escapeChar = false
  }

  return add(state, separatorMatcher)
}

function convert(source: string, options: OutmatchOptions, excludeDot: boolean) {
  let pattern = Pattern(source, options, excludeDot)
  let result = Result()
  let { segments } = pattern

  for (let i = 0; i < segments.length; i++) {
    let segment = Segment(segments[i], pattern, i === 0, i === segments.length - 1)
    convertSegment(pattern, segment, result)
  }

  if (result.useUnmatch) {
    return `(?!^${result.unmatch}$)${result.match}`
  } else {
    return result.match
  }
}

export default convert
