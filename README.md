<br>

<h1 align="center">
  <img src="assets/logo.png" width="300" height="69" alt="Outmatch">
</h1>

<p align="center">
  <strong>An extremely fast and lightweight glob-matching library for JavaScript with advanced features</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/outmatch"><img src="https://img.shields.io/npm/v/outmatch" alt="npm package"></a>
  &nbsp;
  <a href="https://github.com/axtgr/outmatch/actions"><img src="https://img.shields.io/github/workflow/status/axtgr/outmatch/CI?label=CI&logo=github" alt="CI"></a>
  &nbsp;
  <a href="https://www.buymeacoffee.com/axtgr"><img src="https://img.shields.io/badge/%F0%9F%8D%BA-Buy%20me%20a%20beer-red?style=flat" alt="Buy me a beer"></a>
</p>

<br>

Outmatch takes one or more glob patterns, compiles them into a RegExp and returns a function for matching strings with it.

Glob patterns are strings that contain wildcards such as `*`, `?`, `[abc]` and others. When such a pattern is compared with another string, these wildcards can replace one or more symbols. For example, `src/*` would match both `src/foo` and `src/bar`.

While globs are usually used to search file paths separated by slashes, with outmatch it is possible to match _arbitrary_ strings, whether separated or not.

## Quickstart

```
npm install outmatch
```

```js
import outmatch from 'outmatch'

const isMatch = outmatch('src/**/*.{js,ts}')

isMatch('src/components/header/index.js') //=> true
isMatch('src/README.md') //=> false

isMatch.pattern //=> 'src/**/*.{js,ts}'
isMatch.options //=> { separator: true }
isMatch.regexp //=> /^(?:src[/\\]+? ... \.ts[/\\]*?)$/
```

More details are available in the [Installation](#installation), [Usage](#usage), [Syntax](#syntax) and [API](#api) sections.

## Features

<table>
  <tr>
    <td align="center">🍃</td>
    <td><strong>Lightweight</strong><br>No dependencies. Just 2.4&nbsp;KB when minified and gzipped — less than ⅓&nbsp;of&nbsp;picomatch and ⅕&nbsp;of&nbsp;micromatch</td>
  </tr>
  <tr>
    <td align="center">💪</td>
    <td><strong>Powerful</strong><br>Supports basic and extended globbing, proper multi-pattern compilation and custom path separators — a&nbsp;feature unique to&nbsp;outmatch</td>
  </tr>
  <tr>
    <td align="center">🎯</td>
    <td><strong>Accurate</strong><br>The only library that can handle negated extglobs correctly. Actually expands braces instead of merely converting them to groups</td>
  </tr>
  <tr>
    <td align="center">🏎</td>
    <td><strong>Fast</strong><br>Compiles and matches patterns faster than minimatch, micromatch and picomatch</td>
  </tr>
  <tr>
    <td align="center">⚒</td>
    <td><strong>Reliable</strong><br>Written in TypeScript. Covered by thousands of unit tests</td>
  </tr>
  <tr>
    <td align="center">🌞</td>
    <td><strong>Simple</strong><br>The API is a single function. Options can be specified in easy to understand language rather than Linux slang</td>
  </tr>
  <tr>
    <td align="center">🔌</td>
    <td><strong>Compatible</strong><br>Works in any ES5 environment including older versions of Node.js, Deno, React Native and browsers</td>
  </tr>
</table>

For comparison with the alternatives, see the [corresponding section](#comparison).

## Installation

The package is distributed via the npm package registry. It can be installed using one of the compatible package managers or included directly from a CDN.

#### [npm](https://www.npmjs.com)

```
npm install outmatch
```

#### [Yarn](https://yarnpkg.com)

```
yarn add outmatch
```

#### [pnpm](https://pnpm.js.org)

```
pnpm install outmatch
```

#### CDN

When included from a CDN, outmatch is available as the global function `outmatch`.

- [unpkg](https://unpkg.com/outmatch)
- [jsDelivr](https://www.jsdelivr.com/package/npm/outmatch)

## Usage

Outmatch comes built in ESM, CommonJS and UMD formats and includes TypeScript typings. The examples use ESM imports, which can be replaced with the following line for CommonJS: `const outmatch = require('outmatch')`.

The default export is a function of two arguments, first of which can be either a single glob string or an array of such patterns. The second argument is optional and can be either an [options](#options) object or a separator (which will be the value of the `separator` option). Outmatch compiles them into a regular expression and returns a function (usually called `isMatch` in the examples) that tests strings against the pattern. The pattern, options and the compiled RegExp object are available as properties on the returned function:

```js
import outmatch from 'outmatch'

const isMatch = outmatch('src/[bc]ar', { '{}': false })

isMatch('src/bar') //=> true
isMatch('src/car') //=> true
isMatch('src/tar') //=> false

isMatch.pattern //=> 'src/[bc]ar'
isMatch.options //=> { '{}': false }
isMatch.regexp //=> /^src[/\\]+?(?!\.)(?![/\\])[bc]ar[/\\]*?$/
```

The returned function can be invoked immediately if there is no need to match a pattern more than once:

```js
outmatch('src/**/*.js')('src/components/body/index.js') //=> true
```

Compiling a pattern is much slower than comparing a string to it, so it is recommended to always reuse the returned function when possible.

### File Paths and Separators

Globs are most often used to search file paths, which are, essentially, strings split into segments by slashes. While other libraries
are usually restricted to this use-case, outmatch is able to work with _arbitrary_ strings by accepting a custom separator via the second argument:

```js
const matchDomain = outmatch('*.example.com', { separator: '.' })
matchDomain('subdomain.example.com') //=> true

const matchLike = outmatch('wh?t like**like mean', 'like') // shorthand for { separator: 'like' }
matchLike('what like do like you like mean') //=> true
```

The only limitation is that backslashes `\` cannot be used as separators in patterns because
outmatch uses them for character escaping. However, when `separator` is `undefined` or `true`,
`/` in patterns will match both `/` and `\`, so a single pattern with forward slashes
can match both Unix and Windows paths:

```js
const isMatchA = outmatch('foo\\bar') // throws an error

const isMatchB = outmatch('foo/bar') // same as passing `true` as the separator

isMatchB('foo/bar') //=> true
isMatchB('foo\\bar') //=> true

const isMatchC = outmatch('foo/bar', '/')

isMatchC('foo/bar') //=> true
isMatchC('foo\\bar') //=> false
```

A thing to note is that most matching features work with a _segment_ rather than a whole pattern. For example, `foo/b*` will match `foo/bar`
but not `foo/b/ar`. The two exceptions to this are _brace expansion_ and _pattern negation_, both of which work with whole patterns:

```js
outmatch('src/{foo/bar,baz}')('src/foo/bar') //=> true (brace expansion)
outmatch('src/@(foo/bar|baz)')('src/foo/bar') //=> false (extglob)
```

Any string that contains a segment starting with a dot (a dotfile) is excluded unless the dot is specified explicitly in the pattern.
This behavior can be disabled by setting `excludeDot` to `false`, in which case leading dots are treated like any other symbol:

```js
outmatch('project/*')('project/.git') //=> false
outmatch('project/.*')('project/.git') //=> true (dot is specified explicitly)
outmatch('project/*', { excludeDot: false })('project/.git') //=> true
```

Segmentation can be turned off completely by passing `false` as the separator, which makes outmatch treat whole patterns as a single segment.
Slashes become regular symbols, `**` works identically to `*` and leading dots get excluded only when they are the very first character of a pattern:

```js
const isMatch = outmatch('foo?ba*', false)
isMatch('foo/bar/.qux') //=> true
```

A single separator in a pattern will match any number of separators in a sample string:

```js
outmatch('foo/bar/baz')('foo/bar///baz') //=> true
```

When a pattern has an explicit separator at its end, samples also require one or more trailing separators:

```js
const isMatch = outmatch('foo/bar/')

isMatch('foo/bar') //=> false
isMatch('foo/bar/') //=> true
isMatch('foo/bar///') //=> true
```

However, if there is no trailing separator in a pattern, strings will match even if they have separators at the end:

```js
const isMatch = outmatch('foo/bar')

isMatch('foo/bar') //=> true
isMatch('foo/bar/') //=> true
isMatch('foo/bar///') //=> true
```

### Multiple Patterns

Outmatch can take an array of glob patterns as the first argument instead of a single pattern. In that case a string will be considered a match if it matches _any_ of the given patterns:

```js
const isMatch = outmatch(['src/*', 'tests/*'])

isMatch('src/utils.js') //=> true
isMatch('tests/utils.js') //=> true
```

If a [negated](#negation) pattern is given among positive patterns, it will work as an ignore filter for strings that match the positive patterns:

```js
const isMatch = outmatch(['src/*', '!src/foo', '!src/bar'])

isMatch('src/foo') //=> false
isMatch('src/bar') //=> false
isMatch('src/baz') //=> true
```

### Matching Arrays of Strings

The returned function can work with arrays of strings when used as the predicate of the native array methods:

```js
const isMatch = outmatch(['src/**/*.js', '!**/body.js'])
const paths = ['readme.md', 'src/index.js', 'src/components/body.js']

paths.map(isMatch) //=> [ false, true, false ]
paths.filter(isMatch) //=> [ 'src/index.js' ]
paths.some(isMatch) //=> true
paths.every(isMatch) //=> false
paths.find(isMatch) //=> 'src/index.js'
paths.findIndex(isMatch) //=> 1
```

## Syntax

<table>
  <tr>
    <th>Pattern</th>
    <th>Description</th>
  </tr>
  <tr>
    <td colspan="2"><h4>Basic Wildcards</h4></td>
  </tr>
  <tr>
    <td><code>?</code></td>
    <td>Matches exactly one arbitrary character excluding separators</td>
  </tr>
  <tr>
    <td><code>*</code></td>
    <td>Matches zero or more arbitrary characters excluding separators</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Globstar</h4></td>
  </tr>
  <tr>
    <td><code>**</code></td>
    <td>Matches zero or more segments when used as a whole segment in a separated pattern (e.g. <code>/**/</code> if <code>/</code> is the separator)</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Character Classes (Brackets)</h4></td>
  </tr>
  <tr>
    <td><code>[abc1_]</code></td>
    <td>Matches a single character from the specified list of characters</td>
  </tr>
  <tr>
    <td><code>[a-z]</code><br><code>[0-9]</code></td>
    <td>Matches a single character from the specified range of characters</td>
  </tr>
  <tr>
    <td><code>[!abc]</code><br><code>[!f-k]</code></td>
    <td>Matches a single character <em>not</em> in the specified list or range</td>
  </tr>
  <tr>
    <td><code>[[:alnum:]]</code><br><code>[[:alpha:]]</code><br><code>[[:lower:]]</code></td>
    <td>POSIX classes are not supported. Other libraries claim to have support, but in reality it's just a gimmick.<br><br>Their original purpose was to match symbols from the current locale rather than just English. For example, <code>[[:alpha:]]</code> would match the russian letter <code>ы</code> while <code>[a-zA-Z]</code> would not. However, making this work in JS is non-trivial, and most libraries that list POSIX classes as supported merely have them as aliases to regular character ranges, so <code>[[:alpha:]]</code> works identically to <code>[a-zA-Z]</code></td>
  </tr>
  <tr>
    <td colspan="3"><h4>Extglobs (Parens)</h4></td>
  </tr>
  <tr>
    <td><code>@(bar|baz)</code></td>
    <td>Matches one of the given subpatterns repeated exactly one time</td>
  </tr>
  <tr>
    <td><code>?(foo)</code><br><code>?(bar|baz)</code></td>
    <td>Matches one of the given subpatterns repeated zero or one time</td>
  </tr>
  <tr>
    <td><code>*(foo)</code><br><code>*(bar|baz)</code></td>
    <td>Matches one of the given subpatterns repeated zero or more times</td>
  </tr>
  <tr>
    <td><code>+(foo)</code><br><code>+(bar|baz)</code></td>
    <td>Matches one of the given subpatterns repeated one or more times</td>
  </tr>
  <tr>
    <td><code>!(foo)</code><br><code>!(bar|baz)</code></td>
    <td>Matches anything except the given subpatterns. Cannot be nested inside another negated glob</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Braces</h4></td>
  </tr>
  <tr>
    <td><code>{bar,baz}</code></td>
    <td>Expands the pattern to an array of patterns, so <code>outmatch('src/{foo,bar}/baz')</code> is equivalent to <code>outmatch(['src/foo/baz', 'src/bar/baz'])</code><br><br>While braces are similar to extglobs, they work differently. Braces are expanded <em>before anything else</em>, so, unlike extglobs, they can handle subpatterns that contain separators.<br><br>Braces can be nested: <code>src/{foo,bar/{baz,qux}}</code> expands to <code>src/foo</code>, <code>src/bar/baz</code> and <code>src/bar/qux</code></td>
  </tr>
  <tr>
    <td><code>{1..5}</code></td>
    <td>Matches any character in the specified range
  </tr>
  <tr>
    <td><code>{01..300}</code><br><code>{1..9..2}</code></td>
    <td>Like most other libraries, outmatch doesn't support zero-padded and stepped ranges. The amount of code it would take to implement them is simply not justified by how rarely they are used</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Negation</h4></td>
  </tr>
  <tr>
    <td><code>!</code></td>
    <td>Negates a pattern when put at the start of it. If repeated multiple times, each <code>!</code> will invert the effect, so <code>!!foo/bar</code> is the same as <code>foo/bar</code> and <code>!!!baz/qux</code> is the same as <code>!baz/qux</code>.<br><br>A negated pattern matches any string that doesn't match the part after the <code>!</code>. When put in an array among positive patterns, negated patterns effectively work as ignores</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Escaping</h4></td>
  </tr>
  <tr>
    <td><code>\</code></td>
    <td>Escapes the following character making it be treated literally</td>
  </tr>
</table>

## API

### outmatch(patterns, options?): isMatch<br>outmatch(patterns, separator?): isMatch

Takes a single pattern string or an array of patterns and compiles them into a regular expression. Returns an isMatch function that takes a sample string as its only argument and returns true if the string matches the pattern(s).

### isMatch(sample): boolean

Tests if a sample string matches the patterns that were used to compile the regular expression and create this function.

### isMatch.regexp

The compiled regular expression.

### isMatch.pattern

The original pattern or array of patterns that was used to compile the regular expression and create the isMatch function.

### isMatch.options

The options object that was used to compile the regular expression and create the isMatch function.

### Options

| Option       | Type                        | Default Value | Description                                                                                                                                                                                                                       |
| ------------ | --------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `separator`  | string&nbsp;\|&nbsp;boolean | true          | Separator to be used to split patterns and samples into segments:<ul><li>`true` — `/` in patterns match both `/` and `\` in samples<li>`false` — don't split<li>_any string_ — custom separator                                   |
| `flags`      | string                      | undefined     | [Flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Advanced_searching_with_flags) to pass to the RegExp. For example, setting this option to `'i'` will make the matching case-insensitive |
| `excludeDot` | boolean                     | true          | Toggles whether to exclude strings that contain segments starting with a dot                                                                                                                                                      |
| `!`          | boolean                     | true          | Toggles pattern negation                                                                                                                                                                                                          |
| `?`          | boolean                     | true          | Toggles single-char wildcards                                                                                                                                                                                                     |
| `*`          | boolean                     | true          | Toggles multi-char wildcards                                                                                                                                                                                                      |
| `**`         | boolean                     | true          | Toggles globstars                                                                                                                                                                                                                 |
| `[]`         | boolean                     | true          | Toggles character classes                                                                                                                                                                                                         |
| `()`         | boolean                     | true          | Toggles extglobs                                                                                                                                                                                                                  |
| `{}`         | boolean                     | true          | Toggles brace expansion                                                                                                                                                                                                           |

## Comparison

```
Pattern: src/test/**/*.?s
Sample: src/test/foo/bar.js

Compilation
  outmatch     695,059 ops/sec
  picomatch    260,646 ops/sec

Matching
  outmatch     32,407,232 ops/sec
  picomatch    10,710,969 ops/sec
```

A better comparison is in the works.
