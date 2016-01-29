'use strict'
var React = require('react')
var tl = require('../test-lib.js')
var {InputText} = tl.require('blocks/dribs')

exports.test_some = function(test) {
  var s = React.renderToStaticMarkup(
    React.createElement(InputText, {value:'hi'})
  );
  test.equal(s, '<input value="hi" type="text" class="chd-input-text"/>')
  test.done()
}
