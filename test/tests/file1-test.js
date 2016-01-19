'use strict'

var tl = require('../test-lib.js')
var fun = tl.require('file1.js')

exports.test_some = function(test) {
  test.equal(4, fun(2))
  test.done()
}
