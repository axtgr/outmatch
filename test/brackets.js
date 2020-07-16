var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('[] - character class', function (t) {
    t.test(
      'Matches one character from the given list',
      testSeparators(function (t, m) {
        // TODO: add cases with separators
        t.ok(m('[abc]')('a'))
        t.ok(m('[abc]')('b'))
        t.notOk(m('[abc]')('d'))
        t.notOk(m('[abc]')('ab'))
        t.ok(m('[ab][cd]')('ac'))
        t.ok(m('[ab][cd]')('bd'))
        t.notOk(m('[ab][cd]')('a'))
        t.notOk(m('[ab][cd]')('c'))
        t.notOk(m('[ab][cd]')('ca'))
        t.notOk(m('[ab][cd]')('abc'))
      })
    )

    t.test(
      'Matches one character from the given range',
      testSeparators(function (t, m) {
        t.ok(m('[a-z]')('g'))
        t.ok(m('[a-z]')('z'))
        t.notOk(m('[a-z]')('A'))
        t.notOk(m('[a-z]')('2'))
        t.notOk(m('[a-z]')('ab'))
        t.notOk(m('[a-z]')(''))
        t.ok(m('[0-5]')('2'))
        t.ok(m('[0-5]')('0'))
        t.notOk(m('[0-5]')('6'))
        t.notOk(m('[0-5]')('a'))
        t.notOk(m('[0-5]')('01'))
        t.notOk(m('[0-5]')(''))
        t.ok(m('[0-z]')('6'))
        t.ok(m('[0-z]')('E'))
        t.ok(m('[0-z]')('s'))
        t.notOk(m('[0-z]')('!'))
        t.notOk(m('[0-z]')(''))
        t.notOk(m('[0-z]')(' '))
        t.notOk(m('[0-z]')('0z'))
        t.notOk(m('[0-z]')('0-z'))
      })
    )

    t.test(
      '* in a character class is treated as a member of the class',
      testSeparators(function (t, m) {
        t.ok(m('[*]')('*'))
        t.notOk(m('[*]')(''))
        t.notOk(m('[*]')('[*]'))
        t.notOk(m('[*]')('one'))
        t.ok(m('[o*e]')('o'))
        t.ok(m('[o*e]')('*'))
        t.ok(m('[o*e]')('e'))
        t.notOk(m('[o*e]')('n'))
        t.notOk(m('[o*e]')('[o*e]'))
      })
    )

    t.test(
      'When - is at the beginning or end of a character class, it is treated literally',
      testSeparators(function (t, m) {
        t.ok(m('[-z]')('-'))
        t.ok(m('[-z]')('z'))
        t.ok(m('[z-]')('-'))
        t.ok(m('[z-]')('z'))
        t.notOk(m('[-z]')('-z'))
        t.notOk(m('[-z]')('b'))
        t.notOk(m('[-z]')(''))
        t.notOk(m('[z-]')('z-'))
        t.notOk(m('[z-]')('b'))
        t.notOk(m('[z-]')(''))
      })
    )

    t.test(
      'When ] is at the beginning of a character class, it is treated as a member of the class',
      testSeparators(function (t, m) {
        t.ok(m('[]]')(']'))
        t.ok(m('[]z]')(']'))
        t.ok(m('[]z]')('z'))
        t.ok(m('one/[]t]wo')('one/two'))
        t.ok(m('one/[]t]wo')('one/]wo'))
        t.notOk(m('[]]')(''))
        t.notOk(m('[]z]')(''))
        t.notOk(m('[]z]')(']z'))
        t.notOk(m('[]z]')('b'))
      })
    )

    t.test(
      '[] is treated literally',
      testSeparators(function (t, m) {
        t.ok(m('[]')('[]'))
        t.ok(m('on[]/two')('on[]/two'))
        t.notOk(m('[]')(''))
        t.notOk(m('[]')('['))
        t.notOk(m('[]')(']'))
        t.notOk(m('[]')('o'))
        t.notOk(m('[]]')('[]'))
        t.notOk(m('on[]/two')('on[/two'))
        t.notOk(m('on[]/two')('on]/two'))
      })
    )

    t.test(
      'Unclosed [ is treated literally',
      testSeparators(function (t, m) {
        t.ok(m('[')('['))
        t.ok(m('one[')('one['))
        t.ok(m('one[/two')('one[/two'))
        t.notOk(m('[')(''))
        t.notOk(m('[')('[]'))
        t.notOk(m('one[')('one'))
      })
    )

    t.test(
      'Separators in the middle of a character class interrupt it, so [] are treated literally',
      testSeparators(function (t, m, sep) {
        if (sep) {
          t.ok(m('[/')('[/'))
          t.ok(m('[/]')('[/]'))
          t.notOk(m('[/')('['))
          t.notOk(m('[/')('/'))
          t.notOk(m('[/]')('[]'))
          t.notOk(m('[/]')('/'))
        }
      })
    )

    t.test(
      "] that doesn't close anything is treated literally",
      testSeparators(function (t, m) {
        t.ok(m(']')(']'))
        t.ok(m('one]')('one]'))
        t.ok(m('one]/two')('one]/two'))
        t.notOk(m(']')(''))
        t.notOk(m(']')('[]'))
        t.notOk(m('one]')('one'))
      })
    )

    // TODO: add tests for escaped brackets
    // TODO: add tests for characters after brackets
  })
}
