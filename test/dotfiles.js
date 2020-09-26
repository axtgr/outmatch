var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.options({ ignoreDot: true }).test('When ignoreDot === true', function (t) {
    // When separator === false, the pattern is not split into segments,
    // so dots matter only when they are the very first char

    // TODO: make these tests separate for each glob feature and move them
    // to the corresponding files

    t.testPerSeparator(
      'Positive patterns ignore segments starting with a dot',
      function (t) {
        t.pattern('?').doesntMatch('.', '.o')
        t.pattern('one/?')
          .doesntMatchWhenSeparated('one/.')
          .doesntMatch('one/.t', '.one/t', '.one/.', '.t')
        t.pattern('?/two').doesntMatch('./two', '.t/two', 't/.two', './.two', '.t')

        t.pattern('*').doesntMatch('.one', '.', '.two')
        t.pattern('one/*')
          .doesntMatchWhenSeparated('one/.two', 'one/.')
          .doesntMatch('.one/.two', '.two')
        t.pattern('*/two').doesntMatch('.one/two', '.one/.two', 'one/.', '.one/.')
      }
    )

    t.testPerSeparator(
      'Negated patterns ignore segments starting with a dot',
      function (t) {
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
      }
    )

    t.testPerSeparator(
      'Leading dot matches when it is specified in the pattern explicitly',
      function (t) {
        t.pattern('.one').matches('.one').doesntMatch('one', '.', '')
        t.pattern('one/.two')
          .matches('one/.two')
          .doesntMatch('one/two', 'one', 'two', '.two', '')
        t.pattern('.one/two')
          .matches('.one/two')
          .doesntMatch('one/two', 'one', 'two', '.one', '')
      }
    )
  })

  t.options({ ignoreDot: false }).test('When ignoreDot === false', function (t) {
    t.testPerSeparator(
      "Positive patterns don't ignore segments starting with a dot",
      function (t) {
        t.pattern('?').matches('.')
        t.pattern('one/?').matches('one/.')
        t.pattern('?/two').matches('./two')

        t.pattern('*').matches('.one', '.', '.two')
        t.pattern('one/*').matches('one/.two', 'one/.')
        t.pattern('*/two').matches('.one/two')
      }
    )

    t.testPerSeparator(
      "Negated patterns don't ignore segments starting with a dot",
      function (t) {
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
      }
    )
  })
})
