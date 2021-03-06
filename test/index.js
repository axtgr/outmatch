import { suite } from './_utils'
import outmatch from '../build'

// This suite tests the behavior and properties of the exported function
// rather than matching/syntactic features
export default suite((t) => {
  t.test(
    'Compiles the pattern into a RegExp and returns a function that takes a sample and checks if it matches the pattern',
    (t) => {
      let pattern = 'one'
      let isMatch = outmatch(pattern)

      t.equal(typeof isMatch, 'function')
      t.equal(isMatch(pattern), true)
      t.equal(isMatch('two'), false)
    }
  )

  t.test(
    'If given an array of patterns instead of a single pattern, the returned function returns true if the sample matches ANY of the patterns',
    (t) => {
      t.equal(outmatch(['one', 'two'])('one'), true)
      t.equal(outmatch(['one', 'two'])('two'), true)
      t.equal(outmatch(['one', 'two'])('three'), false)
    }
  )

  t.test(
    'The returned function has "options", "pattern" and "regexp" properties set',
    (t) => {
      let defaultOptions = {}
      let pattern = 'one'
      let isMatch = outmatch(pattern)

      t.equals(isMatch.options, defaultOptions)
      t.equals(isMatch.pattern, pattern)
      t.ok(isMatch.regexp instanceof RegExp)
    }
  )

  t.test('Can be given an options object as the second argument', (t) => {
    let options = {}
    let isMatch = outmatch('one', options)

    t.equal(isMatch.options, options)
  })

  t.test('Can be given a separator string as the second argument', (t) => {
    let isMatch = outmatch('one', '@')

    t.equal(isMatch.options, { separator: '@' })
  })

  t.test('Can be given a separator boolean as the second argument', (t) => {
    let isMatch = outmatch('one', false)

    t.equal(isMatch.options, { separator: false })
  })

  t.test('Throws an error if the given pattern is not a string or an array', (t) => {
    t.throws(() => {
      outmatch()
    })
    t.throws(() => {
      outmatch(null)
    })
    t.throws(() => {
      outmatch(1)
    })
    t.throws(() => {
      outmatch(false)
    })
    t.throws(() => {
      outmatch({})
    })
  })

  t.test(
    'Throws an error if the second argument is not an object, string, boolean or undefined',
    (t) => {
      t.throws(() => {
        outmatch('', null)
      })
      t.throws(() => {
        outmatch('', [])
      })
      t.throws(() => {
        outmatch('', 1)
      })
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#map() to get an array of results',
    (t) => {
      let samples = ['one', 'two', 'three']

      t.equal(samples.map(outmatch('one')), [true, false, false])
      t.equal(samples.map(outmatch('{one,two}')), [true, true, false])
      t.equal(samples.map(outmatch(['two', 'three'])), [false, true, true])
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#filter() to get a subarray of matching samples from an array',
    (t) => {
      let samples = ['one', 'two', 'three']

      t.equal(samples.filter(outmatch('one')), ['one'])
      t.equal(samples.filter(outmatch('{one,two}')), ['one', 'two'])
      t.equal(samples.filter(outmatch(['two', 'three'])), ['two', 'three'])
      t.equal(samples.filter(outmatch('?')), [])
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#some() to check if at least one sample in an array of samples matches the pattern',
    (t) => {
      let samples = ['one', 'two', 'three']

      t.ok(samples.some(outmatch('one')))
      t.notOk(samples.some(outmatch('four')))
      t.ok(samples.some(outmatch('{one,two,three}')))
      t.ok(samples.some(outmatch(['one', 'two', 'three'])))
    }
  )

  t.test(
    'The returned function can be used as a predicate to Array#every() to check if all samples in an array match the pattern',
    (t) => {
      let samples = ['one', 'two', 'three']

      t.notOk(samples.every(outmatch('one')))
      t.ok(samples.every(outmatch('{one,two,three}')))
      t.ok(samples.every(outmatch(['one', 'two', 'three'])))
    }
  )

  if (typeof Array.prototype.find === 'function') {
    t.test(
      'The returned function can be used as a predicate to Array#find() to find the first matching sample in an array',
      (t) => {
        let samples = ['one', 'two', 'three']

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
      (t) => {
        let samples = ['one', 'two', 'three']

        t.equal(samples.findIndex(outmatch('two')), 1)
        t.equal(samples.findIndex(outmatch('{one,four}')), 0)
        t.equal(samples.findIndex(outmatch(['t*', '!two'])), 2)
        t.equal(samples.findIndex(outmatch('?')), -1)
      }
    )
  }
})
