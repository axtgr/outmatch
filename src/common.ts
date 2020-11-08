interface OutmatchOptions {
  separator?: boolean | string
  flags?: string
  excludeDot?: boolean
  '!'?: boolean
  '?'?: boolean
  '*'?: boolean
  '**'?: boolean
  '[]'?: boolean
  '()'?: boolean
  '{}'?: boolean
}

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
    return `\\${char}`
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

export { OutmatchOptions, escapeRegExpChar, escapeRegExpString }
