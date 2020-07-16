var testSeparators = require('./_utils').testSeparators

module.exports = function (t) {
  t.test('() - group/extglob', function (t) {
    t.test(
      '@() matches one of the given subpatterns exactly one time',
      testSeparators(function (t, m) {
        t.ok(m('@(one|two)')('one'))
        t.ok(m('@(one|two)')('two'))
        t.notOk(m('@(one|two)')(''))
        t.notOk(m('@(one|two)')('@(one|two)'))
        t.notOk(m('@(one|two)')('onetwo'))
        t.notOk(m('@(one|two)')('oneone'))
        t.ok(m('@(one|two|three|four)')('three'))
        t.notOk(m('@(one|two|three|four)')('five'))
        t.notOk(m('@(one|two|three|four)')('onetwo'))
      })
    )

    t.test(
      '?() matches one of the given subpatterns zero or one time',
      testSeparators(function (t, m) {
        t.ok(m('?(one|two)')(''))
        t.ok(m('?(one|two)')('one'))
        t.ok(m('?(one|two)')('two'))
        t.notOk(m('?(one|two)')('?(one|two)'))
        t.notOk(m('?(one|two)')('onetwo'))
        t.notOk(m('?(one|two)')('oneone'))
        t.ok(m('?(one|two|three|four)')(''))
        t.ok(m('?(one|two|three|four)')('three'))
        t.notOk(m('?(one|two|three|four)')('five'))
        t.notOk(m('?(one|two|three|four)')('onetwo'))
        t.notOk(m('?(one|two|three|four)')('twotwo'))
      })
    )

    t.test(
      '*() matches one of the given subpatterns zero or more times',
      testSeparators(function (t, m) {
        t.ok(m('*(one|two)')(''))
        t.ok(m('*(one|two)')('one'))
        t.ok(m('*(one|two)')('two'))
        t.ok(m('*(one|two)')('onetwo'))
        t.ok(m('*(one|two)')('oneone'))
        t.ok(m('*(one|two)')('oneonetwoonetwo'))
        t.notOk(m('*(one|two)')('*(one|two)'))
        t.notOk(m('*(one|two)')('three'))
        t.ok(m('*(one|two|three|four)')(''))
        t.ok(m('*(one|two|three|four)')('three'))
        t.ok(m('*(one|two|three|four)')('onetwothree'))
        t.ok(m('*(one|two|three|four)')('onetwothreefourthreetwoone'))
        t.notOk(m('*(one|two|three|four)')('five'))
      })
    )

    t.test(
      '+() matches one of the given subpatterns one or more times',
      testSeparators(function (t, m) {
        t.ok(m('+(one|two)')('one'))
        t.ok(m('+(one|two)')('two'))
        t.ok(m('+(one|two)')('onetwo'))
        t.ok(m('+(one|two)')('oneone'))
        t.ok(m('+(one|two)')('oneonetwoonetwo'))
        t.notOk(m('+(one|two)')(''))
        t.notOk(m('+(one|two)')('+(one|two)'))
        t.notOk(m('+(one|two)')('three'))
        t.ok(m('+(one|two|three|four)')('three'))
        t.ok(m('+(one|two|three|four)')('onetwothree'))
        t.ok(m('+(one|two|three|four)')('onetwothreefourthreetwoone'))
        t.notOk(m('+(one|two|three|four)')(''))
        t.notOk(m('+(one|two|three|four)')('five'))
      })
    )

    t.test(
      '| is treated literally when not in a complete group with a valid modifier',
      testSeparators(function (t, m) {
        t.ok(m('|')('|'))
        t.ok(m('o|e')('o|e'))
        t.notOk(m('o|e')('o'))
        t.notOk(m('o|e')('|'))
        t.ok(m('(o|e)')('(o|e)'))
        t.notOk(m('(o|e)')('o'))
        t.ok(m('&(o|e)')('&(o|e)'))
        t.notOk(m('&(o|e)')('o'))
        t.ok(m('|||')('|||'))
        t.ok(m('|@(|')('|@(|'))
      })
    )

    t.test(
      'When there is no preceding modifier given, () are treated literally',
      testSeparators(function (t, m) {
        t.ok(m('()')('()'))
        t.ok(m('one()')('one()'))
        t.ok(m('one()two')('one()two'))
        t.ok(m('(one)')('(one)'))
        t.notOk(m('(one)')('one'))
        t.notOk(m('(one|two)')('one'))
        t.notOk(m('(one|two)')('two'))
        t.ok(m('(one|)/()')('(one|)/()'))
        t.ok(m('(one)/(two)')('(one)/(two)'))
        t.ok(m('(one|two)/(three)')('(one|two)/(three)'))
        t.ok(m('(one)/(two/three|four)')('(one)/(two/three|four)'))
      })
    )

    t.test(
      'When unmatched, treated as other chars',
      testSeparators(function (t, m) {
        t.ok(m('(')('('))
        t.ok(m(')')(')'))
        t.ok(m('((')('(('))
        t.ok(m('))')('))'))

        t.ok(m('@(')('@('))
        t.ok(m('@((')('@(('))
        t.ok(m('@(@(')('@(@('))
        t.ok(m('@(@((')('@(@(('))
        t.ok(m('@()@(')('@('))

        t.ok(m('?(')('?('))
        t.ok(m('?((')('?(('))
        t.ok(m('?(?(')('?(?('))
        t.ok(m('?(?(')('a(a('))
        t.ok(m('?(?((')('?(?(('))
        t.ok(m('?(?((')('o(n(('))
        t.ok(m('?()?(')('?('))
        t.ok(m('?()?(')('n('))

        t.ok(m('*(')('*('))
        t.ok(m('*(')('('))
        t.ok(m('*(')('one('))
        t.ok(m('*((')('*(('))
        t.ok(m('*((')('(('))
        t.ok(m('*((')('one(('))
        t.ok(m('*(*(')('*(*('))
        t.ok(m('*(*(')('(('))
        t.ok(m('*(*(')('one(two('))
        t.ok(m('*()*(')('('))
        t.ok(m('*()*(')('one('))
        t.ok(m('*(*((')('((('))

        t.ok(m('+(')('+('))
        t.ok(m('+((')('+(('))
        t.ok(m('+(+(')('+(+('))
        t.ok(m('+(+((')('+(+(('))
        t.ok(m('+()+(')('+('))
      })
    )

    t.test(
      'Separators between () make them be treated literally',
      testSeparators(function (t, m, sep) {
        if (sep) {
          t.ok(m('@(one/two)')('@(one/two)'))
          t.notOk(m('@(one/two)')('one'))
          t.ok(m('?(one/two)')('?(one/two)'))
          t.ok(m('?(one/two)')('o(one/two)'))
          t.notOk(m('?(one/two)')('one'))
          t.ok(m('*(one/two)')('*(one/two)'))
          t.ok(m('*(one/two)')('one(one/two)'))
          t.notOk(m('*(one/two)')('one'))
          t.ok(m('+(one/two)')('+(one/two)'))
          t.notOk(m('+(one/two)')('one'))
        }
      })
    )

    // TODO: add tests for escaped parens
  })
}
