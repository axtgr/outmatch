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
    'When called with both a pattern and a sample, instantly matches the sample against the pattern',
    function (t) {
      t.equal(outmatch('one', 'one'), true)

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
    'When called with just a pattern and no sample, it compiles the pattern into a RegExp and returns a function that takes a sample and matches it against the pattern',
    function (t) {
      var pattern = 'one'
      var match = outmatch(pattern)

      t.equal(typeof match, 'function')
      t.equal(match(pattern), true)

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
    }
  )

  t.test(
    'If both the pattern and the sample are strings, returns true if the sample matches the pattern',
    function (t) {
      t.equal(outmatch('one', 'one'), true)
      t.equal(outmatch('one', 'two'), false)

      t.equal(outmatch('one')('one'), true)
      t.equal(outmatch('one')('two'), false)
    }
  )

  t.test(
    'If the pattern is an array of strings and the sample is string, returns true if the sample matches ANY of the patterns',
    function (t) {
      t.equal(outmatch(['one', 'two'], 'one'), true)
      t.equal(outmatch(['one', 'two'], 'two'), true)
      t.equal(outmatch(['one', 'two'], 'three'), false)

      t.equal(outmatch(['one', 'two'])('one'), true)
      t.equal(outmatch(['one', 'two'])('two'), true)
      t.equal(outmatch(['one', 'two'])('three'), false)
    }
  )

  t.test(
    'If the pattern is a string and the sample is an array of strings, returns an array of samples that match the pattern',
    function (t) {
      t.equal(outmatch('one', ['one', 'two', 'three']), ['one'])
      t.equal(outmatch('one')(['one', 'two', 'three']), ['one'])
    }
  )

  t.test(
    'If both the pattern and the sample are arrays of strings, returns an array of samples that match ANY of the patterns',
    function (t) {
      t.equal(outmatch(['one', 'two'], ['one', 'two', 'three']), ['one', 'two'])
      t.equal(outmatch(['one', 'two'])(['one', 'two', 'three']), ['one', 'two'])
    }
  )

  t.test('Using \\ as a separator is forbidden', function (t) {
    t.throws(function () {
      outmatch('', { separator: '\\' })
    })
  })
})
