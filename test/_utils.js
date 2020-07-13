var outmatch = require('../src')

// TODO: add '\\', '//' and separators with wildcards
var SEPARATORS = ['', '/', '.', ' ', 'sep']

function match(separator) {
  return function (pattern) {
    return function (sample) {
      pattern = pattern.replace(/\//g, separator)
      sample = sample.replace(/\//g, separator)
      return outmatch(pattern, separator).test(sample)
    }
  }
}

function testSeparators(description, fn) {
  var test = function (t) {
    SEPARATORS.forEach(function (separator) {
      var sepDescription = separator ? 'Separator: ' + separator : 'No separator'
      // Naming the function "zora_spec_fn" is required to get the correct stack trace
      t.test(sepDescription, function zora_spec_fn(t) {
        fn(t, match(separator), separator)
      })
    })
  }

  if (fn) {
    return function (t) {
      t.test(description, function (t) {
        test(t)
      })
    }
  } else {
    fn = description
    return test
  }
}

module.exports.SEPARATORS = SEPARATORS
module.exports.match = match
module.exports.testSeparators = testSeparators
