import { suite } from './_utils'
import outmatch from '../build'

export default suite((t) => {
  t.test('When flags are defined, they are set on the compiled RegExp', (t) => {
    let isMatch = outmatch('foo', { flags: 'ig' })
    t.equal(isMatch.regexp.flags, 'gi')
  })

  t.test('i - ignoreCase', (t) => {
    t.options({
      flags: '',
    }).test('When not set, letter case is respected', (t) => {
      t.pattern('foo')
        .matches('foo')
        .doesntMatch('FOO', 'FOo', 'FoO', 'fOO', 'Foo', 'fOo', 'foO')
      t.pattern('[ab]').matches('a', 'b').doesntMatch('A', 'B')
      t.pattern('@(foo|bar)').matches('foo', 'bar').doesntMatch('FOO', 'BAR')
      t.pattern('{foo,bar}').matches('foo', 'bar').doesntMatch('FOO', 'BAR')
      t.pattern('!foo').matches('Foo').doesntMatch('foo')
    })

    t.options({
      flags: 'i',
    }).test('When set, letter case is ignored', (t) => {
      t.pattern('foo').matches('foo', 'FOO', 'FOo', 'FoO', 'fOO', 'Foo', 'fOo', 'foO')
      t.pattern('[ab]').matches('a', 'b', 'A', 'B')
      t.pattern('@(foo|bar)').matches('foo', 'bar', 'FOO', 'BAR')
      t.pattern('{foo,bar}').matches('foo', 'bar', 'FOO', 'BAR')
      t.pattern('!foo').doesntMatch('foo', 'Foo')
    })
  })
})
