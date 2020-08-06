var Path = require('path')
var suite = require('./_utils').suite
var outmatch = require('../src')

module.exports = suite(function (t) {
  t.test(
    'Compiles the pattern into a RegExp and returns a function that takes a sample and checks if it matches the pattern',
    function (t) {
      var pattern = 'one'
      var isMatch = outmatch(pattern)

      t.equal(typeof isMatch, 'function')
      t.equal(isMatch(pattern), true)
      t.equal(isMatch('two'), false)
    }
  )

  t.test(
    'If given an array of patterns instead of a single pattern, the returned function returns true if the sample matches ANY of the patterns',
    function (t) {
      t.equal(outmatch(['one', 'two'])('one'), true)
      t.equal(outmatch(['one', 'two'])('two'), true)
      t.equal(outmatch(['one', 'two'])('three'), false)
    }
  )

  t.test(
    'The returned function has "options", "pattern" and "regExp" properties set',
    function (t) {
      var pattern = 'one'
      var isMatch = outmatch(pattern)

      t.is(isMatch.options, outmatch.options)
      t.is(isMatch.pattern, pattern)
      t.ok(isMatch.regExp instanceof RegExp)
    }
  )

  t.test('Can be given an options object as the second argument', function (t) {
    var options = {}
    var isMatch = outmatch('one', options)

    t.equal(isMatch.options, options)
  })

  t.test('Throws an error if the given pattern is not a string or an array', function (
    t
  ) {
    t.doesNotThrow(function () {
      outmatch('')
      outmatch([])
    })
    t.throws(function () {
      outmatch()
    })
    t.throws(function () {
      outmatch(null)
    })
    t.throws(function () {
      outmatch(1)
    })
    t.throws(function () {
      outmatch(false)
    })
    t.throws(function () {
      outmatch({})
    })
  })

  t.test(
    'Throws an error if the given options are not an object or undefined',
    function (t) {
      t.doesNotThrow(function () {
        outmatch('')
        outmatch('', undefined)
        outmatch('', null)
        outmatch('', {})
      })
      t.throws(function () {
        outmatch('', '')
      })
      t.throws(function () {
        outmatch('', [])
      })
      t.throws(function () {
        outmatch('', 1)
      })
      t.throws(function () {
        outmatch('', false)
      })
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#filter() to get a subarray of matching samples from an array',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.equal(samples.filter(outmatch('one')), ['one'])
      t.equal(samples.filter(outmatch('{one,two}')), ['one', 'two'])
      t.equal(samples.filter(outmatch(['two', 'three'])), ['two', 'three'])
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#every() to check if all samples in an array match the pattern',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.notOk(samples.every(outmatch('one')))
      t.ok(samples.every(outmatch('{one,two,three}')))
      t.ok(samples.every(outmatch(['one', 'two', 'three'])))
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#some() to check if at least one sample in an array of samples matches the pattern',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.ok(samples.some(outmatch('one')))
      t.notOk(samples.some(outmatch('four')))
      t.ok(samples.some(outmatch('{one,two,three}')))
      t.ok(samples.some(outmatch(['one', 'two', 'three'])))
    }
  )

  t.test('Using \\ as a separator is forbidden', function (t) {
    t.throws(function () {
      outmatch('', { separator: '\\' })
    })
  })

  t.platform('win32')
    .options({ separator: true })
    .test(
      'When separator === true, uses the platform-specific separator for samples',
      function (t) {
        t.pattern('foo/bar').matches('foo/bar', 'foo\\bar')
        t.pattern('foo/**/qux').matches(Path.join('foo', 'bar', 'baz', 'qux'))
      }
    )
})
