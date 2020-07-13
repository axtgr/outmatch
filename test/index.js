var outmatch = require('../src')

module.exports = function (t) {
  t.test('Returns a RegExp', function (t) {
    t.ok(outmatch('') instanceof RegExp)
  })

  t.test('Accepts an array of patterns', function (t) {
    t.ok(outmatch(['one']).test('one'))
    t.notOk(outmatch(['one']).test('two'))
    t.ok(outmatch(['**', 'one']).test('whatever'))
    t.ok(outmatch(['one', 'two', 'three']).test('one'))
    t.ok(outmatch(['one', 'two', 'three']).test('two'))
    t.ok(outmatch(['one', 'two', 'three']).test('three'))
    t.notOk(outmatch(['one', 'two', 'three']).test('four'))
    t.ok(outmatch(['one', 'one/two'], '/').test('one'))
    t.ok(outmatch(['one', 'one/two'], '/').test('one/two'))
    t.notOk(outmatch(['one', 'one/two'], '/').test('two'))
    t.notOk(outmatch(['one', 'one/two'], '/').test('onetwo'))
    t.ok(outmatch(['*', '*/*'], '/').test('one'))
    t.ok(outmatch(['*', '*/*'], '/').test('two'))
    t.ok(outmatch(['*', '*/*'], '/').test('one/two'))
    t.notOk(outmatch(['*', '*/*'], '/').test('one/two/three'))
  })

  t.test('Treats unused RegExp characters literally', function (t) {
    t.ok(outmatch('^$.+-|)').test('^$.+-|)'))
    t.notOk(outmatch('[].').test('[]?'))
    t.notOk(outmatch('one', '/').test('one[].*+{}]][[..$'))
    t.throws(function () {
      outmatch('[')
    })
    t.throws(function () {
      outmatch('@(one')
    })
    t.throws(function () {
      outmatch('[].*+{}]][[..$', '/')
    })
    t.throws(function () {
      outmatch('one[].*+{}]  ][[..$', '/')
    })
    t.throws(function () {
      outmatch('one[].*+{}]][[..$', '/')
    })
  })
}
