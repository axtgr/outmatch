var suite = require('./_utils').suite
var outmatch = require('../build')

// This suite tests the behavior and properties of the exported function
// rather than matching/syntactic features
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
    'The returned function has "options", "pattern" and "regexp" properties set',
    function (t) {
      var pattern = 'one'
      var isMatch = outmatch(pattern)

      t.is(isMatch.options, outmatch.options)
      t.is(isMatch.pattern, pattern)
      t.ok(isMatch.regexp instanceof RegExp)
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
    'The returned function can be used as a predicate to Array#map() to get an array of results',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.equal(samples.map(outmatch('one')), [true, false, false])
      t.equal(samples.map(outmatch('{one,two}')), [true, true, false])
      t.equal(samples.map(outmatch(['two', 'three'])), [false, true, true])
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#filter() to get a subarray of matching samples from an array',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.equal(samples.filter(outmatch('one')), ['one'])
      t.equal(samples.filter(outmatch('{one,two}')), ['one', 'two'])
      t.equal(samples.filter(outmatch(['two', 'three'])), ['two', 'three'])
      t.equal(samples.filter(outmatch('?')), [])
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

  t.test(
    'The returned function can be used as a predicate to Array#every() to check if all samples in an array match the pattern',
    function (t) {
      var samples = ['one', 'two', 'three']

      t.notOk(samples.every(outmatch('one')))
      t.ok(samples.every(outmatch('{one,two,three}')))
      t.ok(samples.every(outmatch(['one', 'two', 'three'])))
    }
  )

  /* eslint-disable es5/no-es6-methods */
  if (typeof Array.prototype.find === 'function') {
    t.test(
      'The returned function can be used as a predicate to Array#find() to find the first matching sample in an array',
      function (t) {
        var samples = ['one', 'two', 'three']

        t.equal(samples.find(outmatch('two')), 'two')
        t.equal(samples.find(outmatch('{one,four}')), 'one')
        t.equal(samples.find(outmatch(['t*', '!two'])), 'three')
        t.equal(samples.find(outmatch('?')), undefined)
      }
    )
  }

  if (typeof Array.prototype.findIndex === 'function') {
    t.test(
      'The returned function can be used as a predicate to Array#findIndex() to find the index of the first matching sample in an array',
      function (t) {
        var samples = ['one', 'two', 'three']

        t.equal(samples.findIndex(outmatch('two')), 1)
        t.equal(samples.findIndex(outmatch('{one,four}')), 0)
        t.equal(samples.findIndex(outmatch(['t*', '!two'])), 2)
        t.equal(samples.findIndex(outmatch('?')), -1)
      }
    )
  }
  /* eslint-enable es5/no-es6-methods */
})
