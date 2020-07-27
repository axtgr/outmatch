var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('** - globstar', function (t) {
    t.testPerSeparator(
      'Matches 0 or more segments when it takes a whole segment (/**/)',
      function (t) {
        t.match('**')('')
        t.match('**')('/')
        t.match('**')('one')
        t.match('**')('one/')
        t.match('**')('t/')
        t.match('**')('///')
        t.match('**')('one/three')
        t.match('**')('two/three')
        t.match('**')('one/three///')
        t.match('**')('/three')
        t.match('**')('//three')
        t.match('one/**')('one/two')
        t.match('one/**')('one/two/')
        t.match('one/**')('one/two/three')
        t.match('one/**')('one/')
        t.match('one/**')('one/t/t')
        t.match('one/**')('one/*/ **')
        t.match('one/**')('one/***')
        t.match('**/')('/one/')
        t.match('**/one')('/one')
        t.match('one/**/three')('one/two/three')
        t.match('one/**/four')('one/two/three/four')
        t.dontMatch('one/**')('')
        t.dontMatch('one/**')('/')
        t.dontMatch('one/**')('//')
        t.dontMatch('one/**')('two')
        t.dontMatch('**/one')('')
        t.dontMatch('**/one')('/')
        t.dontMatch('**/one')('//')
        t.dontMatch('**/one')('two')
        t.dontMatch('one/**')('one')
        t.dontMatch('one/**')('/one')
        t.dontMatch('**/one')('one/')
        t.dontMatch('**/')('/one')
        t.dontMatch('**/')('/one/two')
        t.matchWhenSeparated('one/**/two')('one/two')
      }
    )

    t.testPerSeparator(
      "Behaves as * when it doesn't take a whole segment (/one**/) or no separator is given",
      function (t) {
        // TODO: add cases with separators

        t.match('o**')('o')
        t.match('o**')('one')
        t.match('o**')('onetwo')
        t.match('**e')('one')
        t.match('**e')('twoone')
        t.match('one**')('one')
        t.dontMatch('one**')('on')
        t.dontMatch('one**')('ont')
        t.dontMatch('one**')('onte')
        t.dontMatch('o**')('')
        t.dontMatch('o**')('two')
        t.dontMatch('**e')('')
        t.dontMatch('**e')('two')

        t.dontMatchWhenSeparated('**two')('one/two')
        t.dontMatchWhenSeparated('o**')('o/two')
        t.dontMatchWhenSeparated('o**')('o/two/three')
        t.dontMatchWhenSeparated('**e')('two/one')
        t.dontMatchWhenSeparated('**e')('three/two/one')
        t.dontMatchWhenSeparated('one**')('one/two')
      }
    )

    t.testPerSeparator('When both stars are escaped, treated literally', function (t) {
      // TODO: add cases with separators

      t.match('one/\\*\\*')('one/**')
      t.dontMatch('one/\\*\\*')('one/two')
      t.match('\\*\\*')('**')
      t.match('one\\*\\*')('one**')
      t.dontMatch('\\*\\*')('!!')
      t.dontMatch('\\*\\*')('one/two')
      t.dontMatch('one\\*\\*')('one!!')
      t.dontMatch('one/\\*\\*')('one/!!')
    })

    t.testPerSeparator(
      'When one of the stars is escaped, treated as a single-star wildcard and a literal star',
      function (t) {
        t.match('\\**')('*')
        t.match('\\**')('**')
        t.match('\\**')('*one')
        t.dontMatch('\\**')('one*')
        t.dontMatch('\\**')('one')
        t.match('\\**one')('*one')
        t.match('\\**one')('*twoone')
        t.dontMatch('\\**one')('one')

        t.match('*\\*')('*')
        t.match('*\\*')('**')
        t.match('*\\*')('one*')
        t.dontMatch('*\\*')('*one')
        t.dontMatch('*\\*')('one')
        t.match('*\\*one')('*one')
        t.match('*\\*one')('two*one')
        t.dontMatch('*\\*one')('one')
      }
    )

    t.testPerSeparator('When turned off in options, behaves as a singular *', function (
      t
    ) {
      t.options({ '**': false })

      t.match('**')('')
      t.match('**')('**')
      t.match('**')('one')
      t.match('one/**')('one/**')
      t.match('one/**')('one/two')
      t.match('one/**')('one/')
      t.dontMatch('one/**')('one')
      t.match('one/**/three')('one/**/three')
      t.dontMatch('one/**/three')('one/three')
      t.match('one/**/three')('one/two/three')
      t.dontMatchWhenSeparated('one/**/three')('one/two/four/three')
    })
  })
})
