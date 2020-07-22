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
      }
    )

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

    t.testPerSeparator('When unmatched, treated literally', function (t) {
      t.match('{')('{')
      t.match('}')('}')
      t.match('{{')('{{')
      t.match('}}')('}}')
      t.skip('{}{', '{')
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

    t.testPerSeparator("Separators don't split braces", function (t, sep) {
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

      if (sep) {
        t.match('src/{foo,bar/**}/?*.js')('src/bar/one.js')
      }
    })

    // TODO: add tests for escaped braces
  })
})
