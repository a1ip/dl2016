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

me.formatDate = function formatDate(date) {
    return date.toISOString().substring(0, 10)
}

me.getYearAgoDate = function getYearAgoDate(todayDate) {
  return new Date(todayDate.getTime() - 365 * 24 * 3600 * 1000);
}

var DAYS = [90, 181, 273, 365]
var ONE_DAY_MS = 24 * 3600 * 1000;
me.getForecastDate = function getForecastDate(todayDate, pointNumber) {
  return new Date(new Date(todayDate).getTime() + DAYS[pointNumber] * ONE_DAY_MS)
}


