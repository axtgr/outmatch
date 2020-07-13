var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test(
    'No wildcards and no separators in arguments',
    testSeparators(function (t, m) {
      t.ok(m('')(''))
      t.ok(m('o')('o'))
      t.ok(m('one')('one'))
      t.ok(m('One')('One'))
      t.ok(m('onetwo')('onetwo'))
      t.ok(m('oneTwoThree')('oneTwoThree'))

      t.notOk(m('')('o'))
      t.notOk(m('o')(''))
      t.notOk(m('o')('n'))
      t.notOk(m('O')('o'))
      t.notOk(m('o')('O'))
      t.notOk(m('one')(''))
      t.notOk(m('one')('o'))
      t.notOk(m('one')('on'))
      t.notOk(m('one')('two'))
      t.notOk(m('onetwo')('oneTwo'))
      t.notOk(m('oneTwo')('onetwo'))
    })
  )

  t.test(
    'Wildcard symbols in samples are treated literally',
    testSeparators(function (t, m) {
      t.notOk(m('')('?'))
      t.notOk(m('o')('?'))
      t.notOk(m('one')('?'))
      t.notOk(m('one')('???'))
      t.notOk(m('one')('***'))
      t.notOk(m('onetwo')('one?wo'))
      t.notOk(m('onetwo')('one?two'))
      t.notOk(m('onetwo')('*'))
      t.notOk(m('onetwo')('one*'))
      t.notOk(m('onetwo')('*two'))
      t.notOk(m('onetwo')('one*two'))
      t.notOk(m('onetwo')('**'))
      t.notOk(m('onetwo')('one**'))
      t.notOk(m('onetwo')('**two'))
      t.notOk(m('onetwo')('one**two'))
      t.notOk(m('onetwo')('***'))
      t.notOk(m('/')('?'))
      t.notOk(m('/')('??'))
      t.notOk(m('/')('???'))
      t.notOk(m('/')('*'))
      t.notOk(m('/')('**'))
      t.notOk(m('/')('/?'))
      t.notOk(m('/')('/??'))
      t.notOk(m('/')('/???'))
      t.notOk(m('/')('/*'))
      t.notOk(m('/')('/**'))
      t.notOk(m('/')('?/'))
      t.notOk(m('/')('??/'))
      t.notOk(m('/')('???/'))
      t.notOk(m('/')('*/'))
      t.notOk(m('/')('**/'))
      t.notOk(m('o/')('?/'))
      t.notOk(m('on/')('??/'))
      t.notOk(m('one/')('???/'))
      t.notOk(m('one/')('*/'))
      t.notOk(m('one/')('**/'))
    })
  )

  t.test(
    'No wildcards in patterns',
    testSeparators(function (t, m, sep) {
      t.ok(m('/')('/'))
      t.ok(m('//')('//'))
      t.ok(m('///')('///'))
      t.ok(m('one/')('one/'))
      t.ok(m('/one')('/one'))
      t.ok(m('one/two')('one/two'))
      t.ok(m('/one/')('/one/'))
      t.notOk(m('one/two')('one_two'))
      t.notOk(m('one/two')('/'))
      t.notOk(m('/')('one/two'))
      t.notOk(m('one/')('one/two'))
      t.notOk(m('one/two')('one/'))
      t.notOk(m('one/two')('one/three'))
      t.notOk(m('one/two/three')('one/three'))
      t.notOk(m('one/two/three')('one/three/two'))

      if (sep) {
        t.notOk(m('/')(''))
        t.notOk(m('')('/'))
        t.notOk(m('one/')('one//'))
        t.notOk(m('one/')('/one'))
        t.notOk(m('one/')('/one/'))
        t.notOk(m('/one')('one//'))
        t.notOk(m('/one')('//' + 'one'))
        t.notOk(m('/one')('one/'))
        t.notOk(m('/one')('/one/'))
      }
    })
  )
}
