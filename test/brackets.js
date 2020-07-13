var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('[]', function (t) {
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
        t.ok(m('[-z]')('-'))
        t.ok(m('[-z]')('z'))
        t.notOk(m('[-z]')('-z'))
        t.notOk(m('[-z]')('b'))
        t.notOk(m('[-z]')(''))
        t.notOk(m('[]')(''))
        t.notOk(m('[]')(' '))
        t.notOk(m('[]')('a'))
      })
    )

    // TODO: add tests for escaped brackets
  })
}
