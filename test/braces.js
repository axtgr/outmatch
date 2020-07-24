var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('{} - braces', function (t) {
    t.testPerSeparator(
      'Matches one of the given subpatterns exactly one time',
      function (t) {
        t.match('{one,two}')('one')
        t.match('{one,two}')('two')
        t.dontMatch('{one,two}')('')
        t.dontMatch('{one,two}')('{one,two}')
        t.dontMatch('{one,two}')('onetwo')
        t.dontMatch('{one,two}')('oneone')
        t.match('{one,two,three,four}')('three')
        t.dontMatch('{one,two,three,four}')('five')
        t.dontMatch('{one,two,three,four}')('onetwo')
        t.match('one/{two,three}/four')('one/two/four')
        t.match('one/{two,three}/four')('one/three/four')
        t.dontMatch('one/{two,three}/four')('one/{two,three}/four')
        t.dontMatch('one/{two,three}/four')('one//four')
        t.dontMatch('one/{two,three}/four')('one/five/four')
      }
    )

    t.testPerSeparator("Separators don't split braces", function (t) {
      t.match('{one,two/three}')('one')
      t.match('{one,two/three}')('two/three')
      t.match('src/{bin,test/unit,test/integration}/index.js')('src/bin/index.js')
      t.match('src/{bin,test/unit,test/integration}/index.js')('src/test/unit/index.js')
      t.match('src/{bin,test/unit,test/integration}/index.js')(
        'src/test/integration/index.js'
      )
      t.dontMatch('src/{bin,test/unit,test/integration}/index.js')('bin/index.js')
      t.dontMatch('src/{bin,test/unit,test/integration}/index.js')('src/test/index.js')
      t.dontMatch('src/{bin,test/unit,test/integration}/index.js')(
        'src/bin/unit/index.js'
      )
      t.match('src/{foo,bar/**}/?*.js')('src/foo/o.js')
      t.match('src/{foo,bar/**}/?*.js')('src/bar/baz/qux/two.js')

      t.matchWhenSeparated('src/{foo,bar/**}/?*.js')('src/bar/one.js')
    })

    t.testPerSeparator('Supports nesting', function (t) {
      t.match('{one,{two,three}}')('one')
      t.match('{one,{two,three}}')('two')
      t.match('{one,{two,three}}')('three')
      t.dontMatch('{one,{two,three}}')('')
      t.dontMatch('{one,{two,three}}')('{one,{two,three}}')
      t.match('one/{{two,three},{four,{five,six}}}/seven')('one/two/seven')
      t.match('one/{{two,three},{four,{five,six}}}/seven')('one/three/seven')
      t.match('one/{{two,three},{four,{five,six}}}/seven')('one/four/seven')
      t.match('one/{{two,three},{four,{five,six}}}/seven')('one/five/seven')
      t.match('one/{{two,three},{four,{five,six}}}/seven')('one/six/seven')
    })

    t.testPerSeparator(', is treated literally when not in braces', function (t) {
      t.match(',')(',')
      t.dontMatch(',')('')
      t.match('o,e')('o,e')
      t.dontMatch('o,e')('o')
      t.dontMatch('o,e')(',')
      t.match('{o,e')('{o,e')
      t.dontMatch('{o,e')('o')
      t.match(',,,')(',,,')
      t.match(',{,')(',{,')
      t.match('one,two')('one,two')
    })

    t.testPerSeparator(
      'When there is no comma and no range inside, treated literally',
      function (t) {
        t.match('{}')('{}')
        t.match('one{}')('one{}')
        t.match('{}two')('{}two')
        t.match('one{}two')('one{}two')
        t.match('{two}')('{two}')
        t.match('one{two}')('one{two}')
        t.match('{two}three')('{two}three')
        t.match('one{two}three')('one{two}three')
        t.match('{one/two}')('{one/two}')
        t.match('one{two/three}/four')('one{two/three}/four')
      }
    )

    t.testPerSeparator(
      'When the range inside is incomplete or there are more than one separator, treated literally',
      function (t) {
        t.match('{..1}')('{..1}')
        t.match('{1..}')('{1..}')
        t.match('{1..2..3}')('{1..2..3}')
        t.match('{1..2..3..4..5}')('{1..2..3..4..5}')
      }
    )

    t.testPerSeparator('When unmatched, treated literally', function (t) {
      t.match('{')('{')
      t.match('}')('}')
      t.match('{{')('{{')
      t.match('}}')('}}')
      t.match('{}{', '{}{')
      t.match('}{one}{', '}{one}{')
      t.match('{..1')('{..1')
      t.match('..1}')('..1}')
      t.match('{1..2')('{1..2')
      t.match('1..2}')('1..2}')
    })

    t.testPerSeparator('When turned off in options, treated literally', function (t) {
      t.options({ '{}': false })

      t.match('{one,two}')('{one,two}')
      t.dontMatch('{one,two}')('')
      t.dontMatch('{one,two}')('one')
      t.dontMatch('{one,two}')('two')
      t.match('one/{two,three}/four')('one/{two,three}/four')
      t.dontMatch('one/{two,three}/four')('one/two/four')
      t.dontMatch('one/{two,three}/four')('one/three/four')
      t.dontMatch('one/{two,three}/four')('one//four')
      t.match('{one,two/three}')('{one,two/three}')
      t.dontMatch('{one,two/three}')('one')
      t.dontMatch('{one,two/three}')('two/three')
    })

    t.testPerSeparator('When escaped, treated literally', function (t) {
      t.match('\\{one,two}')('{one,two}')
      t.dontMatch('\\{one,two}')('one')
      t.match('\\{one,two\\}')('{one,two}')
      t.dontMatch('\\{one,two\\}')('two')
      t.match('one\\{two,{three,four},five}six')('one{two,three,five}six')
      t.match('one\\{two,{three,four},five}six')('one{two,four,five}six')
      t.dontMatch('one\\{two,{three,four},five}six')('one{two,{three,four},five}six')
      t.match('one{two\\,three}four')('one{two,three}four')
      t.match('one{two\\,three,four}five')('onetwo,threefive')
      t.match('one{two\\,three,four}five')('onefourfive')
      t.match('\\{1..2}')('{1..2}')
      t.match('{1..2\\}')('{1..2}')
      t.match('\\{1..2\\}')('{1..2}')
      t.match('{1\\..2}')('{1..2}')
      t.match('\\{1\\..2\\}')('{1..2}')
      t.match('\\{1\\.\\.2\\}')('{1..2}')
      t.match('\\{\\1\\.\\.\\2\\}')('{1..2}')
    })

    t.testPerSeparator(
      'Escaped characters inside braces remain escaped after expansion',
      function (t) {
        t.match('{\\*}')('{*}')
        t.dontMatch('{\\*}')('{one}')
        t.match('{\\*,one}')('*')
        t.match('{\\*,one}')('one')
        t.dontMatch('{\\*,one}')('{*,one}')
        t.dontMatch('{\\*,one}')('{\\*,one}')
        t.dontMatch('{\\*,one}')('two')
        t.dontMatch('{\\*,one}')('')

        t.match('{\\?}')('{?}')
        t.dontMatch('{\\?}')('{a}')
        t.match('{\\?,one}')('?')
        t.match('{\\?,one}')('one')
        t.dontMatch('{\\?,one}')('')
        t.dontMatch('{\\?,one}')('a')
        t.dontMatch('{\\?,one}')('{?,one}')
      }
    )
  })
})
