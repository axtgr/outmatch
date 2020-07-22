var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('! - negated pattern', function (t) {
    t.testPerSeparator(
      'When put at the beggining of a pattern, matches everything except for the pattern',
      function (t) {
        t.dontMatch('!one')('one')
        t.match('!one')('')
        t.match('!one')('two')

        t.dontMatch('!o?e')('one')
        t.match('!o?e')('oe')
        t.match('!o?e')('two')

        t.dontMatch('!*')('one')
        t.dontMatch('!*')('')
        t.matchWhenSeparated('!*')('one/two')

        t.dontMatch('!one/**/two')('one/three/two')
        t.match('!one/**/two')('one/two/three')

        t.dontMatch('!o[nt]e')('one')
        t.dontMatch('!o[nt]e')('ote')
        t.match('!o[nt]e')('oe')
        t.match('!o[nt]e')('oze')

        t.dontMatch('!one/@(two|three)')('one/two')
        t.dontMatch('!one/@(two|three)')('one/three')
        t.match('!one/@(two|three)')('one')
        t.match('!one/@(two|three)')('one/four')
      }
    )

    t.testPerSeparator(
      'Multiple ! at the beginning of a pattern toggle negation',
      function (t) {
        t.match('!!one')('one')
        t.dontMatch('!!one')('!!one')
        t.match('!!!one')('two')
        t.match('!!!one')('!!!one')
        t.dontMatch('!!!one')('one')
        t.match('!!!!*')('')
        t.match('!!!!*')('*')
        t.match('!!!!*')('!')
        t.match('!!!!*')('one')
        t.dontMatchWhenSeparated('!!!!*')('one/two')
      }
    )

    t.testPerSeparator(
      'When not at the beginning of a pattern, treated literally',
      function (t) {
        t.match('one!two')('one!two')
        t.dontMatch('one!two')('')
        t.dontMatch('one!two')('onetwo')

        t.match('one!')('one!')
        t.dontMatch('one!')('')
        t.dontMatch('one!')('one')
      }
    )

    t.testPerSeparator(
      'When turned off in options, treated literally even at the beginning of a pattern',
      function (t) {
        t.options({ '!': false })

        t.match('!one')('!one')
        t.dontMatch('!one')('')
        t.dontMatch('!one')('one')
        t.dontMatch('!one')('two')

        t.match('!*')('!')
        t.match('!*')('!*')
        t.match('!*')('!one')
        t.dontMatch('!*')('')
        t.dontMatchWhenSeparated('!*')('!one/two')
      }
    )

    // TODO: decide on the behavior of arrays with negated patterns and negated patterns
    //       containing braces:
    //       Should ['!one', '!two'] be treated as "!one OR !two" (i.e. any string)
    //       or "NEITHER one NOR two"? What about '!{one,two}'?
    t.skip('!{one,two}', 'one')
    t.skip('!{one,two}', 'two')
  })
})
