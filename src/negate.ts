import type { OutmatchOptions } from './index'

function negate(pattern: string, options: OutmatchOptions) {
  let supportNegation = options['!'] !== false
  let supportParens = options['()'] !== false
  let isNegated = false
  let i: number

  if (supportNegation) {
    // Consume leading !s unless the next char is an opening paren. At this point we can't
    // be sure if it's a valid negated glob or just a wild paren, so this can produce false results.
    for (i = 0; i < pattern.length && pattern[i] === '!'; i++) {
      if (supportParens && pattern[i + 1] === '(') {
        i--
        break
      }
      isNegated = !isNegated
    }

    if (i > 0) {
      pattern = pattern.substr(i)
    }
  }

  return { pattern, isNegated }
}

export default negate
