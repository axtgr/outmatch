var suite = require('./_utils').suite

module.exports = suite(function (t) {
  // When separator === false, the pattern is not split into segments,
  // so dots matter only when they are the very first char

  t.options({ excludeDot: true }).test('When excludeDot === true (default)', function (
    t
  ) {
    t.testPerSeparator('? ignores leading dots', function (t) {
      t.pattern('?').doesntMatch('.', '.o')
      t.pattern('one/?')
        .doesntMatchWhenSeparated('one/.')
        .doesntMatch('one/.t', '.one/t', '.one/.', '.t')
      t.pattern('?/two').doesntMatch('./two', '.t/two', 't/.two', './.two', '.t')
    })

    t.testPerSeparator('* ignores leading dots', function (t) {
      t.pattern('*').doesntMatch('.one', '.', '.two')
      t.pattern('one/*')
        .doesntMatchWhenSeparated('one/.two', 'one/.')
        .doesntMatch('.one/.two', '.two')
      t.pattern('*/two').doesntMatch('.one/two', '.one/.two', 'one/.', '.one/.')
    })

    t.testPerSeparator('** ignores leading dots', function (t) {
      t.pattern('**')
        .doesntMatch('.one', '.', '.one/two/three')
        .doesntMatchWhenSeparated('one/.two', 'one/two/three/.four')
      t.pattern('one/**').doesntMatchWhenSeparated(
        'one/.two',
        'one/.',
        'one/two/three/.four'
      )
      t.pattern('**/two')
        .doesntMatch('.one/two', '.one/three/four/two', './two')
        .doesntMatchWhenSeparated('one/.three/two')
      t.pattern('one/**/two').doesntMatchWhenSeparated('one/./two', 'one/.three/two')
    })

    t.testPerSeparator('[] ignores leading dots', function (t) {
      t.pattern('[a.]').doesntMatch('.')
      t.pattern('[.]foo').doesntMatch('.foo', 'foo')
      t.pattern('foo/[.b]ar')
        .doesntMatchWhenSeparated('foo/.ar')
        .doesntMatch('foo/.bar')
      t.pattern('[!-Z]').doesntMatch('.', '')
      t.pattern('[!-Z]foo').doesntMatch('.foo', 'foo')
      t.pattern('foo/[!-Z]bar')
        .doesntMatchWhenSeparated('foo/.bar')
        .doesntMatch('foo/bar')
    })

    t.testPerSeparator('@() ignores leading dots', function (t) {
      t.pattern('@(.)').doesntMatch('.', '', '@(.)')
      t.pattern('@(.|foo)').matches('foo').doesntMatch('.', '.foo', '@(.|foo)', '')
      t.pattern('foo/@(.)')
        .doesntMatchWhenSeparated('foo/.')
        .doesntMatch('foo/', 'foo/@(.)')
      t.pattern('foo/@(.|bar)')
        .matches('foo/bar')
        .doesntMatchWhenSeparated('foo/.')
        .doesntMatch('foo/', 'foo/.bar', 'foo/@(.|bar)')
      t.pattern('@(.|foo)/bar')
        .matches('foo/bar')
        .doesntMatch('./bar', '/bar', '.foo/bar', '@(.|foo)/bar')
      t.pattern('foo/@(.|bar)/baz')
        .matches('foo/bar/baz')
        .doesntMatchWhenSeparated('foo/./baz')
        .doesntMatch('foo//baz', 'foo/.bar/baz', 'foo/.', 'foo/', 'foo/@(.|bar)/baz')
    })

    t.testPerSeparator('?() ignores leading dots', function (t) {
      t.pattern('?(.)').matches('').doesntMatch('.', '?(.)')
      t.pattern('?(.|foo)').matches('', 'foo').doesntMatch('.', '.foo', '?(.|foo)')
      t.pattern('foo/?(.)')
        .matches('foo/')
        .doesntMatchWhenSeparated('foo/.')
        .doesntMatch('foo/?(.)')
      t.pattern('foo/?(.|bar)')
        .matches('foo/bar', 'foo/')
        .doesntMatchWhenSeparated('foo/.')
        .doesntMatch('foo/.bar', 'foo/?(.|bar)')
      t.pattern('?(.|foo)/bar')
        .matches('/bar', 'foo/bar')
        .doesntMatch('./bar', '.foo/bar', '?(.|foo)/bar')
      t.pattern('foo/?(.|bar)/baz')
        .matches('foo//baz', 'foo/bar/baz')
        .doesntMatchWhenSeparated('foo/./baz')
        .doesntMatch('foo/.bar/baz', 'foo/.', 'foo/', 'foo/?(.|bar)/baz')
    })

    t.testPerSeparator('*() ignores leading dots', function (t) {
      t.pattern('*(.)').matches('').doesntMatch('.', '...', '*(.)')
      t.pattern('*(.|foo)')
        .matches('', 'foo', 'foo.', 'foo.foo')
        .doesntMatch('.', '...', '.foo', '*(.|foo)')
      t.pattern('foo/*(.)')
        .matches('foo/')
        .doesntMatchWhenSeparated('foo/.', 'foo/..')
        .doesntMatch('foo/*(.)')
      t.pattern('foo/*(.|bar)')
        .matches('foo/', 'foo/bar', 'foo/bar.', 'foo/barbar')
        .doesntMatchWhenSeparated('foo/.', 'foo/..', 'foo/.bar')
        .doesntMatch('foo/*(.|bar)')
      t.pattern('*(.|foo)/bar')
        .matches('/bar', 'foo/bar', 'foo./bar', 'foofoo/bar')
        .doesntMatch('./bar', '../bar', '.foo/bar', '*(.|foo)/bar')
      t.pattern('foo/*(.|bar)/baz')
        .matches('foo//baz', 'foo/bar/baz', 'foo/bar./baz')
        .doesntMatchWhenSeparated('foo/./baz', 'foo/.bar/baz')
        .doesntMatch('foo/.', 'foo/', 'foo/*(.|bar)/baz')
    })

    t.testPerSeparator('+() ignores leading dots', function (t) {
      t.pattern('+(.)').doesntMatch('.', '...', '+(.)', '')
      t.pattern('+(.|foo)')
        .matches('foo', 'foo.', 'foo.foo')
        .doesntMatch('.', '...', '.foo', '+(.|foo)', '')
      t.pattern('foo/+(.)')
        .doesntMatchWhenSeparated('foo/.', 'foo/..')
        .doesntMatch('foo/+(.)', 'foo/')
      t.pattern('foo/+(.|bar)')
        .matches('foo/bar', 'foo/bar.', 'foo/barbar')
        .doesntMatchWhenSeparated('foo/.', 'foo/..', 'foo/.bar')
        .doesntMatch('foo/+(.|bar)', 'foo/')
      t.pattern('+(.|foo)/bar')
        .matches('foo/bar', 'foo./bar', 'foofoo/bar')
        .doesntMatch('./bar', '../bar', '.foo/bar', '+(.|foo)/bar', '/bar')
      t.pattern('foo/+(.|bar)/baz')
        .matches('foo/bar/baz', 'foo/bar./baz')
        .doesntMatchWhenSeparated('foo/./baz', 'foo/.bar/baz')
        .doesntMatch('foo/.', 'foo/', 'foo/+(.|bar)/baz', 'foo//baz')
    })

    t.testPerSeparator('!() ignores leading dots', function (t) {
      t.pattern('!(.)').matches('foo').doesntMatch('.', '.foo')
      t.pattern('!(a)').matches('foo').doesntMatch('.', '.foo')
      t.pattern('!(.|a)').matches('foo').doesntMatch('.', 'a', '.foo')
      t.pattern('foo/!(a)')
        .matches('foo/bar')
        .doesntMatchWhenSeparated('foo/.', 'foo/.bar')
      t.pattern('foo/!(.)')
        .matches('foo/bar')
        .doesntMatch('foo/.')
        .doesntMatchWhenSeparated('foo/.bar')
      t.pattern('foo/!(.|a)')
        .matches('foo/bar')
        .doesntMatch('foo/.')
        .doesntMatchWhenSeparated('foo/.bar')
      t.pattern('!(a)/bar').matches('foo/bar').doesntMatch('./bar', '.foo/bar')
      t.pattern('!(.)/bar').matches('foo/bar').doesntMatch('./bar', '.foo/bar')
      t.pattern('!(.|a)/bar').matches('foo/bar').doesntMatch('./bar', '.foo/bar')
    })

    t.testPerSeparator('Negated patterns ignore leading dots', function (t) {
      t.pattern('!foo').doesntMatch('.bar').doesntMatchWhenSeparated('foo/.bar')
      t.pattern('!foo/.bar')
        .doesntMatch('foo/.bar')
        .doesntMatchWhenSeparated('foo/.qux')
      t.pattern(['*', '!foo']).doesntMatch('.', '.bar')
      t.pattern(['foo/*', '!foo/.bar'])
        .doesntMatch('foo/.bar')
        .doesntMatchWhenSeparated('foo/.')
      t.pattern(['foo/+([.arb])', '!foo/.bar'])
        .doesntMatchWhenSeparated('foo/.', 'foo/.arb')
        .doesntMatch('foo/.bar')
    })

    t.testPerSeparator('Explicit dots in basic patterns are matched', function (t) {
      t.pattern('.').matches('.').doesntMatch('', '..', '.one')
      t.pattern('..').matches('..').doesntMatch('', '.', '.one')
      t.pattern('./..').matches('./..').doesntMatch('', '.', '..', './.one')
      t.pattern('.one').matches('.one').doesntMatch('one', '.', '')
      t.pattern('one/.').matches('one/.').doesntMatch('one/', 'one/.two')
      t.pattern('one/.two')
        .matches('one/.two')
        .doesntMatch('one/two', 'one', 'two', '.two', '')
      t.pattern('./two').matches('./two').doesntMatch('/two', '.one/two')
      t.pattern('.one/two')
        .matches('.one/two')
        .doesntMatch('one/two', 'one', 'two', '.one', '')
      t.pattern('one/.two/three')
        .matches('one/.two/three')
        .doesntMatch('one/two/three', 'one//three', 'one/./three', '.two')
      t.pattern('one/./three')
        .matches('one/./three')
        .doesntMatch('one/.two/three', 'one//three')
    })

    t.testPerSeparator('Explicit dots in braces are matched', function (t) {
      t.pattern('{.,..}')
        .matches('.', '..')
        .doesntMatch('', '.one', '.,..', './..', '{.,..}')
      t.pattern('{.,one}').matches('.', 'one').doesntMatch('', '{.,one}')
      t.pattern('{.one,two}')
        .matches('.one', 'two')
        .doesntMatch('one', '.', '', '{.one,two}')
      t.pattern('{./.,one/two}')
        .matches('./.', 'one/two')
        .doesntMatch('.one/two', 'one/.', './two', '{./.,one/two}')
      t.pattern('{one/.,two/three}')
        .matches('one/.', 'two/three')
        .doesntMatch('one/.two', '{one/.,two/three}')
      t.pattern('{one/.two,three/four}')
        .matches('one/.two', 'three/four')
        .doesntMatch('one/two', 'one', 'two', '.two', '', '{one/.two,three/four}')
      t.pattern('{./two,three/four}')
        .matches('./two', 'three/four')
        .doesntMatch('.one/two', '{./two,three/four}')
      t.pattern('{.one/two,three/four}')
        .matches('.one/two', 'three/four')
        .doesntMatch('one/two', 'one', 'two', '.one', '', '{.one/two,three/four}')
      t.pattern('{one/./three,four/five/six}')
        .matches('one/./three', 'four/five/six')
        .doesntMatch('one/.two/three', 'one//three', '{one/./three,four/five/six}')
      t.pattern('{one/.two/three,four/five/six}')
        .matches('one/.two/three', 'four/five/six')
        .doesntMatch(
          'one/two/three',
          'one//three',
          'one/./three',
          '.two',
          '{one/.two/three,four/five/six}'
        )
    })
  })

  t.options({ excludeDot: false }).test('When excludeDot === false', function (t) {
    t.testPerSeparator('? matches leading dots', function (t) {
      t.pattern('?').matches('.')
      t.pattern('one/?').matches('one/.')
      t.pattern('?/two').matches('./two')
    })

    t.testPerSeparator('* matches leading dots', function (t) {
      t.pattern('*').matches('.one', '.', '.two')
      t.pattern('one/*').matches('one/.two', 'one/.')
      t.pattern('*/two').matches('.one/two')
    })

    t.testPerSeparator('** matches leading dots', function (t) {
      t.pattern('**').matches(
        '.one',
        '.',
        '.one/two/three',
        'one/.two',
        'one/two/three/.four'
      )
      t.pattern('one/**').matches('one/.two', 'one/.', 'one/two/three/.four')
      t.pattern('**/two').matches(
        '.one/two',
        '.one/three/four/two',
        './two',
        'one/.three/two'
      )
      t.pattern('one/**/two').matches('one/./two', 'one/.three/two')
    })

    t.testPerSeparator('[] matches leading dots', function (t) {
      t.pattern('[a.]').matches('.')
      t.pattern('[.]foo').matches('.foo')
      t.pattern('foo/[.b]ar').matches('foo/.ar')
      t.pattern('[!-Z]').matches('.')
      t.pattern('[!-Z]foo').matches('.foo')
      t.pattern('foo/[!-Z]bar').matches('foo/.bar')
    })

    t.testPerSeparator('@() matches leading dots', function (t) {
      t.pattern('@(.)').matches('.').doesntMatch('', '@(.)')
      t.pattern('@(.|foo)').matches('foo', '.').doesntMatch('.foo', '@(.|foo)', '')
      t.pattern('foo/@(.)').matches('foo/.').doesntMatch('foo/', 'foo/@(.)')
      t.pattern('foo/@(.|bar)')
        .matches('foo/bar', 'foo/.')
        .doesntMatch('foo/', 'foo/.bar', 'foo/@(.|bar)')
      t.pattern('@(.|foo)/bar')
        .matches('foo/bar', './bar')
        .doesntMatch('/bar', '.foo/bar', '@(.|foo)/bar')
      t.pattern('foo/@(.|bar)/baz')
        .matches('foo/bar/baz', 'foo/./baz')
        .doesntMatch('foo//baz', 'foo/.bar/baz', 'foo/.', 'foo/', 'foo/@(.|bar)/baz')
    })

    t.testPerSeparator('?() matches leading dots', function (t) {
      t.pattern('?(.)').matches('', '.').doesntMatch('?(.)')
      t.pattern('?(.|foo)').matches('', '.', 'foo').doesntMatch('.foo', '?(.|foo)')
      t.pattern('foo/?(.)').matches('foo/', 'foo/.').doesntMatch('foo/?(.)')
      t.pattern('foo/?(.|bar)')
        .matches('foo/bar', 'foo/', 'foo/.')
        .doesntMatch('foo/.bar', 'foo/?(.|bar)')
      t.pattern('?(.|foo)/bar')
        .matches('/bar', 'foo/bar', './bar')
        .doesntMatch('.foo/bar', '?(.|foo)/bar')
      t.pattern('foo/?(.|bar)/baz')
        .matches('foo//baz', 'foo/bar/baz', 'foo/./baz')
        .doesntMatch('foo/.bar/baz', 'foo/.', 'foo/', 'foo/?(.|bar)/baz')
    })

    t.testPerSeparator('*() matches leading dots', function (t) {
      t.pattern('*(.)').matches('', '.', '...').doesntMatch('*(.)')
      t.pattern('*(.|foo)')
        .matches('', 'foo', 'foo.', 'foo.foo', '.', '...', '.foo', '..foo')
        .doesntMatch('*(.|foo)')
      t.pattern('foo/*(.)').matches('foo/', 'foo/.', 'foo/..').doesntMatch('foo/*(.)')
      t.pattern('foo/*(.|bar)')
        .matches(
          'foo/',
          'foo/bar',
          'foo/bar.',
          'foo/barbar',
          'foo/.',
          'foo/..',
          'foo/.bar'
        )
        .doesntMatch('foo/*(.|bar)')
      t.pattern('*(.|foo)/bar')
        .matches(
          '/bar',
          'foo/bar',
          'foo./bar',
          'foofoo/bar',
          './bar',
          '../bar',
          '.foo/bar'
        )
        .doesntMatch('*(.|foo)/bar')
      t.pattern('foo/*(.|bar)/baz')
        .matches('foo//baz', 'foo/bar/baz', 'foo/bar./baz', 'foo/./baz', 'foo/.bar/baz')
        .doesntMatch('foo/.', 'foo/', 'foo/*(.|bar)/baz')
    })

    t.testPerSeparator('+() matches leading dots', function (t) {
      t.pattern('+(.)').matches('.', '...').doesntMatch('+(.)', '')
      t.pattern('+(.|foo)')
        .matches('foo', 'foo.', 'foo.foo', '.', '...', '.foo', '.foo.')
        .doesntMatch('+(.|foo)', '')
      t.pattern('foo/+(.)').matches('foo/.', 'foo/..').doesntMatch('foo/+(.)', 'foo/')
      t.pattern('foo/+(.|bar)')
        .matches('foo/bar', 'foo/bar.', 'foo/barbar', 'foo/.', 'foo/..', 'foo/.bar')
        .doesntMatch('foo/+(.|bar)', 'foo/')
      t.pattern('+(.|foo)/bar')
        .matches(
          'foo/bar',
          'foo./bar',
          'foofoo/bar',
          './bar',
          '../bar',
          '.foo/bar',
          '.foo.foo/bar'
        )
        .doesntMatch('+(.|foo)/bar', '/bar')
      t.pattern('foo/+(.|bar)/baz')
        .matches('foo/bar/baz', 'foo/bar./baz', 'foo/./baz', 'foo/.bar/baz')
        .doesntMatch('foo/.', 'foo/', 'foo/+(.|bar)/baz', 'foo//baz')
    })

    t.testPerSeparator('!() matches leading dots', function (t) {
      t.pattern('!(.)').matches('foo', '.foo').doesntMatch('.')
      t.pattern('!(a)').matches('foo', '.', '.foo').doesntMatch('a')
      t.pattern('!(.|a)').matches('foo', '.foo').doesntMatch('.', 'a')
      t.pattern('foo/!(a)').matches('foo/bar', 'foo/.', 'foo/.bar').doesntMatch('foo/a')
      t.pattern('foo/!(.)').matches('foo/bar', 'foo/.bar').doesntMatch('foo/.')
      t.pattern('foo/!(.|a)').matches('foo/bar', 'foo/.bar').doesntMatch('foo/.')
      t.pattern('!(a)/bar').matches('foo/bar', './bar', '.foo/bar').doesntMatch('a/bar')
      t.pattern('!(.)/bar').matches('foo/bar', '.foo/bar').doesntMatch('./bar')
      t.pattern('!(.|a)/bar')
        .matches('foo/bar', '.foo/bar')
        .doesntMatch('./bar', 'a/bar')
    })

    t.testPerSeparator('Negated patterns match leading dots', function (t) {
      t.pattern('!foo').matches('.', '.bar', 'foo/.bar')
      t.pattern('!foo/.bar')
        .matches('foo', '.bar', 'foo/bar', 'foo/.qux')
        .doesntMatch('foo/.bar')
      t.pattern(['*', '!foo']).matches('.', '.bar').doesntMatch('foo')
      t.pattern(['foo/*', '!foo/.bar'])
        .matches('foo/.', 'foo/.qux')
        .doesntMatch('foo/.bar')
      t.pattern(['foo/+([.arb])', '!foo/.bar'])
        .matches('foo/.', 'foo/.arb')
        .doesntMatch('foo/.bar')
    })
  })
})
