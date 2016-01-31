'use strict'
var React = require('react')
var d3 = require('d3')
var PureRenderMixin = require('react-addons-pure-render-mixin')
var me = module.exports

me.mapsep = (ids, values, iter) =>
  ids.map(id => iter(values[id], id))

me.formatNumber = (num) => {
  var str = isNaN(Number(num)) ? '' : ('' + num);
  for(var k = 1, i = str.length - 1; i > 0; --i, ++k) {
    if (k % 3 == 0) {
      str = str.substring(0, i) + ' ' + str.substring(i)
    }
  }
  return str
}

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

me.assert = (condition, message) => {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message)
        }
        throw message
    }
}

me.roundillo = (value) => {
  var koeff = 1;
  var num = value;
  while (Math.ceil(num) >= 10) {
    koeff *= 10
    num /= 10
  }
  return {
    koeff,
    value: Math.ceil(value / koeff)
  }
}

me.labelillo = (labels, koeff) => {
  var i = 0;
  while (koeff / 1000 >= 1) {
    koeff /= 1000
    ++i
  }
  return {label: labels[i], backKoeff: koeff}
}

me.roundlabelillo = (labels, value) => {
  var {koeff, value} = me.roundillo(value)
  var {label, backKoeff} = me.labelillo(labels, koeff)
  return {koeff, value, label, backKoeff}
}

me.axisillo = (data, getter, labels, minProportion) => {
  var maximum = d3.max(data, getter)
  var minimum = d3.min(data, getter)
  var max = me.roundlabelillo(labels, Math.max(maximum, minimum * (minProportion || 0)))
  var {koeff, value, backKoeff} = max
  var chartScale = d3.scale.linear()
    .domain([0, value * koeff])
  var axisScale = d3.scale.linear()
    .domain([0, value * backKoeff])
  return {max, chartScale, axisScale}
}
