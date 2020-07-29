var suite = require('./_utils').suite
var outmatch = require('../src')

module.exports = suite(function (t) {
  t.test('When called with no arguments, returns itself', function (t) {
    t.is(outmatch(), outmatch)
  })

  t.test(
    'When called with just an options object, returns itself bound to the given options object',
    function (t) {
      var options = {}
      var fn = outmatch(options)
      t.equal(typeof fn, 'function')
      t.is(fn.options, options)
    }
  )

  t.test(
    'When called with both a pattern and a sample, instantly checks if the sample matches the pattern',
    function (t) {
      t.equal(outmatch('one', 'one'), true)
      t.equal(outmatch('one', 'two'), false)

      t.test(
        'If given an array of patterns instead of a single pattern, returns true if the sample matches ANY of the patterns',
        function (t) {
          t.equal(outmatch(['one', 'two'], 'one'), true)
          t.equal(outmatch(['one', 'two'], 'two'), true)
          t.equal(outmatch(['one', 'two'], 'three'), false)
        }
      )

      t.test('Can be given an options object as an argument at any position', function (
        t
      ) {
        var options = {}
        t.equal(outmatch(options, 'one', 'one'), true)
        t.equal(outmatch('one', options, 'one'), true)
        t.equal(outmatch('one', 'one', options), true)
      })
    }
  )

  t.test(
    'When called with just a pattern and no sample, it compiles the pattern into a RegExp and returns a function that takes a sample and checks if it matches the pattern',
    function (t) {
      var pattern = 'one'
      var match = outmatch(pattern)

      t.equal(typeof match, 'function')
      t.equal(match(pattern), true)
      t.equal(match('two'), false)

      t.test(
        'If given an array of patterns instead of a single pattern, returns true if the sample matches ANY of the patterns',
        function (t) {
          t.equal(outmatch(['one', 'two'])('one'), true)
          t.equal(outmatch(['one', 'two'])('two'), true)
          t.equal(outmatch(['one', 'two'])('three'), false)
        }
      )

      t.test(
        'The returned function has "options", "pattern" and "regExp" properties set',
        function (t) {
          t.is(match.options, outmatch.options)
          t.is(match.pattern, pattern)
          t.ok(match.regExp instanceof RegExp)
        }
      )

      t.test(
        'Can be given an options object as the first or second argument of the first function',
        function (t) {
          var options = {}
          var match1 = outmatch(options, 'one')
          var match2 = outmatch('one', options)

          t.equal(match1.options, options)
          t.equal(match2.options, options)
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
    }
  )

  t.test('Using \\ as a separator is forbidden', function (t) {
    t.throws(function () {
      outmatch('', { separator: '\\' })
    })
  })
})
