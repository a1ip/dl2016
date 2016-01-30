'use strict'
var React = require('react')
var d3 = require('d3')
var classNames = require('classnames')
var ReactFauxDOM = require('react-faux-dom')
var {reactPure, getYearAgoDate, getForecastDate} = require('../tools/tools.js')
var {TitleSmall, SubTitleSmall} = require('./dribs.jsx')

var HistoryChart = reactPure(function HistoryChart (props) {
  return (
    <div className='chd-history-chart'>
      <div className='chd-history-chart__title'>
        <TitleSmall>История и прогноз курсов</TitleSmall>
        <SubTitleSmall>Перетащите точку, чтобы изменить прогноз</SubTitleSmall>
      </div>
      <div className='chd-history-chart__chart'>
        <TheChart {...props}/>
      </div>
      <div className='chd-history-chart__x'>
        <div className='chd-history-chart__x-left'>год назад</div>
        <div className='chd-history-chart__x-center'>сегодня</div>
        <div className='chd-history-chart__x-right'>через год</div>
      </div>
    </div>
  )
})



/**
 * * currencies
 *     * curCurrencyId
 *     * currencies - (id -> currency) map
 *     * currencyIds - array of ids
 * * history
 *     * todayDate
 *     * history
 *     * prices
 *     * forecast
 * * accounts - (id -> account) map
 * * draggingCurrency: currencyId,
 *
 * * callbacks
 *     * startDrag(currencyId, pointNumber)
 *     * stopDrag()
 *     * setForecastPoint(currencyId, pointNumber, price)
 */
var TheChart = reactPure(function TheChart(props) {
  var {draggingCurrency, currencies, history, accounts} = props
  var {startDrag, stopDrag, setForecastPoint} = props.callbacks

  var chartGeom = getChartGeom()

  var el = ReactFauxDOM.createElement('svg')
  var graphArea = d3.select(el)
      .attr('width', chartGeom.fullWidth)
      .attr('height', chartGeom.fullHeight)
    .append('g')
      .attr('transform', 'translate(' + chartGeom.margin.left + ',' + chartGeom.margin.top + ')')

  var {histarrs, histX, histY} = getScalesAndHistarrs(props, chartGeom)
  if (histY) {
    appendAxes(graphArea, chartGeom, histY)
    appendHistoryLine(graphArea, props, histarrs, histX, histY)
    var {forecarrs, forecX, forecY} = getScalesAndForecarrs(props, chartGeom, histY)
    if (draggingCurrency) {
      appendForecastLabels(graphArea, props, forecarrs, chartGeom, forecX, forecY)
      var {onMove} = appendMovementRect(graphArea, props, chartGeom, histY)
    }
    appendForecastControls(graphArea, props, forecarrs, forecX, forecY, onMove)
  }
  return el.toReact()
})





/**
 * @param  {function} op) (somePrice, curPrice) => koeff
 * @return {function}     (currencies, curCurrencyId, currencyId) => (value) => number
 */
var koeffy = (op) => (prices, curCurrencyId) => {
  var koeff = op(prices[curCurrencyId] || 1)
  return (value) => isNaN(value * koeff) ? 0 : value * koeff
}
var absToCur = koeffy(curPrice => 1 / curPrice)
var curToAbs = koeffy(curPrice => curPrice)


function isCurrencyInteresting(currencyId, accounts) {
  for(var k in accounts) {
    if (accounts[k].currencyId == currencyId && !!accounts[k].amount) {
      return true
    }
  }
  return false
}

var isGoodForChart = (currencies, curCurrencyId, currencyId) => {
  return currencyId != curCurrencyId && currencies[currencyId]
}

function dateToNum(date) {
  return new Date(date).getTime()
}

function getHistarrs(history, currencies, curCurrencyId, accounts, keyToNum) {
  return Object.keys(currencies)
    .map(currencyId => isGoodForChart(currencies, curCurrencyId, currencyId)
      && isCurrencyInteresting(currencyId, accounts)
      && {
        currencyId,
        data: Object.keys(history).map(function(date){
          var value = history[date] && history[date][currencyId]
          return value && {
            date: keyToNum(date),
            value: absToCur(history[date], curCurrencyId)(value)
          }
        }).filter(d => !!d).sort((a, b) => (a.date - b.date))
      })
    .filter(d => !!d)
    .filter(d => d.data.some(x => x.value))
}



function getExtentOfAll(histarrs, getter) {
  var min, max;
  histarrs.forEach(function({data}) {
    var ext = d3.extent(data, getter)
    min = !isNaN(min) && Math.min(min, ext[0]) || ext[0]
    max = !isNaN(max) && Math.max(max, ext[1]) || ext[1]
  })
  return [min, max]
}

function formatDate(date) {
  return date.toISOString().substring(0, 10)
}





function getChartGeom() {
  var margin = {top: 7, right: 23, bottom: 3, left: 29}
  var fullWidth = 272
  var fullHeight = 182
  var axisYLabelsTranslate = 6
  var forecastLabelsYTranslate = -8
  var width = fullWidth - margin.left - margin.right
  var height = fullHeight - margin.top - margin.bottom
  return {margin, width, height, fullWidth, fullHeight,
    axisYLabelsTranslate, forecastLabelsYTranslate}
}

function getScalesAndHistarrs(props, chartGeom) {
  var {
    currencies: {currencies, curCurrencyId},
    history: {history, forecast, todayDate},
    accounts
  } = props
  var {width, height} = chartGeom

  history = {...history}
  forecast.forEach((d, i) => {
    history[formatDate(getForecastDate(todayDate, i))] = d
  })
  var histarrs = getHistarrs(history, currencies, curCurrencyId, accounts, dateToNum)

  var histX = d3.scale.linear()
    .range([0, width])
    .domain([
      dateToNum(getYearAgoDate(todayDate)),
      dateToNum(getForecastDate(todayDate, forecast.length - 1))
    ])
  var extentY = getExtentOfAll(histarrs, d => d.value);
  var diffExtentY = (extentY[1] - extentY[0]) * .1
  if (isNaN(diffExtentY)) {
    return {}
  }
  var minY = Math.max(0, extentY[0] - diffExtentY)
  var maxY = extentY[1] + diffExtentY
  var histY = d3.scale.linear()
    .range([height, 0])
    .domain([minY, maxY])

  return {histarrs, histX, histY}
}

function getScalesAndForecarrs(props, chartGeom, histY) {
  var {
    currencies: {currencies, curCurrencyId},
    history: {history, forecast, todayDate},
    accounts
  } = props
  var {width, height} = chartGeom

  var forecastObj = {}
  forecast.forEach((d, i) => forecastObj[i] = d)
  var forecarrs = getHistarrs(forecastObj, currencies, curCurrencyId, accounts, x => Number(x))

  var forecX = d3.scale.linear()
    .range([width * 5 / 8, width])
    .domain([0, forecast.length - 1])
  var forecY = histY

  return {forecX, forecY, forecarrs}
}


function appendHistoryLine(graphArea, props, histarrs, histX, histY) {
  var {
    currencies: {currencies},
  } = props

  var line = d3.svg.line()
    .x(d => histX(d.date))
    .y(d => histY(d.value))

  histarrs.forEach(function({currencyId, data}) {
    graphArea
      .append('path')
      .datum(data)
      .attr('class', 'chd-history-chart__line')
      .attr('d', line)
      .attr('stroke', currencies[currencyId].color)
  })

  return {histarrs, histX, histY, line}
}

function appendMovementRect(graphArea, props, chartGeom, histY) {
  var {
    draggingCurrency,
    history: {forecast},
    currencies: {curCurrencyId},
    callbacks: {setForecastPoint}
  } = props
  var {width, height} = chartGeom

  var onMove = () => {
    if (!draggingCurrency) {
      return
    }
    d3.event.preventDefault()
    var {currencyId, pointNumber} = draggingCurrency
    var curValue = histY.invert(d3.event.offsetY - chartGeom.margin.top)
    var absValue = curToAbs(forecast[pointNumber], curCurrencyId)(curValue)
    setForecastPoint(currencyId, pointNumber, absValue)
  }

  var movementRect = graphArea.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .classed({
        'chd-history-chart__chart-graph-area': true,
        'chd-history-chart__chart-graph-area_dragging': !!draggingCurrency
      })
  movementRect.on('mousemove', onMove)

  return {onMove}
}

function appendForecastControls(graphArea, props, forecarrs, forecX, forecY, onMove) {
  var {
    currencies: {currencies},
  } = props
  var {startDrag, stopDrag} = props.callbacks

  var CIRCLE_CLASS = 'chd-history-chart__forecast-circle'
  var getCircleClass = (currencyId) => CIRCLE_CLASS + '_' + currencyId

  forecarrs.forEach(function({currencyId, data}) {
    var color = currencies[currencyId].color
    var classes = {}
    classes[CIRCLE_CLASS] = true
    classes[getCircleClass(currencyId)] = true
    graphArea
      .selectAll('circle.' + getCircleClass(currencyId))
        .data(data)
      .enter()
        .append("circle")
        .classed(classes)
        .attr('cx', d => forecX(d.date))
        .attr('cy', d => forecY(d.value))
        .style('fill', color)
        .on('mousedown', (d) => {
            d3.event.preventDefault()

            var oldonmouseup = document.onmouseup
            document.onmouseup = function() {
              stopDrag()
              document.onmouseup = oldonmouseup
            }

            startDrag(currencyId, d.date)
        })
        .on('mouseup', stopDrag)
        .on('mousemove', onMove)
  })
}

function axesRound(v) {
  var k = v >= 10 ? 1
        : v >= 1 ? 10
        : 100
  return Math.round(v * k) / k
}

function appendAxes(graphArea, chartGeom, histY) {
  var {width, height, axisYLabelsTranslate} = chartGeom

  var scaleAxisX = d3.scale.linear()
    .range([0, width])
    .domain([0, 4])
  var axisX = d3.svg.axis()
    .scale(scaleAxisX)
    .orient('bottom')
    .ticks(4)
    .outerTickSize(0)
    .innerTickSize(-height)
  graphArea.append('g')
    .attr('class', 'chd-history-chart__axis chd-history-chart__axis_x')
    .attr('transform', 'translate(0, ' + height + ')')
    .call(axisX)


  var scaleAxisY = d3.scale.linear()
    .range([0, height])
    .domain([0, 5])
  var axisY = d3.svg.axis()
    .scale(scaleAxisY)
    .orient('left')
    .tickValues([0, 1, 2, 3, 4, null])
    .tickFormat(v => v !== null && '' + axesRound(histY.invert(height / 4 * v)))
    .innerTickSize(-width)
    .outerTickSize(0)
  graphArea.append('g')
    .attr('class', 'chd-history-chart__axis')
    .call(axisY)
    .selectAll('text')
    .attr('transform', 'translate(0, ' + axisYLabelsTranslate + ')')
}

function appendForecastLabels(graphArea, props, forecarrs, chartGeom, forecX, forecY) {
  var {
    draggingCurrency: {currencyId, pointNumber},
  } = props
  var {forecastLabelsYTranslate} = chartGeom
  var forecarr = forecarrs.filter(forecarr => forecarr.currencyId == currencyId)[0]

  var className = 'chd-history-chart__forecast-label'
  var getText = d => d.date % 2 == 0 && axesRound(d.value)
  graphArea.selectAll('text.' + className)
        .data(forecarr.data)
      .enter()
        .append('text')
        .attr('class', className)
        .attr('transform', d => getText(d) &&
          'translate('
            + (forecX(d.date) - getTextWidth(getText(d))/2) + ', '
            + (forecY(d.value) + forecastLabelsYTranslate) + ')')
        .text(getText)
}

function getTextWidth(text, className) {
  var div = document.createElement('div')
  var elem = d3.select(div)
    .attr('class', className)
    .attr('style', 'display:block;position:absolute;visibility:hidden;')
    .text(text)
  document.body.appendChild(div)
  var width = div.offsetWidth
  div.remove()
  return width
}


module.exports = HistoryChart
