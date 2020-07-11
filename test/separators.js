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

  t.test('Works with basic patterns', (t) => {
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

  t.test('Works with globstars', (t) => {
    t.ok(m('**', 'one' + sep + 'two'))
    t.notOk(m('one**two', 'one' + sep + 'two'))
    t.notOk(m('one**two', 'one' + sep + 'three' + sep + 'two'))
    t.ok(m('one' + sep + '**', 'one' + sep + 'two' + sep + 'three'))
    t.ok(m('one**' + sep + 'two', 'onethree' + sep + 'two'))
    t.notOk(m('one**' + sep + 'two', 'one' + sep + 'three' + sep + 'two'))
    t.notOk(m('one' + sep + '**two', 'one' + sep + 'three' + sep + 'two'))
  })
}

module.exports = (t) => {
  t.test('/', (t) => {
    testBasic(t, '/')
    testGlobstar(t, '/')
  })

  t.test('.', (t) => {
    testBasic(t, '.')
    testGlobstar(t, '.')
  })

  t.test(' ', (t) => {
    testBasic(t, ' ')
    testGlobstar(t, ' ')
  })

  t.test('@', (t) => {
    testBasic(t, '@')
    testGlobstar(t, '@')
  })

  t.test('?', (t) => {
    testBasic(t, '?')
    testGlobstar(t, '?')
  })

  t.test('//', (t) => {
    testBasic(t, '//')
    testGlobstar(t, '//')
  })
}
