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
        год назад, сегодня, через год
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
  // var {
  //   draggingCurrency,
  //   currencies: {currencies, curCurrencyId},
  //   history: {history, forecast, prices, todayDate},
  //   accounts
  // }
  var {startDrag, stopDrag, setForecastPoint} = props.callbacks

  var chartGeom = getChartGeom()

  var el = ReactFauxDOM.createElement('svg')
  var graphArea = d3.select(el)
      .attr('width', chartGeom.fullWidth)
      .attr('height', chartGeom.fullHeight)
    .append('g')
      .attr('transform', 'translate(' + chartGeom.margin.left + ',' + chartGeom.margin.top + ')')

  // var xAxis = d3.svg.axis().scale(x).orient('bottom')
  // var yAxis = d3.svg.axis().scale(y).orient('left')
  var {histY} = appendHistoryLine(graphArea, props, chartGeom)
  var {onMove} = appendMovementRect(graphArea, props, chartGeom, histY)
  appendForecastControls(graphArea, props, chartGeom, histY, onMove)


    // .append('g')
    //   .attr('transform', 'rotate(-90)')
    //   .attr('y', 6)
    //   .attr('dy', '.71em')
    //   .style('text-anchor', 'end')
    //   .text('Price ($)')

  // // Change stuff using actual DOM functions.
  // // Even perform CSS selections.
  // el.style.setProperty('color', 'red')
  // el.setAttribute('class', 'box')
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
  var margin = {top: 5, right: 5, bottom: 20, left: 30}
  var fullWidth = 253
  var fullHeight = 195
  var width = fullWidth - margin.left - margin.right
  var height = fullHeight - margin.top - margin.bottom
  return {margin, width, height, fullWidth, fullHeight}
}


function appendHistoryLine(graphArea, props, chartGeom) {
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
  var histY = d3.scale.linear()
    .range([height * .9, height * .1])
    .domain(getExtentOfAll(histarrs, d => d.value))

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

function appendForecastControls(graphArea, props, chartGeom, histY, onMove) {
  var {
    currencies: {currencies, curCurrencyId},
    history: {history, forecast, todayDate},
    accounts
  } = props
  var {width, height} = chartGeom
  var {startDrag, stopDrag} = props.callbacks

  var forecastObj = {}
  forecast.forEach((d, i) => forecastObj[i] = d)
  var forecarrs = getHistarrs(forecastObj, currencies, curCurrencyId, accounts, x => Number(x))

  var forecX = d3.scale.linear()
    .range([width * 5 / 8, width])
    .domain([0, forecast.length - 1])
  var forecY = histY

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




module.exports = HistoryChart
