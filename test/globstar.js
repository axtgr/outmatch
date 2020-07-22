var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('** - globstar', function (t) {
    t.testPerSeparator(
      'Matches 0 or more segments when it takes a whole segment (/**/)',
      function (t, sep) {
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

        if (sep) {
          t.match('one/**/two')('one/two')
        }
      }
    )

    t.testPerSeparator(
      "Behaves as * when it doesn't take a whole segment (/one**/) or no separator is given",
      function (t, sep) {
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

        if (sep) {
          t.dontMatch('**two')('one/two')
          t.dontMatch('o**')('o/two')
          t.dontMatch('o**')('o/two/three')
          t.dontMatch('**e')('two/one')
          t.dontMatch('**e')('three/two/one')
        } else {
          t.match('one**')('one/two')
        }
      }
    )

    t.testPerSeparator('When escaped, treated literally', function (t) {
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

    t.testPerSeparator('When turned off in options, behaves as a singular *', function (
      t,
      sep
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

      if (sep) {
        t.dontMatch('one/**/three')('one/two/four/three')
      } else {
        t.match('one/**/three')('one/two/four/three')
      }
    })
  })
})
