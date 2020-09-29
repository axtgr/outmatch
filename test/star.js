var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('* - multi-char wildcard', function (t) {
    t.testPerSeparator('Matches 0 or more non-separator characters', function (t) {
      t.pattern('*')
        .matches('', '/', '//', 'o', 'one', 'one/')
        .doesntMatchWhenSeparated('one/two', '/one')

      t.pattern('one*')
        .matches('one', 'onet', 'onetwo', 'one_two')
        .doesntMatch('on', 'ont', 'onte')

      t.pattern('*/').matches('/')
      t.pattern('*/*').matches('one/', 'one/t', 'one/two')
      t.pattern('*/*/*').matches('one/two/three', '//')
      t.pattern('one/*').matches(
        'one/two',
        'one/*',
        'one/**',
        'one/***',
        'one/',
        'one/t'
      )

      t.pattern('one/*')
        .doesntMatch('', '/', '//', 'two/three', 'one', '/one')
        .doesntMatchWhenSeparated('one/two/three')

      t.pattern('one/*/three').matches('one/two/three')
      t.pattern('one/*/three/').matches('one/two/three/')
      t.pattern('one/*/three/*').matches('one/two/three/', 'one/two/three/four')
      t.pattern('*two').matches('two', 'onetwo').doesntMatchWhenSeparated('one/two')
      t.pattern('one*three').matches('onetwothree', 'onethree')
      t.pattern('one/*three').matches('one/twothree')
      t.pattern('one/two*').matches('one/twothree')

      t.pattern('*/one')
        .matches('/one')
        .doesntMatch('', '/', '//', 'one/two/three', 'one/two', 'one', 'one/')

      t.pattern('*n*')
        .matches('one', 'oonee', 'n', 'n/', 'one/')
        .doesntMatch('', '/')
        .doesntMatchWhenSeparated('/n', '/n/')

      t.pattern('o*n*e')
        .matches('one', 'oone', 'onne', 'oonne')
        .matchesWhenSeparated('one/')
        .doesntMatch('_one_', '/one')
        .doesntMatchWhenSeparated('o/ne', 'on/e', 'o/n/e')

      t.pattern('*ne/*o')
        .matches('ne/o', 'one/o', 'ne/two', 'one/two')
        .doesntMatchWhenSeparated('/ne/o')

      t.pattern('*/*o')
        .matches('/o', '//o', '/two', '/////two', 'one/two')
        .matchesWhenSeparated('/o/')
    })

    t.testPerSeparator('When escaped, treated literally', function (t) {
      // TODO: add cases with separators
      t.pattern('\\*')
        .matches('*')
        .doesntMatch('', '\\*', 'o\\*', '\\*e', '\\**', 'o', 'one', '\\o', '\\')

      t.pattern('one\\*')
        .matches('one*')
        .doesntMatch(
          '',
          'one',
          'one\\',
          'one\\*',
          'one*t',
          'one\\*two',
          'one\\**',
          '\\*',
          '*\\*',
          '\\'
        )

      t.pattern('\\*one')
        .matches('*one')
        .doesntMatch(
          '',
          'one',
          '\\one',
          '\\*one',
          't*one',
          'two\\*one',
          '\\*',
          '\\**',
          '\\'
        )
      t.pattern('o\\*e')
        .matches('o*e')
        .doesntMatch('', 'one', 'o\\e', 'o\\*e', 'o*te', '\\*', '\\**', '\\')
    })

    t.options({ '*': false }).testPerSeparator(
      'When turned off in options, treated literally',
      function (t) {
        t.pattern('*').matches('*').doesntMatch('', 'one', '/')
        t.pattern('one*two')
          .matches('one*two')
          .doesntMatch('onetwo', 'onethreetwo', 'one/two')
        t.pattern('o*e/t*o').matches('o*e/t*o').doesntMatch('one/two')
      }
    )
  })
})
