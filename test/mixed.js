var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('Mixed wildcards', function (t) {
    t.test(
      '? and *',
      testSeparators(function (t, m, sep) {
        t.ok(m('?*')('onetwo'))
        t.ok(m('?*')('o'))
        t.notOk(m('?*')(''))
        t.notOk(m('*?')(''))

        t.ok(m('?ne*')('onetwo'))
        t.notOk(m('one?*')('one'))
        t.notOk(m('?ne*')('ne/two'))
        t.ok(m('?*/')('one/'))
        t.ok(m('?*/*')('one/'))
        t.ok(m('?*/*')('one/two'))
        t.ok(m('?*?')('oe'))
        t.ok(m('?*?')('one'))
        t.ok(m('?*?')('onnne'))
        t.ok(m('?*?/*')('one/'))
        t.ok(m('?*?/*')('one/two'))
        t.ok(m('?*?/*/*')('one/two/three'))
        t.ok(m('?*?/*/*')('one//'))
        t.notOk(m('?*')('/'))
        t.notOk(m('?*?')('o'))
        t.notOk(m('?*?/*')(''))
        t.notOk(m('?*?/*/*')(''))

        if (sep) {
          t.notOk(m('*?')('/'))
          t.notOk(m('?ne*')('one/two'))
          t.notOk(m('?*?/*/*')('one'))
          t.notOk(m('?*?/*/*')('o/two/three'))
          t.notOk(m('?*?/*')('one'))
          t.notOk(m('?*?/*')('one/two/three'))
          t.notOk(m('?*?/*/*')('one/two'))
          t.notOk(m('?*?/*/*')('one/two/three/four'))
          t.notOk(m('?*')('one/'))
          t.notOk(m('?*')('/one'))
          t.notOk(m('?*/*')('one'))
          t.notOk(m('?*/*')('one/two/'))
          t.notOk(m('?*?')('/one'))
          t.notOk(m('?*?')('o/e'))
          t.notOk(m('?*/*')('one/two/three'))
        }
      })
    )

    t.test(
      '* and **',
      testSeparators(function (t, m, sep) {
        t.ok(m('*/**')('/'))
        t.ok(m('*/**')('one/two'))
        t.ok(m('**/*')('one/two'))
        t.ok(m('one**/*')('one/two'))
        t.ok(m('one*/**')('one/two'))
        t.ok(m('**one*/**')('one/two'))
        t.ok(m('**/*')('one'))

        t.ok(m('*/**')('_/'))
        t.ok(m('*/**')('///'))
        t.ok(m('*/**')('two/three'))
        t.ok(m('*/**')('___/three'))
        t.ok(m('*/**')('___/three///'))
        t.ok(m('*/**')('/three'))
        t.ok(m('*/**')('//three'))
        t.ok(m('**/*')('one/two/three'))
        t.ok(m('**/*')('one/*/three'))
        t.ok(m('**/*')('one/*/**'))
        t.ok(m('*/**/*')('one/two'))
        t.ok(m('*/**/*')('one/two/three'))
        t.ok(m('*/**/*')('one/two/three/four/five'))
        t.ok(m('*/**/*')('one/two/*/four/five'))
        t.ok(m('*/**/*')('one/two/*/four/**'))
        t.ok(m('*/**/*')('one/_/three'))
        t.ok(m('*/**/*/**')('one/two/three'))
        t.ok(m('one/*/**')('one/two/three'))
        t.ok(m('one/*/**')('one/two/three/four'))
        t.ok(m('one/*/**')('one/_/_'))
        t.ok(m('one/*/**')('one/*/_**'))
        t.ok(m('one/**/two/*')('one/two/three'))
        t.ok(m('one/**/three/*')('one/two/three/four'))
        t.ok(m('*e/**e')('one/one'))
        t.ok(m('*e/**e')('e/e'))
        t.notOk(m('one/*/**')(''))
        t.notOk(m('one/*/**')('/'))
        t.notOk(m('one/*/**')('//'))
        t.notOk(m('*/**/one')(''))
        t.notOk(m('*/**/one')('/'))
        t.notOk(m('*/**/one')('//'))
        t.notOk(m('*/**/one')('one/two'))
        t.notOk(m('*/**/one')('two/one/two'))
        t.notOk(m('*e/**e')('one/two'))
        t.notOk(m('*e/**e')('two/e'))

        // TODO: decide on this one
        t.skip(m('**/*')(''))

        if (sep) {
          t.notOk(m('one**/*')('one'))
          t.notOk(m('*/**')(''))
          t.notOk(m('*/**')('_'))
          t.notOk(m('*/**')('two'))
          t.notOk(m('*/**/*/**')('one/two'))
          t.notOk(m('one/*/**')('one/two'))
          t.notOk(m('one/*/**')('one/***'))
          t.notOk(m('*/**/*')('one'))
          t.notOk(m('*/**/*/**')('one'))
          t.notOk(m('one/*/**')('one'))
          t.notOk(m('*/**/one')('one'))
        }
      })
    )

    t.test(
      '? and **',
      testSeparators(function (t, m, sep) {
        t.ok(m('?**')('o'))
        t.ok(m('?**')('one'))
        t.notOk(m('?**')(''))
        t.notOk(m('one?**')('one'))
        t.notOk(m('?ne**')('ne/two'))

        t.ok(m('?ne/**')('one/two'))
        t.ok(m('**/?')('o'))
        t.ok(m('**/?')('one/t'))
        t.ok(m('**/?')('one/two/three/f'))
        t.ok(m('???/**/???')('one/two'))
        t.ok(m('???/**/???')('one/three/two'))
        t.ok(m('???/**/???')('one//two'))
        t.notOk(m('**/?')(''))

        if (sep) {
          t.notOk(m('?/**')('one/two'))
          t.notOk(m('**/?')('one'))
          t.notOk(m('???/**/???')('one/two/three'))
          t.notOk(m('???/**/???')('one'))
          t.notOk(m('???/**/???')('onetwo'))
        }
      })
    )

    t.test(
      '?, * and **',
      testSeparators(function (t, m, sep) {
        t.ok(m('?*/**')('one/two'))
        t.ok(m('?*/?**')('one/two'))
        t.ok(m('?*?/**')('one/'))
        t.ok(m('?*?/**')('one/two'))
        t.ok(m('?*?/**')('one/two/three'))
        t.ok(m('?*?/**')('one/two/three/four'))
        t.ok(m('*/**/?*')('/o'))
        t.ok(m('*/**/?*')('/one'))
        t.ok(m('*/**/?*')('one/two'))
        t.ok(m('*/**/?*')('one/two/three'))
        t.ok(m('*/**/?*')('/two/three'))
        t.ok(m('*/**/?*')('one/two/three/four'))
        t.notOk(m('?*?/**')(''))
        t.notOk(m('?*?/**')('/'))
        t.notOk(m('?*?/**')('o'))
        t.notOk(m('*/**/?*')(''))

        if (sep) {
          t.notOk(m('?*/**')('one'))
          t.notOk(m('?*/**')('/two'))
          t.notOk(m('?*?/**')('oe'))
          t.notOk(m('?*?/**')('one'))
          t.notOk(m('?*?/**')('o/two'))
          t.notOk(m('*/**/?*')('o'))
          t.notOk(m('*/**/?*')('o/'))
        }
      })
    )

    // TODO: add tests for escaped wildcards
  })
}
