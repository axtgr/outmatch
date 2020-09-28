var Path = require('path')
var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.options({ separator: '\\' }).test(
    'Using \\ as the separator is forbidden',
    function (t) {
      t.throws(function () {
        t.pattern('')
      })
    }
  )

  t.options({ separator: true }).test(
    'When separator === true, forward slashes in patterns match both forward and backslashes in samples',
    function (t) {
      t.pattern('foo/bar').matches('foo/bar', 'foo\\bar')
      t.pattern('foo/**/qux').matches(Path.join('foo', 'bar', 'baz', 'qux'))
    }
  )

  t.testPerSeparator(
    'Multiple separators in a row in a sample are treated as a single one',
    function (t) {
      t.pattern('foo/bar').matchesWhenSeparated('foo//bar', 'foo///bar')
      t.pattern('foo/bar/').matchesWhenSeparated('foo//bar//')
    }
  )

  t.testPerSeparator(
    'When there is a trailing separator in a pattern, samples also require one or more at the end',
    function (t) {
      t.pattern('bar/baz/')
        .matches('bar/baz/')
        .matchesWhenSeparated('bar/baz///')
        .doesntMatch('bar/baz')
    }
  )

  t.testPerSeparator(
    'When there is no trailing separator in a pattern, samples can have zero or more at the end',
    function (t) {
      t.pattern('bar/baz')
        .matches('bar/baz')
        .matchesWhenSeparated('bar/baz/', 'bar/baz///')
    }
  )
})
