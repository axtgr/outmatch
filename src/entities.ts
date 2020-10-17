import type { OutmatchOptions } from './index'
import { escapeRegExpString } from './utils'

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
  // To support negated extglobs, we maintain two result patterns called `match` and `unmatch`.
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
    i: -1,
    char: '',
    nextChar: '',
  }
}

export { Pattern, Segment, Result, State }
