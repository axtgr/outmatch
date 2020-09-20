<h1 align="center">
  <br>
  <img src="assets/logo.png" width="300" height="69">
</h1>

<p align="center"><strong>An extremely fast and lightweight glob-matching library for JavaScript</strong></p>

<p align="center">
  <a href="https://www.npmjs.com/package/outmatch"><img src="https://img.shields.io/npm/v/outmatch" alt="npm package"></a>
  &nbsp;
  <a href="https://github.com/axtgr/outmatch/actions"><img src="https://img.shields.io/github/workflow/status/axtgr/outmatch/CI?label=CI&logo=github" alt="CI"></a>
  &nbsp;
  <a href="https://www.buymeacoffee.com/axtgr"><img src="https://img.shields.io/badge/%F0%9F%8D%BA-Buy%20me%20a%20beer-red?style=flat" alt="Buy me a beer"></a>
</p>

<br>

Outmatch takes one or more glob patterns, compiles them into a RegExp and returns a function for matching strings with it.

Glob patterns are strings that contain wildcards such as `*`, `?`, `[abc]` and others. When a pattern is compared with another string, these wildcards can replace one or more symbols. For example, `src/*` would match both `src/foo` and `src/bar`.

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
isMatch.regexp //=> /^(src((?!\.) ... ((?!).)*\.ts)$/
```

More details are available in the [Installation](#installation), [Usage](#usage), [Syntax](#syntax) and [API](#api) sections.

## Why outmatch?

<table>
  <tr>
    <td align="center">💪</td>
    <td><b>Powerful</b><br>Supports extended globbing, brace expansion, multi-pattern compilation and custom path separators, which are a unique feature of this library</td>
  </tr>
  <tr>
    <td align="center">🏎</td>
    <td><b>Fast</b><br>Compiles and matches patterns faster than minimatch, micromatch and picomatch</td>
  </tr>
  <tr>
    <td align="center">🍃</td>
    <td><b>Lightweight</b><br>No dependencies. Just 1.8 KB when minified and gzipped</td>
  </tr>
  <tr>
    <td align="center">⚒</td>
    <td><b>Reliable</b><br>Written in TypeScript, covered by thousands of unit tests</td>
  </tr>
  <tr>
    <td align="center">🌞</td>
    <td><b>Simple</b><br>The API is a single function. Options can be specified in easy to understand language rather than Linux slang</td>
  </tr>
  <tr>
    <td align="center">🔌</td>
    <td><b>Compatible</b><br>Works in any ES5 environment without transpilation</td>
  </tr>
</table>

For detailed comparison with the alternatives, see the [corresponding section](#comparison).

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

Outmatch comes built in ESM, CommonJS and UMD formats and includes TypeScript typings, so it is compatible with any module system. The examples use ESM imports, which can be replaced with the following line for CommonJS:

```js
const outmatch = require('outmatch')
```

The default export is a function that takes two arguments: a glob pattern and, if needed, an [options](#options) object. It compiles them into a regular expression and returns a function (called `isMatch` in the examples) that tests strings against the pattern. The pattern, options and the compiled RegExp object are available as properties on the returned function:

```js
import outmatch from 'outmatch'

const isMatch = outmatch('src/[bc]ar', { '{}': false })

isMatch('src/bar') //=> true
isMatch('src/car') //=> true
isMatch('src/tar') //=> false

isMatch.pattern //=> 'src/[bc]ar'
isMatch.options //=> { '{}': false }
isMatch.regexp //=> /^src((\/|\\))+(?!\.)[bc]ar((\/|\\))*$/
```

The returned function can be invoked immediately if there is no need to match a pattern more than once:

```js
outmatch('src/**/*.js')('src/components/body/index.js') //=> true
```

Compiling a pattern is much slower than comparing a string to it, so it is recommended to always reuse the returned function when possible.

### Working With File Paths

Globs are most often used to search file paths, which are, essentially, strings split into segments by separators (usually slashes). By default outmatch ignores any segment starting with a dot (dotfiles), which can be disabled by passing `'.': false` in options.

It's important to remember to _always use forward slashes `/` and not backslashes `\` as separators in patterns_ because outmatch uses backslashes for character escaping. However, by default forward slashes in patterns will match backslashes in tested strings when run on Windows:

```js
const isMatch = outmatch('foo/bar')

isMatch('foo/bar') //=> true
isMatch('foo\bar') //=> true on Windows, false otherwise
```

### Order of Operations

Another thing to note is that outmatch (and other libraries) splits a pattern into segments _before_ processing special symbols. Most matching features work with a _segment_ rather than a whole pattern. For example, `foo/b*` will match `foo/bar` but not `foo/b/ar`. The two exceptions to this are brace expansion and pattern negation, both of which work with whole patterns. 

The order of operations performed by outmatch is the following: `Brace expansion` → `Segmentation` → `Escaping` → `Processing special chars` → `Pattern negation`.

### Custom Separators

While other libraries are usually restricted to slash-separated file paths, outmatch can work with arbitrary strings by accepting a custom separator in the `separator` option:

```js
const isMatch = outmatch('*.example.com', { separator: '.' })
isMatch('subdomain.example.com') //=> true
```

The default value of this option is `true`, which makes it use `\` when run on Windows and `/` otherwise. Any string can be specified except for `\` as it is used for character escaping. Segmentation can be turned off completely by passing `false`, which will make outmatch treat whole patterns as a single segment:

```js
const isMatch = outmatch('foo*baz', { separator: false })
isMatch('foo/bar/baz') //=> true
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

### Multiple Patterns

An array of glob patterns can be given instead of a single pattern. In that case a string will be considered a match if it matches _any_ of the given patterns:

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
    <td>Matches any number of segments when used as a whole segment in a separated pattern (e.g. <code>/**/</code> if <code>/</code> is the separator)</td>
  </tr>
  <tr>
    <td colspan="2"><h4>Character Classes</h4></td>
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
    <td colspan="3"><h4>Extglobs</h4></td>
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
    <td>Matches anything except for the given subpatterns</td>
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
    <td colspan="2"><h5>Negation</h5></td>
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

### outmatch(patterns, options?): isMatch

Takes a single pattern string or an array of patterns and compiles them into a regular expression. Returns an isMatch function that takes a sample string as its only argument and returns true if the string matches the patterns.

### isMatch(sample): boolean

Tests if a sample string matches the patterns that were used to compile the regular expression and create this function.

### isMatch.regexp

The compiled regular expression.

### isMatch.pattern

The original pattern or array of patterns that was used to compile the regular expression and create the isMatch function.

### isMatch.options

The options object that was used to compile the regular expression and create the isMatch function.

### Options

| Option      | Type              | Default Value | Description                                                                                                                                                                   |
| ----------- | ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `separator` | boolean \| string | true          | Defines the separator used to split patterns into segments<ul><li>`true` — `\` on Windows, `/` otherwise<li>`false` — don't split patterns<li>_any string_ — custom separator |
| `!`         | boolean           | true          | Toggles pattern negation                                                                                                                                                      |
| `?`         | boolean           | true          | Toggles single-char wildcards                                                                                                                                                 |
| `*`         | boolean           | true          | Toggles multi-char wildcards                                                                                                                                                  |
| `**`        | boolean           | true          | Toggles globstars                                                                                                                                                             |
| `[]`        | boolean           | true          | Toggles character classes                                                                                                                                                     |
| `()`        | boolean           | true          | Toggles extglobs                                                                                                                                                              |
| `{}`        | boolean           | true          | Toggles brace expansion                                                                                                                                                       |
| `.`         | boolean           | true          | Toggles whether to ignore segments starting with a dot (dotfiles)                                                                                                             |

## Comparison

## License

[ISC](LICENSE)
