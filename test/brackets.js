var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('[] - character class', function (t) {
    t.testPerSeparator('Matches one character from the given list', function (t) {
      // TODO: add cases with separators
      t.match('[abc]')('a')
      t.match('[abc]')('b')
      t.dontMatch('[abc]')('d')
      t.dontMatch('[abc]')('ab')
      t.match('[ab][cd]')('ac')
      t.match('[ab][cd]')('bd')
      t.dontMatch('[ab][cd]')('a')
      t.dontMatch('[ab][cd]')('c')
      t.dontMatch('[ab][cd]')('ca')
      t.dontMatch('[ab][cd]')('abc')
    })

    t.testPerSeparator('Matches one character from the given range', function (t) {
      t.match('[a-z]')('g')
      t.match('[a-z]')('z')
      t.dontMatch('[a-z]')('A')
      t.dontMatch('[a-z]')('2')
      t.dontMatch('[a-z]')('ab')
      t.dontMatch('[a-z]')('')
      t.match('[0-5]')('2')
      t.match('[0-5]')('0')
      t.dontMatch('[0-5]')('6')
      t.dontMatch('[0-5]')('a')
      t.dontMatch('[0-5]')('01')
      t.dontMatch('[0-5]')('')
      t.match('[0-z]')('6')
      t.match('[0-z]')('E')
      t.match('[0-z]')('s')
      t.dontMatch('[0-z]')('!')
      t.dontMatch('[0-z]')('')
      t.dontMatch('[0-z]')(' ')
      t.dontMatch('[0-z]')('0z')
      t.dontMatch('[0-z]')('0-z')
    })

    t.testPerSeparator(
      '* in a character class is treated as a member of the class',
      function (t) {
        t.match('[*]')('*')
        t.dontMatch('[*]')('')
        t.dontMatch('[*]')('[*]')
        t.dontMatch('[*]')('one')
        t.match('[o*e]')('o')
        t.match('[o*e]')('*')
        t.match('[o*e]')('e')
        t.dontMatch('[o*e]')('n')
        t.dontMatch('[o*e]')('[o*e]')
      }
    )

    t.testPerSeparator(
      'When - is at the beginning or end of a character class, it is treated as a member of the class',
      function (t) {
        t.match('[-z]')('-')
        t.match('[-z]')('z')
        t.match('[z-]')('-')
        t.match('[z-]')('z')
        t.dontMatch('[-z]')('-z')
        t.dontMatch('[-z]')('b')
        t.dontMatch('[-z]')('')
        t.dontMatch('[z-]')('z-')
        t.dontMatch('[z-]')('b')
        t.dontMatch('[z-]')('')
      }
    )

    t.testPerSeparator(
      'When ] is at the beginning of a character class, it is treated as a member of the class',
      function (t) {
        t.match('[]]')(']')
        t.match('[]z]')(']')
        t.match('[]z]')('z')
        t.match('one/[]t]wo')('one/two')
        t.match('one/[]t]wo')('one/]wo')
        t.dontMatch('[]]')('')
        t.dontMatch('[]z]')('')
        t.dontMatch('[]z]')(']z')
        t.dontMatch('[]z]')('b')
      }
    )

    t.testPerSeparator('[] is treated literally', function (t) {
      t.match('[]')('[]')
      t.match('on[]/two')('on[]/two')
      t.dontMatch('[]')('')
      t.dontMatch('[]')('[')
      t.dontMatch('[]')(']')
      t.dontMatch('[]')('o')
      t.dontMatch('[]]')('[]')
      t.dontMatch('on[]/two')('on[/two')
      t.dontMatch('on[]/two')('on]/two')
    })

    t.testPerSeparator('Unclosed [ is treated literally', function (t) {
      t.match('[')('[')
      t.match('one[')('one[')
      t.match('one[/two')('one[/two')
      t.dontMatch('[')('')
      t.dontMatch('[')('[]')
      t.dontMatch('one[')('one')
    })

    t.testPerSeparator(
      'Separators in the middle of a character class interrupt it, so [] are treated literally',
      function (t, sep) {
        t.dontMatch('[/]')('[]')
        t.match('[/')('[/')
        t.dontMatch('[/')('[')
        t.dontMatch('[/')('/')

        if (sep) {
          t.match('[/]')('[/]')
          t.dontMatch('[/]')('/')
        }
      }
    )

    t.testPerSeparator("] that doesn't close anything is treated literally", function (
      t
    ) {
      t.match(']')(']')
      t.match('one]')('one]')
      t.match('one]/two')('one]/two')
      t.dontMatch(']')('')
      t.dontMatch(']')('[]')
      t.dontMatch('one]')('one')
    })

    // TODO: add tests for escaped brackets
    // TODO: add tests for characters after brackets
  })
})
