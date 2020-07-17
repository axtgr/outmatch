var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('{} - braces', function (t) {
    t.test(
      'Matches one of the given subpatterns exactly one time',
      testSeparators(function (t, m) {
        t.ok(m('{one,two}')('one'))
        t.ok(m('{one,two}')('two'))
        t.notOk(m('{one,two}')(''))
        t.notOk(m('{one,two}')('{one,two}'))
        t.notOk(m('{one,two}')('onetwo'))
        t.notOk(m('{one,two}')('oneone'))
        t.ok(m('{one,two,three,four}')('three'))
        t.notOk(m('{one,two,three,four}')('five'))
        t.notOk(m('{one,two,three,four}')('onetwo'))
      })
    )

    t.test(
      ', is treated literally when not in braces',
      testSeparators(function (t, m) {
        t.ok(m(',')(','))
        t.notOk(m(',')(''))
        t.ok(m('o,e')('o,e'))
        t.notOk(m('o,e')('o'))
        t.notOk(m('o,e')(','))
        t.ok(m('{o,e')('{o,e'))
        t.notOk(m('{o,e')('o'))
        t.ok(m(',,,')(',,,'))
        t.ok(m(',{,')(',{,'))
        t.ok(m('one,two')('one,two'))
      })
    )

    t.test(
      'When unmatched, treated as other chars',
      testSeparators(function (t, m) {
        t.ok(m('{')('{'))
        t.ok(m('}')('}'))
        t.ok(m('{{')('{{'))
        t.ok(m('}}')('}}'))
        t.ok(m('{}{')('{'))
      })
    )

    // TODO: add tests for escaped braces
  })
}
