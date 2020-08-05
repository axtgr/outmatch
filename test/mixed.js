var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('Mixed wildcards', function (t) {
    t.testPerSeparator('? and *', function (t) {
      t.pattern('?*')
        .matches('onetwo', 'o', 'one/')
        .doesntMatch('')
        .doesntMatchWhenSeparated('/', '/one')
      t.pattern('*?').doesntMatch('').doesntMatchWhenSeparated('/')
      t.pattern('?ne*')
        .matches('onetwo')
        .doesntMatch('ne/two')
        .doesntMatchWhenSeparated('one/two')
      t.pattern('one?*').doesntMatch('one')
      t.pattern('?*/').matches('one/')
      t.pattern('?*/*')
        .matches('one/', 'one/two', 'one/two/')
        .doesntMatch('one')
        .doesntMatchWhenSeparated('one/two/three')
      t.pattern('?*?')
        .matches('oe', 'one', 'onnne')
        .doesntMatch('o')
        .doesntMatchWhenSeparated('/one', 'o/e')
      t.pattern('?*?/*')
        .matches('one/', 'one/two')
        .doesntMatch('', 'one')
        .doesntMatchWhenSeparated('one/two/three')
      t.pattern('?*?/*/*')
        .matches('one/two/three', 'one//')
        .doesntMatch('', 'one', 'o/two/three', 'one/two')
        .doesntMatchWhenSeparated('one/two/three/four')
    })

    t.testPerSeparator('* and **', function (t) {
      t.pattern('*/**')
        .matches(
          '/',
          'one/two',
          '_/',
          '///',
          'two/three',
          '___/three',
          '___/three///',
          '/three',
          '//three'
        )
        .doesntMatch('', '_', 'two')
      t.pattern('**/*')
        .matches('one/two', 'one/two/three', 'one/*/three', 'one/*/**')
        .matchesWhenSeparated('one')
      t.pattern('*/**/*')
        .matches(
          'one/two/three',
          'one/two/three/four/five',
          'one/two/*/four/five',
          'one/two/*/four/**',
          'one/_/three'
        )
        .doesntMatch('one')
        .matchesWhenSeparated('one/two')
      t.pattern('one/*/**')
        .matches('one/two/three', 'one/two/three/four', 'one/_/_', 'one/*/_**')
        .doesntMatch('', '/', '//', 'one/two', 'one/***', 'one')
      t.pattern('one**/*').matches('one/two').doesntMatch('one')
      t.pattern('one*/**').matches('one/two')
      t.pattern('**one*/**').matches('one/two')
      t.pattern('one/**/three/*').matches('one/two/three/four')
      t.pattern('*e/**e').matches('one/one', 'e/e').doesntMatch('one/two', 'two/e')
      t.pattern('*/**/one').doesntMatch('', '/', '//', 'one', 'one/two', 'two/one/two')
      t.pattern('*/**/*/**')
        .doesntMatch('one', 'one/two')
        .matchesWhenSeparated('one/two/three')
      t.pattern('one/**/two/*').matchesWhenSeparated('one/two/three')

      // TODO: decide on this one
      t.skip('**/*', '')
    })

    t.testPerSeparator('? and **', function (t) {
      t.pattern('?**').matches('o', 'one').doesntMatch('')
      t.pattern('one?**').doesntMatch('one')
      t.pattern('?ne**').doesntMatch('ne/two')

      t.pattern('?ne/**').matches('one/two')
      t.pattern('**/?').matches('one/t', 'one/two/three/f').matchesWhenSeparated('o')
      t.pattern('???/**/???')
        .matches('one/three/two', 'one//two')
        .matchesWhenSeparated('one/two')
        .doesntMatch('one', 'onetwo', 'one/two/three')
      t.pattern('**/?').doesntMatch('', 'one')
      t.pattern('?/**').doesntMatch('one/two')
    })

    t.testPerSeparator('?, * and **', function (t) {
      t.pattern('?*/**').matches('one/two').doesntMatch('one', '/two')
      t.pattern('?*/?**').matches('one/two')
      t.pattern('?*?/**').matches(
        'one/',
        'one/two',
        'one/two/three',
        'one/two/three/four'
      )
      t.pattern('*/**/?*')
        .matches('one/two/three', '/two/three', 'one/two/three/four')
        .matchesWhenSeparated('/o', '/one', 'one/two')
        .doesntMatch('', 'o', 'o/')
      t.pattern('?*?/**').doesntMatch('', '/', 'o', 'oe', 'one', 'o/two')
    })

    // TODO: add tests for escaped wildcards
  })
})
