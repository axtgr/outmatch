var Path = require('path')
var { suite } = require('./_utils')

module.exports = suite((t) => {
  t.options({ separator: '\\' }).test('Using \\ as the separator is forbidden', (t) => {
    t.throws(() => {
      t.pattern('')
    })
  })

  t.options({ separator: true }).test(
    'When separator === true or undefined, forward slashes in patterns match both forward and backslashes in samples',
    (t) => {
      t.pattern('foo/*')
        .matches('foo/bar', 'foo\\bar')
        .doesntMatch('foo/bar/baz', 'foo\\bar\\baz')
      t.pattern('foo/**/qux', true).matches(
        'foo/qux',
        'foo\\bar\\qux',
        Path.join('foo', 'bar', 'baz', 'qux')
      )
    }
  )

  t.testPerSeparator(
    'Multiple separators in a row in a sample are treated as a single one',
    (t) => {
      t.pattern('foo/bar').matchesWhenSeparated('foo//bar', 'foo///bar')
      t.pattern('foo/bar/').matchesWhenSeparated('foo//bar//')
    }
  )

  t.testPerSeparator(
    'When there is a trailing separator in a pattern, samples also require one or more at the end',
    (t) => {
      t.pattern('bar/baz/')
        .matches('bar/baz/')
        .matchesWhenSeparated('bar/baz///')
        .doesntMatch('bar/baz')
    }
  )

  t.testPerSeparator(
    'When there is no trailing separator in a pattern, samples can have zero or more at the end',
    (t) => {
      t.pattern('bar/baz')
        .matches('bar/baz')
        .matchesWhenSeparated('bar/baz/', 'bar/baz///')
    }
  )
})
