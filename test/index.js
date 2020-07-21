var suite = require('./_utils').suite
var outmatch = require('../src')

module.exports = suite(function (t) {
  t.test('Returns a RegExp', function (t) {
    t.ok(outmatch('') instanceof RegExp)
  })

  t.test('Accepts an array of patterns', function (t) {
    t.match(['one'])('one')
    t.dontMatch(['one'])('two')
    t.match(['**', 'one'])('whatever')
    t.match(['one', 'two', 'three'])('one')
    t.match(['one', 'two', 'three'])('two')
    t.match(['one', 'two', 'three'])('three')
    t.dontMatch(['one', 'two', 'three'])('four')

    t.options({ separator: '/' })

    t.match(['one', 'one/two'])('one')
    t.match(['one', 'one/two'])('one/two')
    t.dontMatch(['one', 'one/two'])('two')
    t.dontMatch(['one', 'one/two'])('onetwo')
    t.match(['*', '*/*'])('one')
    t.match(['*', '*/*'])('two')
    t.match(['*', '*/*'])('one/two')
    t.dontMatch(['*', '*/*'])('one/two/three')
  })

  t.test('Treats unused RegExp characters literally', function (t) {
    t.match('^$.+-|)')('^$.+-|)')
  })
})
