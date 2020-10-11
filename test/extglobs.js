var suite = require('./_utils').suite

module.exports = suite(function (t) {
  t.test('() - group/extglob', function (t) {
    t.testPerSeparator(
      '@() matches one of the given subpatterns exactly one time',
      function (t) {
        t.pattern('@(one)').matches('one').doesntMatch('', 'oneone', 'two', '@(one)')
        t.pattern('@(one|two)')
          .matches('one', 'two')
          .doesntMatch('', '@(one|two)', 'onetwo', 'oneone')
        t.pattern('@(one|two|three|four)')
          .matches('three')
          .doesntMatch('five', 'onetwo')
      }
    )

    t.testPerSeparator(
      '?() matches one of the given subpatterns zero or one time',
      function (t) {
        t.pattern('?(one|two)')
          .matches('', 'one', 'two')
          .doesntMatch('?(one|two)', 'onetwo', 'oneone')
        t.pattern('?(one|two|three|four)')
          .matches('', 'three')
          .doesntMatch('five', 'onetwo', 'twotwo')
      }
    )

    t.testPerSeparator(
      '*() matches one of the given subpatterns zero or more times',
      function (t) {
        t.pattern('*(one|two)')
          .matches('', 'one', 'two', 'onetwo', 'oneone', 'oneonetwoonetwo')
          .doesntMatch('*(one|two)', 'three')
        t.pattern('*(one|two|three|four)')
          .matches('', 'three', 'onetwothree', 'onetwothreefourthreetwoone')
          .doesntMatch('five', 'fiveone')
      }
    )

    t.testPerSeparator(
      '+() matches one of the given subpatterns one or more times',
      function (t) {
        t.pattern('+(one|two)')
          .matches('one', 'two', 'onetwo', 'oneone', 'oneonetwoonetwo')
          .doesntMatch('', '+(one|two)', 'three')
        t.pattern('+(one|two|three|four)')
          .matches('three', 'onetwothree', 'onetwothreefourthreetwoone')
          .doesntMatch('', 'five')
      }
    )

    t.testPerSeparator(
      '!() matches anything except for the given subpatterns',
      function (t) {
        t.pattern('!(one)')
          .doesntMatch('one')
          .doesntMatchWhenSeparated('one/two', '/one/', 'one/')
          .matches('', 'two', 'onetwo', 'twoone')
        t.pattern('!(one|two)three')
          .doesntMatch('', 'onethree', 'twothree')
          .doesntMatchWhenSeparated('one/three', 'two/three')
          .matches(
            '!(one|two)three',
            'three',
            'onetwothree',
            'twoonethree',
            'onefourthree'
          )
        t.pattern('three!(one|two)')
          .doesntMatch('', 'threeone', 'threetwo')
          .doesntMatchWhenSeparated('threeone/', 'threetwo/')
          .matches(
            'three!(one|two)',
            'three',
            'threeonetwo',
            'threetwoone',
            'threeonefour'
          )
      }
    )

    t.testPerSeparator(
      '| is treated literally when not in a complete group with a valid modifier',
      function (t) {
        t.pattern('|').matches('|').doesntMatch('')
        t.pattern('o|e').matches('o|e').doesntMatch('', 'o', '|')
        t.pattern('(o|e)').matches('(o|e)').doesntMatch('o')
        t.pattern('&(o|e)').matches('&(o|e)').doesntMatch('o')
        t.pattern('|||').matches('|||')
        t.pattern('|@(|').matches('|@(|')
      }
    )

    t.testPerSeparator(
      'When there is no preceding modifier given, () are treated literally',
      function (t) {
        t.pattern('()').matches('()').doesntMatch('')
        t.pattern('one()').matches('one()').doesntMatch('', 'one')
        t.pattern('one()two').matches('one()two').doesntMatch('onetwo')
        t.pattern('(one)').matches('(one)').doesntMatch('one')
        t.pattern('(one|two)').matches('(one|two)').doesntMatch('one', 'two')
        t.pattern('(one|)/()').matches('(one|)/()')
        t.pattern('(one)/(two)').matches('(one)/(two)')
        t.pattern('(one|two)/(three)').matches('(one|two)/(three)')
        t.pattern('(one)/(two/three|four)').matches('(one)/(two/three|four)')
      }
    )

    // TODO: add separate tests for negated extglobs, which,
    // in case they are turned off, behave as pattern negation

    t.options({ '()': false }).testPerSeparator(
      'When turned off in options, treated literally',
      function (t) {
        t.pattern('@(one)').matches('@(one)').doesntMatch('', 'one')
        t.pattern('@(one|two)').matches('@(one|two)').doesntMatch('', 'one')
        t.pattern('?(one)').matches('?(one)').doesntMatch('', 'one')
        t.pattern('?(one|two)').matches('?(one|two)').doesntMatch('', 'one', 'two')
        t.pattern('*(one)').matches('*(one)').doesntMatch('', 'one')
        t.pattern('*(one|two)').matches('*(one|two)').doesntMatch('', 'one', 'onetwo')
        t.pattern('+(one)').matches('+(one)').doesntMatch('', 'one')
        t.pattern('+(one|two)').matches('+(one|two)').doesntMatch('', 'one', 'onetwo')

        t.pattern('@(one/two|three)')
          .matches('@(one/two|three)')
          .doesntMatch('', 'three')
        t.pattern('?(one/two|three)')
          .matches('?(one/two|three)')
          .doesntMatch('', 'three')
        t.pattern('*(one/two|three)')
          .matches('*(one/two|three)')
          .doesntMatch('', 'three')
        t.pattern('+(one/two|three)')
          .matches('+(one/two|three)')
          .doesntMatch('', 'three')

        t.pattern('one/@(two|three)/four')
          .matches('one/@(two|three)/four')
          .doesntMatch('', 'one/two/four')
        t.pattern('one/?(two|three)/four')
          .matches('one/?(two|three)/four')
          .doesntMatch('', 'one/two/four')
        t.pattern('one/*(two|three)/four')
          .matches('one/*(two|three)/four')
          .doesntMatch('', 'one/two/four')
        t.pattern('one/+(two|three)/four')
          .matches('one/+(two|three)/four')
          .doesntMatch('', 'one/two/four')
      }
    )

    t.testPerSeparator('When unmatched, treated literally', function (t) {
      t.pattern('(').matches('(')
      t.pattern(')').matches(')')
      t.pattern('((').matches('((')
      t.pattern('))').matches('))')

      t.pattern('@(').matches('@(')
      t.pattern('@((').matches('@((')
      t.pattern('@(@(').matches('@(@(')
      t.pattern('@(@((').matches('@(@((')
      t.pattern('@()@(').matches('@(')

      t.pattern('?(').matches('?(')
      t.pattern('?((').matches('?((')
      t.pattern('?(?(').matches('?(?(', 'a(a(')
      t.pattern('?(?((').matches('?(?((', 'o(n((')
      t.pattern('?()?(').matches('?(', 'n(')

      t.pattern('*(').matches('*(', '(', 'one(')
      t.pattern('*((').matches('*((', '((', 'one((')
      t.pattern('*(*(').matches('*(*(', '((', 'one(two(')
      t.pattern('*()*(').matches('(', 'one(', '(((')

      t.pattern('+(').matches('+(')
      t.pattern('+((').matches('+((')
      t.pattern('+(+(').matches('+(+(')
      t.pattern('+(+((').matches('+(+((')
      t.pattern('+()+(').matches('+(')

      t.pattern('!(').matches('!(')
      t.pattern('!((').matches('!((')
      t.pattern('!(!(').matches('!(!(')
      t.pattern('!(!((').matches('!(!((')
      t.pattern('!()!(').matches('one!(')
    })

    t.testPerSeparator(
      'Separators between () make them be treated literally',
      function (t) {
        t.pattern('@(one/two)').doesntMatch('one').matchesWhenSeparated('@(one/two)')

        t.pattern('?(one/two)')
          .doesntMatch('one')
          .matchesWhenSeparated('?(one/two)', 'o(one/two)')

        t.pattern('*(one/two)')
          .doesntMatch('one')
          .matchesWhenSeparated('*(one/two)', 'one(one/two)')

        t.pattern('+(one/two)').doesntMatch('one').matchesWhenSeparated('+(one/two)')

        t.pattern('!(one/two)').matches('!(one/two)').doesntMatchWhenSeparated('one')
      }
    )

    t.testPerSeparator('When escaped, treated literally', function (t) {
      t.pattern('\\@(one|two)')
        .matches('@(one|two)')
        .doesntMatch('', 'one', '\\@(one|two)')
      t.pattern('@(one\\|two)')
        .matches('one|two')
        .doesntMatch('', 'one', '@(one|two)', '@(one\\|two)')
      t.pattern('@(one|two\\)')
        .matches('@(one|two)')
        .doesntMatch('', 'one', '@(one|two\\)')
      t.pattern('@(\\)|\\()').matches('(', ')').doesntMatch('', '@((|))', '@(\\(|\\))')

      t.pattern('\\?(one|two)')
        .matches('?(one|two)')
        .doesntMatch('', 'one', '\\?(one|two)')
      t.pattern('?(one\\|two)')
        .matches('', 'one|two')
        .doesntMatch('one', '?(one|two)', '?(one\\|two)')
      t.pattern('?(one|two\\)')
        .matches('?(one|two)')
        .doesntMatch('', 'one', '?(one|two\\)')
      t.pattern('?(\\)|\\()').matches('(', ')', '').doesntMatch('?((|))', '?(\\(|\\))')

      t.pattern('\\*(one|two)')
        .matches('*(one|two)')
        .doesntMatch('', 'one', '\\*(one|two)')
      t.pattern('*(one\\|two)')
        .matches('one|two', 'one|twoone|two', '')
        .doesntMatch('one', '*(one|two)', '*(one\\|two)')
      t.pattern('*(one|two\\)')
        .matches('*(one|two)')
        .doesntMatch('', 'one', '*(one|two\\)')
      t.pattern('*(\\)|\\()')
        .matches('(', '((', ')', '))', ')())', '')
        .doesntMatch('*((|))', '*(\\(|\\))')

      t.pattern('\\+(one|two)')
        .matches('+(one|two)')
        .doesntMatch('', 'one', '\\+(one|two)')
      t.pattern('+(one\\|two)')
        .matches('one|two', 'one|twoone|two')
        .doesntMatch('', 'one', '+(one|two)', '+(one\\|two)')
      t.pattern('+(one|two\\)')
        .matches('+(one|two)')
        .doesntMatch('', 'one', '+(one|two\\)')
      t.pattern('+(\\)|\\()')
        .matches('(', '((', ')', '))', ')())')
        .doesntMatch('', '+((|))', '+(\\(|\\))')

      t.pattern('\\!(one|two)')
        .matches('!(one|two)')
        .doesntMatch('', 'one', 'three', '\\!(one|two)')
      t.pattern('!(one\\|two)')
        .matches('', 'one', 'two', '!(one|two)')
        .doesntMatch('one|two')
      t.pattern('!(one|two\\)')
        .matches('!(one|two)')
        .doesntMatch('', 'one', '!(one|two\\)')
      t.pattern('!(\\)|\\()')
        .doesntMatch('(', ')')
        .matches('', '((', '))', ')())', '!((|))')
    })

    // TODO: add tests for nested extglobs
  })
})
