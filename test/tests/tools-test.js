'use strict'
var tl = require('../test-lib.js')
var {roundillo, labelillo, roundlabelillo, axisillo} = tl.require('tools/tools.js')

exports.test_roundillo = function(test) {
  var t = (num, expectedNum, expectedKoeff) =>
    test.deepEqual(roundillo(num), {koeff: expectedKoeff, value: expectedNum})
  t(0, 0, 1)
  t(1, 1, 1)
  t(2, 2, 1)
  t(8, 8, 1)
  t(10, 1, 10)
  t(11, 2, 10)
  t(15, 2, 10)
  t(1000, 1, 1000)
  t(2000, 2, 1000)
  t(2350432, 3, 1000000)
  test.done()
}


var labels = ['', 'thou', 'mill', 'bill', 'trill', 'kvadrill'];

exports.test_labelillo = function(test) {
  var t = (koeff, label, backKoeff) =>
    test.deepEqual(labelillo(labels, koeff), {label, backKoeff})

  t(0, '', 0)
  t(1, '', 1)
  t(10, '', 10)
  t(100, '', 100)
  t(1000, 'thou', 1)
  t(100000, 'thou', 100)
  t(1000000, 'mill', 1)
  t(100000000, 'mill', 100)
  t(1000000000, 'bill', 1)
  t(100000000000, 'bill', 100)
  t(1000000000000, 'trill', 1)
  test.done()
}

exports.test_roundlabelillo = function(test) {
  var t = (num, expectedNum, label, koeff, backKoeff) =>
    test.deepEqual(roundlabelillo(labels, num),
      {value: expectedNum, label, koeff, backKoeff})
  t(0, 0,  '', 1, 1)
  t(1, 1,  '', 1, 1)
  t(10, 1, '', 10, 10)
  t(15, 2, '', 10, 10)
  t(1000, 1, 'thou', 1000, 1)
  t(9900, 1, 'thou', 10000, 10)
  t(10000, 1, 'thou', 10000, 10)
  t(23000, 3, 'thou', 10000, 10)
  t(2350432, 3, 'mill', 1000000, 1)
  t(23504320, 3, 'mill', 10000000, 10)
  test.done()
}

exports.test_axisillo = function(test) {
  var {max, chartScale, axisScale, axis} = axisillo([1, 3, 4], x => x, labels)
  chartScale = chartScale.range([0, 100])
  axisScale = axisScale.range([0, 100])
  test.deepEqual(max, {value: 4, koeff: 1, backKoeff: 1, label: ''})
  test.equal(chartScale(0), 0)
  test.equal(chartScale(4), 100)
  test.equal(axisScale(0), 0)
  test.equal(axisScale(4), 100)


  var {max, chartScale, axisScale, axis} = axisillo([31000, 33000, 44000], x => x, labels)
  chartScale = chartScale.range([0, 100])
  axisScale = axisScale.range([0, 100])
  test.deepEqual(max, {value: 1, koeff: 100000, backKoeff: 100, label: 'thou'})
  test.equal(chartScale(0), 0)
  test.equal(chartScale(40000), 40)
  test.equal(axisScale(0), 0)
  test.equal(axisScale(100), 100)


  var {max, chartScale, axisScale, axis} = axisillo([200000, 201000, 202000], x => x, labels)
  chartScale = chartScale.range([0, 100])
  axisScale = axisScale.range([0, 100])
  test.deepEqual(max, {value: 6, koeff: 100000, backKoeff: 100, label: 'thou'})
  test.equal(chartScale(0), 0)
  test.equal(chartScale(300000), 50)
  test.equal(axisScale(0), 0)
  test.equal(axisScale(60), 10)


  test.done()
}