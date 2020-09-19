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

isMatch.regExp //=> /^(src((?!\.) ... ((?!).)*\.ts)$/
isMatch.pattern //=> 'src/**/*.{js,ts}'
isMatch.options //=> { separator: true }
```

More details are available in the [Installation](#installation) and [Usage](#usage) sections.

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

Outmatch comes built in ESM, CommonJS and UMD formats and includes TypeScript typings, so it is compatible with any module system.

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

### Syntax

<table>
  <tr>
    <th>Pattern</th>
    <th>Description</th>
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
    <td colspan="2"><strong>Globstar</strong></td>
  </tr>
  <tr>
    <td><code>**</code></td>
    <td>Matches any number of segments when used as a whole segment in a separated pattern (e.g. <code>/**/</code> if <code>/</code> is the separator)</td>
  </tr>
  <tr>
    <td colspan="2"><strong>Character classes</strong></td>
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
    <td colspan="3"><strong>Extglobs</strong></td>
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
    <td colspan="2"><strong>Braces</strong></td>
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
    <td colspan="2"><strong>Negation</strong></td>
  </tr>
  <tr>
    <td><code>!</code></td>
    <td>Negates a pattern when put at the start of it. If repeated multiple times, each <code>!</code> will invert the effect, so <code>!!foo/bar</code> is the same as <code>foo/bar</code> and <code>!!!baz/qux</code> is the same as <code>!baz/qux</code>.<br><br>A negated pattern matches any string that doesn't match the part after the <code>!</code>. When put in an array among positive patterns, negated patterns effectively work as ignores</td>
  </tr>
  <tr>
    <td colspan="2"><strong>Escaping</strong></td>
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

### isMatch.regExp

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

Coming soon.

## License

[ISC](LICENSE)
