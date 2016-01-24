'use strict'
var React = require('react')
var PureRenderMixin = require('react-addons-pure-render-mixin')
var me = module.exports

me.mapsep = (ids, values, iter) =>
  ids.map(id => iter(values[id], id))

me.assignExisting = (to, from) => {
  var res = {...to}
  for(var key in from) {
    res[key] = from[key] !== undefined ? from[key] : to[key]
  }
  return res
}

me.formatNumber = (num) => {
  var str = isNaN(Number(num)) ? '' : ('' + num);
  for(var k = 1, i = str.length - 1; i > 0; --i, ++k) {
    if (k % 3 == 0) {
      str = str.substring(0, i) + ' ' + str.substring(i)
    }
  }
  return str
}

me.removeSpaces = (x) => ('' + x).replace(/ /g, '')

me.reactPure = (render, name) => typeof render !== 'function'
  ? render
  : React.createClass({
      name: name || render.name,
      mixins: [PureRenderMixin],
      render: function() {
        return render(this.props)
      }
    })
