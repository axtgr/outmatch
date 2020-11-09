import { suite } from './_utils'

export default suite((t) => {
  t.test('{} - braces', (t) => {
    t.testPerSeparator('Matches one of the given subpatterns exactly one time', (t) => {
      t.pattern('{one,two}')
        .matches('one', 'two')
        .doesntMatch('', '{one,two}', 'onetwo', 'oneone')

      t.pattern('{one,two,three,four}').matches('three').doesntMatch('five', 'onetwo')

      t.pattern('one/{two,three}/four')
        .matches('one/two/four', 'one/three/four')
        .doesntMatch('one/{two,three}/four', 'one//four', 'one/five/four')
    })

    t.testPerSeparator("Separators don't split braces", (t) => {
      t.pattern('{one,two/three}').matches('one', 'two/three')
      t.pattern('src/{bin,test/unit,test/integration}/index.js')
        .matches(
          'src/bin/index.js',
          'src/test/unit/index.js',
          'src/test/integration/index.js'
        )
        .doesntMatch('bin/index.js', 'src/test/index.js', 'src/bin/unit/index.js')
      t.pattern('src/{foo,bar/**}/?*.js')
        .matches('src/foo/o.js', 'src/bar/baz/qux/two.js')
        .matchesWhenSeparated('src/bar/one.js')
    })

    t.testPerSeparator('Supports nesting', (t) => {
      t.pattern('{one,{two,three}}')
        .matches('one', 'two', 'three')
        .doesntMatch('', '{one,{two,three}}')
      t.pattern('one/{{two,three},{four,{five,six}}}/seven').matches(
        'one/two/seven',
        'one/three/seven',
        'one/four/seven',
        'one/five/seven',
        'one/six/seven'
      )
    })

    t.testPerSeparator(', is treated literally when not in braces', (t) => {
      t.pattern(',').matches(',').doesntMatch('')
      t.pattern('o,e').matches('o,e').doesntMatch('o', ',')
      t.pattern('{o,e').matches('{o,e').doesntMatch('o')
      t.pattern(',,,').matches(',,,')
      t.pattern(',{,').matches(',{,')
      t.pattern('one,two').matches('one,two')
    })

    t.testPerSeparator(
      'When there is no comma and no range inside, treated literally',
      (t) => {
        t.pattern('{}').matches('{}')
        t.pattern('one{}').matches('one{}')
        t.pattern('{}two').matches('{}two')
        t.pattern('one{}two').matches('one{}two')
        t.pattern('{two}').matches('{two}')
        t.pattern('one{two}').matches('one{two}')
        t.pattern('{two}three').matches('{two}three')
        t.pattern('one{two}three').matches('one{two}three')
        t.pattern('{one/two}').matches('{one/two}')
        t.pattern('one{two/three}/four').matches('one{two/three}/four')
      }
    )

    t.testPerSeparator(
      'When the range inside is incomplete or there are more than one separator, treated literally',
      (t) => {
        t.pattern('{..1}').matches('{..1}')
        t.pattern('{1..}').matches('{1..}')
        t.pattern('{1..2..3}').matches('{1..2..3}')
        t.pattern('{1..2..3..4..5}').matches('{1..2..3..4..5}')
      }
    )

    t.testPerSeparator('When unmatched, treated literally', (t) => {
      t.pattern('{').matches('{')
      t.pattern('}').matches('}')
      t.pattern('{{').matches('{{')
      t.pattern('}}').matches('}}')
      t.pattern('{}{').matches('{}{')
      t.pattern('}{one}{').matches('}{one}{')
      t.pattern('{1..2').matches('{1..2')
      t.pattern('1..2}').matches('1..2}')
    })

    t.options({ '{}': false }).testPerSeparator(
      'When turned off in options, treated literally',
      (t) => {
        t.pattern('{one,two}').matches('{one,two}').doesntMatch('', 'one', 'two')
        t.pattern('one/{two,three}/four')
          .matches('one/{two,three}/four')
          .doesntMatch('one/two/four', 'one/three/four', 'one//four')
        t.pattern('{one,two/three}')
          .matches('{one,two/three}')
          .doesntMatch('one', 'two/three')
      }
    )

    t.testPerSeparator('When escaped, treated literally', (t) => {
      t.pattern('\\{one,two}').matches('{one,two}').doesntMatch('one')
      t.pattern('\\{one,two\\}').matches('{one,two}').doesntMatch('two')
      t.pattern('one\\{two,{three,four},five}six')
        .matches('one{two,three,five}six', 'one{two,four,five}six')
        .doesntMatch('one{two,{three,four},five}six')
      t.pattern('one{two\\,three}four').matches('one{two,three}four')
      t.pattern('one{two\\,three,four}five').matches('onetwo,threefive', 'onefourfive')
      t.pattern('\\{1..2}').matches('{1..2}')
      t.pattern('{1..2\\}').matches('{1..2}')
      t.pattern('\\{1..2\\}').matches('{1..2}')
      t.pattern('{1\\..2}').matches('{1..2}')
      t.pattern('\\{1\\..2\\}').matches('{1..2}')
      t.pattern('\\{1\\.\\.2\\}').matches('{1..2}')
      t.pattern('\\{\\1\\.\\.\\2\\}').matches('{1..2}')
    })

    t.testPerSeparator(
      'Escaped characters inside braces remain escaped after expansion',
      (t) => {
        t.pattern('{\\*}').matches('{*}').doesntMatch('{one}')
        t.pattern('{\\*,one}')
          .matches('*', 'one')
          .doesntMatch('{*,one}', '{\\*,one}', 'two', '')

        t.pattern('{\\?}').matches('{?}').doesntMatch('{a}')
        t.pattern('{\\?,one}').matches('?', 'one').doesntMatch('', 'a', '{?,one}')
      }
    )
  })
})
