// Disclaimer: the code is optimized for performance and compatibility, hence the mess

import type { OutmatchOptions } from './index'

// We use typescript-transform-macros to inline functions that handle various glob features.
// These functions are called for every char in a pattern, and using them without explicit
// inlining degrades performance significantly
declare function MACRO<T>(t: T): T

// This is used in place of the return value in inlined functions to skip to the next char
const CONTINUE = MACRO(function () {
  // @ts-expect-error
  continue
})

const EXCLUDE_DOT_PATTERN = '(?!\\.)'

function escapeRegExpChar(char: string) {
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
    char === '?' ||
    char === '\\'
  ) {
    return '\\' + char
  } else {
    return char
  }
}

function escapeRegExpString(str: string) {
  let result = ''
  for (let i = 0; i < str.length; i++) {
    result += escapeRegExpChar(str[i])
  }
  return result
}

function Pattern(source: string, options: OutmatchOptions, excludeDot: boolean) {
  let separator = options.separator
  let separatorSplitter = separator === true ? '/' : separator || ''
  let separatorMatcher =
    separator === true
      ? '/|\\\\'
      : separatorSplitter && escapeRegExpString(separatorSplitter)

  if (separatorMatcher.length > 1) {
    separatorMatcher = '(?:' + separatorMatcher + ')'
  }

  // Multiple separators in a row are treated as a single one;
  // trailing separators are optional unless they are put in the pattern deliberately
  let optionalSeparator = separator ? separatorMatcher + '*' : ''
  let requiredSeparator = separator ? separatorMatcher + '+' : ''

  let wildcard = separator
    ? separatorMatcher.length === 1
      ? '[^' + separatorMatcher + ']'
      : '((?!' + separatorMatcher + ').)'
    : '.'

  let segments = separator ? source.split(separatorSplitter) : [source]

  let support = {
    qMark: options['?'] !== false,
    star: options['*'] !== false,
    globstar: separator && options['**'] !== false,
    brackets: options['[]'] !== false,
    extglobs: options['()'] !== false,
    // The excludeDot function argument is for cases when we don't want to exclude leading
    // dots even if the option is true (negated patterns).
    excludeDot: excludeDot && options.excludeDot !== false,
  }

  return {
    source,
    segments,
    options,
    separator,
    separatorSplitter,
    separatorMatcher,
    optionalSeparator,
    requiredSeparator,
    wildcard,
    support,
  }
}

function Segment(source: string, pattern: ReturnType<typeof Pattern>, isLast: boolean) {
  return {
    source,
    end: source.length - 1,
    separatorMatcher: isLast ? pattern.optionalSeparator : pattern.requiredSeparator,
  }
}

function Result() {
  // To support negated extglobs, we maintain two resulting patterns called `match` and `unmatch`.
  // They are built identically except for two things:
  // 1. Negated extglobs.
  //    In `match` they become `wildcard + *`, i.e. "match everything but the separator".
  //    In `unmatch` they become a regular positive regexp group.
  // 2. Patterns for excluding leading dots.
  //    They are added to `match` and skipped in `unmatch`.
  // `useUnmatch` is set to true if we actually encounter a negated extglob. In that case
  // the returned pattern is `'(?!^' + unmatch + '$)' + match`, otherwise it's just `match`.
  return {
    match: '',
    unmatch: '',
    useUnmatch: false,
  }
}

function State(
  pattern: ReturnType<typeof Pattern>,
  segment: ReturnType<typeof Segment>,
  result: ReturnType<typeof Result>
) {
  return {
    pattern,
    segment,
    result,
    openingBracket: segment.end + 1,
    closingBracket: -1,
    openingParens: 0,
    closingParens: 0,
    parensHandledUntil: -1,
    extglobModifiers: [] as string[],
    scanningForParens: false,
    escapeChar: false,
    addToMatch: true,
    addToUnmatch: pattern.support.extglobs,
    // We need to add the dot exclusion pattern before a segment only if it starts
    // with a wildcard and not a literal character.
    dotHandled: false,
  }
}

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
}

const handleBrackets = MACRO(function (
  state: ReturnType<typeof State>,
  char: string,
  i: number
) {
  let pattern = state.pattern
  let segment = state.segment

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
      i = state.openingBracket
      if (pattern.separator) {
        add(state, '(?!' + pattern.separatorMatcher + ')[', true)
      } else {
        add(state, '[', true)
      }
    } else if (i === segment.end) {
      // Closing bracket is not found; return to the opening bracket
      // and treat all the in-between chars as usual
      add(state, '\\[')
      i = state.openingBracket
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
})

const handleExtglob = MACRO(function (
  state: ReturnType<typeof State>,
  char: string,
  nextChar: string,
  i: number
) {
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
        add(state, state.pattern.wildcard + '*?', true)
        state.addToMatch = false
        state.addToUnmatch = true
        state.result.useUnmatch = true
      }
      state.extglobModifiers.push(char)
      add(state, '(?:', true)
      state.openingParens--
      i++
      return CONTINUE()
    } else {
      state.openingParens--
    }
  } else if (char === ')' && !state.escapeChar) {
    if (state.scanningForParens) {
      state.closingParens++
    } else if (state.extglobModifiers.length) {
      let modifier = state.extglobModifiers.pop()
      if (modifier === '!' && state.extglobModifiers.indexOf('!') !== -1) {
        throw new Error("Nested negated extglobs aren't supported")
      }
      modifier = modifier === '!' || modifier === '@' ? '' : modifier
      add(state, ')' + modifier)
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
      i = state.parensHandledUntil - 1
    }
    state.escapeChar = false
    return CONTINUE()
  }
})

function convertSegment(
  pattern: ReturnType<typeof Pattern>,
  segment: ReturnType<typeof Segment>,
  result: ReturnType<typeof Result>
) {
  let support = pattern.support
  let state = State(pattern, segment, result)

  if (!support.excludeDot) {
    state.dotHandled = true
  }

  if (support.globstar && segment.source === '**') {
    let addition =
      '(?:' +
      (!state.dotHandled ? EXCLUDE_DOT_PATTERN : '') +
      pattern.wildcard +
      '*?' +
      segment.separatorMatcher +
      ')*?'
    add(state, addition)
    return result
  }

  for (let i = 0; i <= segment.end; i++) {
    let char = segment.source[i]
    let nextChar = i < segment.end ? segment.source[i + 1] : ''

    // The straightforward way to handle escaping would be to add the next character
    // to the result as soon as a backslash is found and skip the rest of the current iteration.
    // However, some processing has to be triggered for the last char in a pattern no matter
    // if it is escaped or not, so we can't do this. Instead, we set the escapeChar flag
    // for the next char and handle it in the next iteration (in which we have to be
    // extra careful to reset the flag whenever the iteration completes or continues)
    if (char === '\\') {
      if (i < segment.end) {
        state.escapeChar = true
        continue
      } else {
        // If the last char in a pattern is a backslash, it is ignored
        char = ''
      }
    }

    if (support.brackets && !state.scanningForParens) {
      handleBrackets(state, char, i)
    }

    if (support.extglobs) {
      handleExtglob(state, char, nextChar, i)
    }

    if (!state.escapeChar && support.star && char === '*') {
      if (i === segment.end || nextChar !== '*') {
        add(state, pattern.wildcard + '*?', true)
      }
    } else if (!state.escapeChar && support.qMark && char === '?') {
      add(state, pattern.wildcard, true)
    } else {
      add(state, escapeRegExpChar(char))
    }

    state.escapeChar = false
  }

  add(state, segment.separatorMatcher)
  return result
}

function convert(source: string, options: OutmatchOptions, excludeDot: boolean) {
  let pattern = Pattern(source, options, excludeDot)
  let result = Result()
  let segments = pattern.segments

  for (let i = 0; i < segments.length; i++) {
    let segment = Segment(segments[i], pattern, i === segments.length - 1)
    convertSegment(pattern, segment, result)
  }

  if (result.useUnmatch) {
    return '(?!^' + result.unmatch + '$)' + result.match
  } else {
    return result.match
  }
}

export default convert
