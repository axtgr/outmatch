var { suite } = require('./_utils')

module.exports = suite((t) => {
  t.test('() - group/extglob', (t) => {
    t.testPerSeparator(
      '@() matches one of the given subpatterns exactly one time',
      (t) => {
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
      (t) => {
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
      (t) => {
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
      (t) => {
        t.pattern('+(one|two)')
          .matches('one', 'two', 'onetwo', 'oneone', 'oneonetwoonetwo')
          .doesntMatch('', '+(one|two)', 'three')
        t.pattern('+(one|two|three|four)')
          .matches('three', 'onetwothree', 'onetwothreefourthreetwoone')
          .doesntMatch('', 'five')
      }
    )

    t.testPerSeparator('!() matches anything except for the given subpatterns', (t) => {
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
    })

    t.testPerSeparator('Can be nested', (t) => {
      t.pattern('@(foo|@(bar|baz))')
        .matches('foo', 'bar', 'baz')
        .doesntMatch('', 'foobar', 'qux', '@(foo|@(bar|baz))')
      t.pattern('?(foo|+(bar|baz))')
        .matches('', 'foo', 'bar', 'baz')
        .doesntMatch('foobar', 'qux', '?(foo|@(bar|baz))')
      t.pattern('*(foo|*(bar|baz))')
        .matches('', 'foo', 'foobar', 'bazfoobar', 'foofoo')
        .doesntMatch('qux', 'fooqux', '*(foo|*(bar|baz))')
      t.pattern('+(foo|+(bar|baz))')
        .matches('foo', 'foobar', 'bazfoobar', 'foofoo')
        .doesntMatch('', 'qux', 'fooqux', '+(foo|*(bar|baz))')

      t.pattern('one@(two@(three|@(four|five)zix)|zeven)eight')
        .matches(
          'onezeveneight',
          'onetwothreeeight',
          'onetwofourzixeight',
          'onetwofivezixeight'
        )
        .doesntMatch(
          '',
          'oneeight',
          'onetwoeight',
          'onetwozixeight',
          'onezeveneightonezeveneight',
          'onetwozeveneight',
          'onethreezixeight',
          'onezevenzevenzeveneight',
          'onetwozeventwothreethreefourzixfivezixeight'
        )
      t.pattern('one?(two?(three|?(four|five)zix)|zeven)eight')
        .matches(
          'oneeight',
          'onetwoeight',
          'onezeveneight',
          'onetwothreeeight',
          'onetwofourzixeight',
          'onetwofivezixeight',
          'onetwozixeight'
        )
        .doesntMatch(
          '',
          'onezeveneightonezeveneight',
          'onetwozeveneight',
          'onethreezixeight',
          'onezevenzevenzeveneight',
          'onetwozeventwothreethreefourzixfivezixeight'
        )
      t.pattern('one*(two*(three|*(four|five)zix)|zeven)eight')
        .matches(
          'oneeight',
          'onetwoeight',
          'onezeveneight',
          'onetwothreeeight',
          'onetwofourzixeight',
          'onetwofivezixeight',
          'onetwozixeight',
          'onetwozeveneight',
          'onezevenzevenzeveneight',
          'onetwothreetwofivezixeight',
          'onetwozeventwothreethreefourzixfivezixeight'
        )
        .doesntMatch('', 'onezeveneightonezeveneight', 'onethreezixeight')
      t.pattern('one+(two+(three|+(four|five)zix)|zeven)eight')
        .matches(
          'onezeveneight',
          'onetwothreeeight',
          'onetwofourzixeight',
          'onetwofivezixeight',
          'onezevenzevenzeveneight',
          'onetwothreetwofivezixeight',
          'onetwothreefourzixzeveneight',
          'onetwothreetwofivezixzevenzeventwothreetwofourzixzeveneight'
        )
        .doesntMatch(
          '',
          'oneeight',
          'onetwoeight',
          'onezeveneightonezeveneight',
          'onethreezixeight',
          'onetwozeveneight',
          'onetwozixeight',
          'onetwozeventwothreethreefourzixfivezixeight'
        )

      t.pattern('one@(two?(three|*(four|+(five|zix))zeven)|eight)nine')
        .matches(
          'oneeightnine',
          'onetwozevennine',
          'onetwothreenine',
          'onetwofourfivefivefourzixzevennine'
        )
        .doesntMatch(
          '',
          'onetwoeightnine',
          'onetwothreeeightnine',
          'onetwothreefourfivezixzeveneightnine'
        )
    })

    // TODO: add tests for !() nested in other extglobs

    t.test('!() cannot be nested in another !()', (t) => {
      t.throws(() => {
        t.pattern('!(foo!(bar|baz))')
      })
    })

    t.testPerSeparator(
      '| is treated literally when not in a complete group with a valid modifier',
      (t) => {
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
      (t) => {
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
      (t) => {
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

    t.testPerSeparator('When unmatched, treated literally', (t) => {
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

    t.testPerSeparator('Separators between () make them be treated literally', (t) => {
      t.pattern('@(one/two)').doesntMatch('one').matchesWhenSeparated('@(one/two)')

      t.pattern('?(one/two)')
        .doesntMatch('one')
        .matchesWhenSeparated('?(one/two)', 'o(one/two)')

      t.pattern('*(one/two)')
        .doesntMatch('one')
        .matchesWhenSeparated('*(one/two)', 'one(one/two)')

      t.pattern('+(one/two)').doesntMatch('one').matchesWhenSeparated('+(one/two)')

      t.pattern('!(one/two)').matches('!(one/two)').doesntMatchWhenSeparated('one')
    })

    t.testPerSeparator('When escaped, treated literally', (t) => {
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
  })
})
