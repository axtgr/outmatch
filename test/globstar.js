import { suite } from './_utils'

export default suite((t) => {
  t.test('** - globstar', (t) => {
    t.testPerSeparator(
      'Matches 0 or more segments when it takes a whole segment (/**/)',
      (t) => {
        t.pattern('**').matches(
          '',
          '/',
          'one',
          'one/',
          't/',
          '///',
          'one/three',
          'two/three',
          'one/three///',
          '/three',
          '//three'
        )
        t.pattern('**/').matches('/one/').doesntMatch('/one', '/one/two')
        t.pattern('one/**')
          .matches(
            'one/two',
            'one/two/',
            'one/two/three',
            'one/',
            'one/t/t',
            'one/*/ **',
            'one/***'
          )
          .doesntMatch('', '/', '//', 'two', 'one', '/one')
        t.pattern('**/one')
          .matches('/one')
          .matchesWhenSeparated('one/', '/one/')
          .doesntMatch('', '/', '//', 'two')
        t.pattern('one/**/four')
          .matches('one/two/four', 'one/three/four', 'one/two/three/four')
          .matchesWhenSeparated('one/four')
      }
    )

    t.testPerSeparator(
      "Behaves as * when it doesn't take a whole segment (/one**/) or no separator is given",
      (t) => {
        // TODO: add cases with separators

        t.pattern('o**')
          .matches('o', 'one', 'onetwo')
          .doesntMatch('', 'two')
          .doesntMatchWhenSeparated('o/two', 'o/two/three')
        t.pattern('**e')
          .matches('one', 'twoone')
          .doesntMatch('', 'two')
          .doesntMatchWhenSeparated('two/one', 'three/two/one')
        t.pattern('one**')
          .matches('one')
          .doesntMatch('on', 'ont', 'onte')
          .doesntMatchWhenSeparated('one/two')
        t.pattern('**two').doesntMatchWhenSeparated('one/two')
      }
    )

    t.testPerSeparator('When both stars are escaped, treated literally', (t) => {
      t.pattern('\\*\\*').matches('**').doesntMatch('', '*', 'one', 'one/two')
      t.pattern('one/\\*\\*')
        .matches('one/**')
        .doesntMatch('', '*', '**', 'one/*', 'one/two', 'one//two', 'one/two/three')
      t.pattern('\\*\\*/two')
        .matches('**/two')
        .doesntMatch('', '*', '**', 'one/**/two', 'one/three/two')
      t.pattern('one/\\*\\*/two')
        .matches('one/**/two')
        .doesntMatch('', '*', '**', 'one/two', 'one//two', 'one/three/two')
    })

    t.testPerSeparator(
      'When one of the stars is escaped, treated as a single-star wildcard and a literal star',
      (t) => {
        t.pattern('\\**').matches('*', '**', '*one').doesntMatch('one*', 'one')
        t.pattern('*\\*').matches('*', '**', 'one*').doesntMatch('*one', 'one')
        t.pattern('\\**one').matches('*one', '*twoone').doesntMatch('one')
        t.pattern('*\\*one').matches('*one', 'two*one').doesntMatch('one')
      }
    )

    t.options({ '**': false }).testPerSeparator(
      'When turned off in options, behaves as a singular *',
      (t) => {
        t.pattern('**').matches('', '**', 'one')
        t.pattern('one/**').matches('one/**', 'one/two', 'one/').doesntMatch('one')
        t.pattern('one/**/three')
          .matches('one/two/three', 'one/**/three')
          .doesntMatch('one/three')
          .doesntMatchWhenSeparated('one/two/four/three')
      }
    )
  })
})
