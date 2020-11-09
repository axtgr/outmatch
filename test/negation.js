import { suite } from './_utils'

export default suite((t) => {
  t.test('! - negated pattern', (t) => {
    t.testPerSeparator(
      'When put at the beggining of an only pattern, matches everything except for the pattern',
      (t) => {
        t.pattern('!one').doesntMatch('one').matches('', 'two')
        t.pattern('!o?e').doesntMatch('one').matches('oe', 'two')
        t.pattern('!*').doesntMatch('', 'one').matchesWhenSeparated('one/two')
        t.pattern('!one/**/two').doesntMatch('one/three/two').matches('one/two/three')
        t.pattern('!o[nt]e').doesntMatch('one', 'ote').matches('oe', 'oze')
        t.pattern('!one/@(two|three)')
          .doesntMatch('one/two', 'one/three')
          .matches('one', 'one/four')
      }
    )

    t.testPerSeparator(
      'When an array of negated patterns is given, matches everything except for what matches the given patterns',
      (t) => {
        t.pattern(['!one', '!two']).matches('', 'three').doesntMatch('one', 'two')
        t.pattern(['!one*', '!?'])
          .matches('', 'two')
          .matchesWhenSeparated('one/two')
          .doesntMatch('o', 'one', 'onetwo')
      }
    )

    t.testPerSeparator(
      'When a mixed array of negated and non-negated patterns is given, matches everything that matches non-negated patterns except for what matches the negated patterns',
      (t) => {
        t.pattern(['*', '!one', '!!!two'])
          .matches('', 'three', 'four', 'onetwo')
          .doesntMatch('one', 'two')
          .doesntMatchWhenSeparated('three/four')
      }
    )

    t.testPerSeparator(
      'When a pattern with braces is negated, it behaves as multiple negated patterns',
      (t) => {
        t.pattern('!{one,two}')
          .matches('', 'three', 'one/two')
          .doesntMatch('one', 'two')
        t.pattern('!one/{two,three}/four')
          .matches('', 'foo', 'one', 'two', 'one/four', 'one/five/four')
          .doesntMatch('one/two/four', 'one/three/four')

        t.pattern('!**/*.{sh,bash,bat,bin,exe,msi}')
          .matches('foo.com', 'bar/foo.txt')
          .doesntMatch(
            'bar/foo.bin',
            'baz/bar/foo.bash',
            'baz/bar/foo.exe',
            'qux/baz/bar/foo.msi',
            '.sh' // leading dot
          )
          .doesntMatchWhenSeparated('foo.sh', 'bar.bat')
      }
    )

    t.testPerSeparator(
      'Multiple ! at the beginning of a pattern toggle negation',
      (t) => {
        t.pattern('!!one').matches('one').doesntMatch('!!one')
        t.pattern('!!!one').matches('two', '!!!one').doesntMatch('one')
        t.pattern('!!!!*')
          .matches('', '*', '!', 'one')
          .doesntMatchWhenSeparated('one/two')
      }
    )

    t.skip(
      'When there is !( at the beginning of a pattern, it is treated as the beginning of a negated extglob rather than a whole negated pattern'
    )

    t.testPerSeparator(
      'When not at the beginning of a pattern, treated literally',
      (t) => {
        t.pattern('one!two').matches('one!two').doesntMatch('', 'onetwo')
        t.pattern('one!').matches('one!').doesntMatch('', 'one')
      }
    )

    t.options({ '!': false }).testPerSeparator(
      'When turned off in options, treated literally even at the beginning of a pattern',
      (t) => {
        t.pattern('!one').matches('!one').doesntMatch('', 'one', 'two')
        t.pattern('!*')
          .matches('!', '!*', '!one')
          .doesntMatch('')
          .doesntMatchWhenSeparated('!one/two')
      }
    )
  })
})
