import { suite } from './_utils'

export default suite((t) => {
  t.test('[] - character class', (t) => {
    t.testPerSeparator('Matches one character from the given list', (t) => {
      t.pattern('[abc]').matches('a', 'b').doesntMatch('', 'd', 'ab', '[abc]')
      t.pattern('[fd]oo').matches('foo', 'doo').doesntMatch('', 'oo', 'zoo', '[fd]oo')
      t.pattern('fo[oz]/bar')
        .matches('foo/bar', 'foz/bar')
        .doesntMatch('', 'fo/bar', 'fo[oz]/bar')
      t.pattern('foo/[bc]ar')
        .matches('foo/bar', 'foo/car')
        .doesntMatch('', 'foo/ar', 'foo/xar', 'foo/[bc]ar')
    })

    t.testPerSeparator('Matches one character from the given range', (t) => {
      t.pattern('[a-z]').matches('a', 'g', 'z').doesntMatch('A', '2', 'ab', '', '[a-z]')
      t.pattern('[0-5]')
        .matches('0', '1', '2', '3', '4', '5')
        .doesntMatch('6', 'a', '01', '-1', '', '[0-5]')
      t.pattern('[0-z]')
        .matches('6', 'E', 'f')
        .doesntMatch('', '!', ' ', '0z', '0-z', '[0-z]')
    })

    // TODO: add tests for combined ranges and lists

    t.testPerSeparator(
      'Handles multiple classes in a single pattern correctly',
      (t) => {
        t.pattern('[a-c][de]')
          .matches('ad', 'ae', 'bd', 'be', 'cd', 'ce')
          .doesntMatch(
            '',
            'a',
            'c',
            'af',
            'ca',
            'zx',
            'abc',
            '[a-c][d-e]',
            '[a-c]',
            '[de]'
          )
        t.pattern('f[op]oba[a-z]')
          .matches('foobar', 'fpobaa', 'foobaz')
          .doesntMatch('', 'foba', 'fzobar', 'f[op]oba[a-z]')
        t.pattern('f[oz]o/b[af]r')
          .matches('foo/bar', 'fzo/bar', 'foo/bfr', 'fzo/bfr')
          .doesntMatch('', 'f[oz]o/b[af]r')
      }
    )

    t.testPerSeparator(
      '? in a character class is treated as a literal member of the class',
      (t) => {
        t.pattern('[?]').matches('?').doesntMatch('', '[?]', 'one')
        t.pattern('[o?e]').matches('o', '?', 'e').doesntMatch('', 'n', '[o?e]')
      }
    )

    t.testPerSeparator(
      '* in a character class is treated as a literal member of the class',
      (t) => {
        t.pattern('[*]').matches('*').doesntMatch('', '[*]', 'one')
        t.pattern('[o*e]').matches('o', '*', 'e').doesntMatch('', 'n', '[o*e]')
      }
    )

    t.testPerSeparator(
      'When - is at the beginning or end of a character class, it is treated as a member of the class',
      (t) => {
        t.pattern('[-z]').matches('-', 'z').doesntMatch('', '-z', 'b')
        t.pattern('[z-]').matches('-', 'z').doesntMatch('', 'z-', 'b')
      }
    )

    t.testPerSeparator(
      'When ] is at the beginning of a character class, it is treated as a member of the class',
      (t) => {
        t.pattern('[]]').matches(']').doesntMatch('')
        t.pattern('[]z]').matches(']', 'z').doesntMatch('', ']z', 'b')
        t.pattern('one/[]t]wo').matches('one/two', 'one/]wo')
      }
    )

    t.options({ '[]': false }).testPerSeparator(
      'When turned off in options, treated literally',
      (t) => {
        t.pattern('[abc]').matches('[abc]').doesntMatch('', 'a', 'b', '[]')
        t.pattern('[a-z]').matches('[a-z]').doesntMatch('', 'a', '-', 'z', '[]')
        t.pattern('[a/c]').matches('[a/c]').doesntMatch('', 'a', '/')
        t.pattern('one/[tw]o').matches('one/[tw]o').doesntMatch('one/to')
        t.pattern('one/[tw]o/three')
          .matches('one/[tw]o/three')
          .doesntMatch('one/to/three')
      }
    )

    t.testPerSeparator('[] is treated literally', (t) => {
      t.pattern('[]').matches('[]').doesntMatch('', '[', ']', 'o')
      t.pattern('[]]').doesntMatch('[]')
      t.pattern('on[]/two').matches('on[]/two').doesntMatch('on[/two', 'on]/two')
    })

    t.testPerSeparator('Unclosed [ is treated literally', (t) => {
      t.pattern('[').matches('[').doesntMatch('', '[]')
      t.pattern('one[').matches('one[').doesntMatch('one')
      t.pattern('one[/two').matches('one[/two')
    })

    t.testPerSeparator(
      'Separators in the middle of a character class interrupt it, so [/] are treated literally',
      (t) => {
        t.pattern('[/]')
          .matchesWhenSeparated('[/]')
          .doesntMatch('[]')
          .doesntMatchWhenSeparated('/')
        t.pattern('[/').matches('[/').doesntMatch('[', '/')
        t.pattern('[#-/]')
          .matchesWhenSeparated('[#-/]')
          .doesntMatchWhenSeparated('#', '-', '%', '/')
          .doesntMatch('')
      }
    )

    t.test(
      "Character ranges don't match separators when they are included implicitly",
      (t) => {
        t.options({ separator: '5' })
          .pattern('[0-9]')
          .matches('0', '4', '9')
          .doesntMatch('', '5')
        t.options({ separator: 's' })
          .pattern('foo[a-z]bar')
          .matches('fooxbar')
          .doesntMatch('foosbar')
      }
    )

    t.testPerSeparator("] that doesn't close anything is treated literally", (t) => {
      t.pattern(']').matches(']').doesntMatch('', '[]')
      t.pattern('one]').matches('one]').doesntMatch('one')
      t.pattern('one]/two').matches('one]/two')
    })

    t.testPerSeparator('When escaped, treated literally', (t) => {
      t.pattern('\\[').matches('[').doesntMatch('', '\\[')
      t.pattern('\\[]').matches('[]').doesntMatch('', '\\[]')
      t.pattern('\\[abc]').matches('[abc]').doesntMatch('', '\\[abc]')
      t.pattern('[\\]').matches('[]').doesntMatch('', '[\\]')
      t.pattern('[abc\\]').matches('[abc]').doesntMatch('', '\\[abc]')
    })

    t.testPerSeparator(
      'When an escaped [, ] or - is in a character class, it is treated as a member of the class',
      (t) => {
        t.pattern('[a\\[b]').matches('[', 'a', 'b')
        t.pattern('[\\[]').doesntMatch('', 'c', '[\\[]')
        t.pattern('[a\\]b]').matches(']', 'a', 'b').doesntMatch('', 'c', '[a\\]b]')
        t.pattern('[a\\-b]').matches('-', 'a', 'b').doesntMatch('', 'c', '[a\\-b]')
      }
    )
  })
})
