var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('**', function (t) {
    t.test(
      'Matches 0 or more segments when it takes a whole segment (/**/)',
      testSeparators(function (t, m, sep) {
        t.ok(m('**')(''))
        t.ok(m('**')('/'))
        t.ok(m('**')('one'))
        t.ok(m('**')('one/'))
        t.ok(m('**')('t/'))
        t.ok(m('**')('///'))
        t.ok(m('**')('one/three'))
        t.ok(m('**')('two/three'))
        t.ok(m('**')('one/three///'))
        t.ok(m('**')('/three'))
        t.ok(m('**')('//three'))
        t.ok(m('one/**')('one/two'))
        t.ok(m('one/**')('one/two/'))
        t.ok(m('one/**')('one/two/three'))
        t.ok(m('one/**')('one/'))
        t.ok(m('one/**')('one/t/t'))
        t.ok(m('one/**')('one/*/ **'))
        t.ok(m('one/**')('one/***'))
        t.ok(m('**/')('/one/'))
        t.ok(m('**/one')('/one'))
        t.ok(m('one/**/two')('one/two'))
        t.ok(m('one/**/three')('one/two/three'))
        t.ok(m('one/**/four')('one/two/three/four'))
        t.notOk(m('one/**')(''))
        t.notOk(m('one/**')('/'))
        t.notOk(m('one/**')('//'))
        t.notOk(m('one/**')('two'))
        t.notOk(m('**/one')(''))
        t.notOk(m('**/one')('/'))
        t.notOk(m('**/one')('//'))
        t.notOk(m('**/one')('two'))

        if (sep) {
          t.notOk(m('one/**')('one'))
          t.notOk(m('one/**')('/one'))
          t.notOk(m('**/one')('one/'))
          t.notOk(m('**/')('/one'))
          t.notOk(m('**/')('/one/two'))
        }
      })
    )

    t.test(
      "Behaves as * when it doesn't take a whole segment (/one**/) or no separator is given",
      testSeparators(function (t, m, sep) {
        // TODO: add cases with separators

        t.ok(m('o**')('o'))
        t.ok(m('o**')('one'))
        t.ok(m('o**')('onetwo'))
        t.ok(m('**e')('one'))
        t.ok(m('**e')('twoone'))
        t.ok(m('one**')('one'))
        t.notOk(m('one**')('on'))
        t.notOk(m('one**')('ont'))
        t.notOk(m('one**')('onte'))
        t.notOk(m('o**')(''))
        t.notOk(m('o**')('two'))
        t.notOk(m('**e')(''))
        t.notOk(m('**e')('two'))

        if (sep) {
          t.notOk(m('**two')('one/two'))
          t.notOk(m('o**')('o/two'))
          t.notOk(m('o**')('o/two/three'))
          t.notOk(m('**e')('two/one'))
          t.notOk(m('**e')('three/two/one'))
        } else {
          t.ok(m('one**')('one/two'))
        }
      })
    )

    t.test(
      'When escaped, treated literally',
      testSeparators(function (t, m) {
        // TODO: add cases with separators

        t.ok(m('one/\\*\\*')('one/**'))
        t.notOk(m('one/\\*\\*')('one/two'))
        t.ok(m('\\*\\*')('**'))
        t.ok(m('one\\*\\*')('one**'))
        t.notOk(m('\\*\\*')('!!'))
        t.notOk(m('\\*\\*')('one/two'))
        t.notOk(m('one\\*\\*')('one!!'))
        t.notOk(m('one/\\*\\*')('one/!!'))
      })
    )
  })
}
