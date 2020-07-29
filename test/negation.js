var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('! - negated pattern', function (t) {
    t.testPerSeparator(
      'When put at the beggining of an only pattern, matches everything except for the pattern',
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
      'When an array of negated patterns is given, matches everything except for what matches the given patterns',
      function (t) {
        t.match(['!one', '!two'])('')
        t.match(['!one', '!two'])('three')
        t.dontMatch(['!one', '!two'])('one')
        t.dontMatch(['!one', '!two'])('two')

        t.match(['!one*', '!?'])('')
        t.match(['!one*', '!?'])('two')
        t.matchWhenSeparated(['!one*', '!?'])('one/two')
        t.dontMatch(['!one*', '!?'])('o')
        t.dontMatch(['!one*', '!?'])('one')
        t.dontMatch(['!one*', '!?'])('onetwo')
      }
    )

    t.testPerSeparator(
      'When a mixed array of negated and non-negated patterns is given, matches everything that matches non-negated patterns except for what matches the negated patterns',
      function (t) {
        t.match(['*', '!one', '!!!two'])('')
        t.match(['*', '!one', '!!!two'])('three')
        t.match(['*', '!one', '!!!two'])('four')
        t.match(['*', '!one', '!!!two'])('onetwo')
        t.dontMatch(['*', '!one', '!!!two'])('one')
        t.dontMatch(['*', '!one', '!!!two'])('two')
        t.dontMatchWhenSeparated(['*', '!one', '!!!two'])('three/four')
      }
    )

    t.testPerSeparator(
      'When a pattern with braces is negated, it behaves as multiple negated patterns',
      function (t) {
        t.match('!{one,two}', '')
        t.match('!{one,two}', 'three')
        t.match('!{one,two}', 'one/two')
        t.dontMatch('!{one,two}', 'one')
        t.dontMatch('!{one,two}', 'two')

        t.match('!one/{two,three}/four')('')
        t.match('!one/{two,three}/four')('foo')
        t.match('!one/{two,three}/four')('one')
        t.match('!one/{two,three}/four')('two')
        t.match('!one/{two,three}/four')('one/four')
        t.match('!one/{two,three}/four')('one/five/four')
        t.dontMatch('!one/{two,three}/four')('one/two/four')
        t.dontMatch('!one/{two,three}/four')('one/three/four')

        t.match('!**/*.{sh,bash,bat,bin,exe,msi}')('foo.com')
        t.match('!**/*.{sh,bash,bat,bin,exe,msi}')('bar/foo.txt')
        t.dontMatchWhenSeparated('!**/*.{sh,bash,bat,bin,exe,msi}')('.sh')
        t.dontMatchWhenSeparated('!**/*.{sh,bash,bat,bin,exe,msi}')('foo.bat')
        t.dontMatch('!**/*.{sh,bash,bat,bin,exe,msi}')('bar/foo.bin')
        t.dontMatch('!**/*.{sh,bash,bat,bin,exe,msi}')('baz/bar/foo.bash')
        t.dontMatch('!**/*.{sh,bash,bat,bin,exe,msi}')('baz/bar/foo.exe')
        t.dontMatch('!**/*.{sh,bash,bat,bin,exe,msi}')('qux/baz/bar/foo.msi')
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

    t.skip(
      'When there is !( at the beginning of a pattern, it is treated as the beginning of a negated extglob rather than a whole negated pattern'
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
  })
})
