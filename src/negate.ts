import type { OutmatchOptions } from './index'

function negate(pattern: string, options: OutmatchOptions) {
  let supportNegation = options['!'] !== false
  let supportParens = options['()'] !== false
  let isNegated = false
  let i: number

  if (supportNegation) {
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
