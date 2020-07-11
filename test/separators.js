var outmatch = require('../src')

function match(separator, pattern, sample) {
  if (typeof sample === 'undefined') {
    sample = separator
    separator = undefined
  }
  return outmatch(pattern, separator).test(sample)
}

function testBasic(t, sep) {
  var m = match.bind(null, sep)

  t.test('Works with basic patterns', function (t) {
    t.ok(m(sep, sep))
    t.ok(m('', ''))
    t.ok(m('one', 'one'))
    t.ok(m('one' + sep, 'one' + sep))
    t.ok(m('one' + sep + 'two', 'one' + sep + 'two'))
    t.notOk(outmatch('one' + sep + 'two', sep).test('one_two'))
    t.notOk(outmatch('one' + sep + '*', sep).test('one_*'))
  })
}

function testGlobstar(t, sep) {
  var m = match.bind(null, sep)

  t.test('Works with globstars', function (t) {
    t.ok(m('**', 'one' + sep + 'two'))
    t.notOk(m('one**two', 'one' + sep + 'two'))
    t.notOk(m('one**two', 'one' + sep + 'three' + sep + 'two'))
    t.ok(m('one' + sep + '**', 'one' + sep + 'two' + sep + 'three'))
    t.ok(m('one**' + sep + 'two', 'onethree' + sep + 'two'))
    t.notOk(m('one**' + sep + 'two', 'one' + sep + 'three' + sep + 'two'))
    t.notOk(m('one' + sep + '**two', 'one' + sep + 'three' + sep + 'two'))
  })
}

module.exports = function (t) {
  t.test('/', function (t) {
    testBasic(t, '/')
    testGlobstar(t, '/')
  })

  t.test('.', function (t) {
    testBasic(t, '.')
    testGlobstar(t, '.')
  })

  t.test(' ', function (t) {
    testBasic(t, ' ')
    testGlobstar(t, ' ')
  })

  t.test('@', function (t) {
    testBasic(t, '@')
    testGlobstar(t, '@')
  })

  t.test('?', function (t) {
    testBasic(t, '?')
    testGlobstar(t, '//')
    t.ok(outmatch('one?**?*js', '?').test('one?two?three?index.js'))
    t.ok(outmatch('one?**?*\\?js', '?').test('one?two?three?js'))
    t.ok(outmatch('one?two*', '?').test('one?twothree'))
    t.ok(outmatch('one?**', '?').test('one?two?three'))
    t.notOk(outmatch('one?**?*\\?js', '?').test('one?two?three&js'))
    t.notOk(outmatch('one?two', '?').test('one&two'))
    t.notOk(outmatch('one?**', '?').test('one'))
    t.notOk(outmatch('one?two**', '?').test('one?two?three'))
  })

  t.test('//', function (t) {
    testBasic(t, '//')
    testGlobstar(t, '//')
    t.ok(outmatch('one//two', '//').test('one//two'))
    t.ok(outmatch('*//*', '//').test('one//two'))
    t.ok(outmatch('*//**', '//').test('one//two//three'))
    t.ok(outmatch('one//**//two', '//').test('one//foo//bar//two'))
    t.ok(outmatch('one//**//two', '//').test('one//two'))
    t.notOk(outmatch('*//**', '//').test('one'))
  })
}
