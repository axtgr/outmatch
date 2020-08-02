var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('? - single-char wildcard', function (t) {
    t.testPerSeparator('Matches one non-separator character', function (t) {
      t.pattern('?')
        .matches('o', 't', '_')
        .doesntMatch('', '//', 'on', 'o/n', '/o')
        .doesntMatchWhenSeparated('/')
      t.pattern('??')
        .matches('on', 'ot')
        .doesntMatch('', '/', 'o', 'on/e', 'one')
        .doesntMatchWhenSeparated('//')
      t.pattern('???')
        .matches('one')
        .doesntMatch('', '/', '//', 'on', 'one/two')
        .doesntMatchWhenSeparated('///')
      t.pattern('o?e').matches('one').doesntMatch('oe')
      t.pattern('?ne').matches('one', 'ane').doesntMatch('ne')
      t.pattern('on?')
        .matches('one', 'ont')
        .doesntMatch('on')
        .doesntMatchWhenSeparated('on/')
      t.pattern('o??')
        .matches('one', 'ota')
        .doesntMatch('o', 'on/e')
        .doesntMatchWhenSeparated('o/e', 'o//')
      t.pattern('o???').doesntMatchWhenSeparated('on/e')
      t.pattern('?n?').matches('one')
      t.pattern('/?')
        .matches('/o')
        .doesntMatch('', '/', '///', 'o', 'on', '/on', 'one', '/one')
        .doesntMatchWhenSeparated('//')
      t.pattern('/??').matches('/on').doesntMatch('on').doesntMatchWhenSeparated('///')
      t.pattern('?/')
        .matches('o/')
        .doesntMatch('', '/', '///', 'o', 'on', 'on/', 'one', 'one/')
        .doesntMatchWhenSeparated('//')
      t.pattern('??/').matches('on/')
      t.pattern('?/?').matches('o/e').doesntMatch('on').doesntMatchWhenSeparated('///')
      t.pattern('one/?').matches('one/t')
      t.pattern('one?two').doesntMatchWhenSeparated('one/two')
      t.pattern('one/t?o').matches('one/two').doesntMatch('one/to')
      t.pattern('one/tw?').matches('one/two').doesntMatchWhenSeparated('one/tw/')
      t.pattern('o?e/tw?').matches('one/two').doesntMatch('onetwo')
      t.pattern('?one').doesntMatch('one').doesntMatchWhenSeparated('/one')
      t.pattern('??/?').doesntMatch('on')
    })

    t.options({ '?': false }).testPerSeparator(
      'When turned off in options, treated literally',
      function (t) {
        t.pattern('?').matches('?').doesntMatch('', 'a', '/')
        t.pattern('a?c').matches('a?c').doesntMatch('abc', 'a/c')
        t.pattern('o?e/t?o').matches('o?e/t?o').doesntMatch('one/two')
      }
    )

    t.testPerSeparator('When escaped, treated literally', function (t) {
      // TODO: add cases with separators, multiple backslashes

      t.pattern('\\?').matches('?').doesntMatch('', 'o', '\\?', '\\o', '\\')
      t.pattern('one\\?')
        .matches('one?')
        .doesntMatch('', 'onet', '\\?', '????', 'one\\', 'one\\t', 'one\\?')
      t.pattern('\\?one')
        .matches('?one')
        .doesntMatch('', 'tone', '????', '\\?', '\\one', '\\tone', '\\?one')
      t.pattern('o\\?e')
        .matches('o?e')
        .doesntMatch('', 'o\\?e', 'o\\ne', 'o\\e', '\\?', 'oo?e', 'o??e', '??e', '???')
    })

    t.testPerSeparator('Can be mixed escaped and unescaped', function (t) {
      // TODO: add cases with separators, multiple backslashes

      t.pattern('\\?_?').matches('?_o', '?_n')
      t.pattern('?_\\?').matches('o_?', 'n_?')
      t.pattern('\\??e').matches('?ne')
      t.pattern('?\\?e').matches('n?e')
      t.pattern('?\\??').matches('o?e')
      t.pattern('o?e_t\\?o_?hree').matches('one_t?o_three')
      t.pattern('\\??').doesntMatch('')
      t.pattern('?\\?').doesntMatch('')
      t.pattern('\\??').doesntMatch('on', '\\n')
    })
  })
})
