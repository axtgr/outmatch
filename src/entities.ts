import { escapeRegExpString, OutmatchOptions } from './common'

function Pattern(source: string, options: OutmatchOptions, excludeDot: boolean) {
  let { separator } = options
  let separatorSplitter = ''
  let separatorMatcher = ''
  let wildcard = '.'

  if (separator === true) {
    // In this case forward slashes in patterns match both forward and backslashes in samples
    separatorSplitter = '/'
    separatorMatcher = '[/\\\\]'
    wildcard = '[^/\\\\]'
  } else if (separator) {
    separatorSplitter = separator
    separatorMatcher = escapeRegExpString(separatorSplitter)

    if (separatorMatcher.length > 1) {
      separatorMatcher = `(?:${separatorMatcher})`
      wildcard = `((?!${separatorMatcher}).)`
    } else {
      wildcard = `[^${separatorMatcher}]`
    }
  } else {
    wildcard = '.'
  }

  // When a separator is explicitly specified in a pattern, it must match _one or more_
  // separators in a sample, so we use quantifiers. When a pattern doesn't have a trailing
  // separator, a sample can still optionally have them, so we use different quantifiers
  // depending on the index of a segment.
  let requiredSeparator = separator ? `${separatorMatcher}+?` : ''
  let optionalSeparator = separator ? `${separatorMatcher}*?` : ''

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

function Segment(
  source: string,
  pattern: ReturnType<typeof Pattern>,
  isFirst: boolean,
  isLast: boolean
) {
  return {
    source,
    isFirst,
    isLast,
    end: source.length - 1,
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
