'use strict'
var React = require('react')
var d3 = require('d3')
var classNames = require('classnames')
var ReactFauxDOM = require('react-faux-dom')
var {reactPure, getYearAgoDate, getForecastDate} = require('../tools/tools.js')
var {TitleSmall, SubTitleSmall} = require('./dribs.jsx')


/**
 * 
 * history: {
 *   usd: [10, 20, 30, 43, 43, 42, 32, 43, 32, 31, 11, 31, 33],
 *   rub: [1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1,  1],
 * },
 * current: {
 *   rub: 1,
 *   usd: 80,
 * },
 * forecast: {
 *   rub: [1, 1, 1, 1],
 *   usd: [70, 80, 100, 80],
 * },
 * curCurrencyId,
 * currencies
 */
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
 * @param  {function} op) (somePrice, curPrice) => koeff
 * @return {function}     (currencies, curCurrencyId, currencyId) => (value) => number
 */
var koeffy = (op) => (prices, curCurrencyId) => {
  var koeff = op(prices[curCurrencyId] || 1)
  return (value) => isNaN(value * koeff) ? 0 : value * koeff
}
var absToCur = koeffy(curPrice => 1 / curPrice)
var curToAbs = koeffy(curPrice => curPrice)

var isGoodForChart = (currencies, curCurrencyId, currencyId) => {
  return currencyId != curCurrencyId && currencies[currencyId]
}

function dateToNum(date) {
  return new Date(date).getTime()
}


function getHistarrs(history, currencies, curCurrencyId, keyToNum) {
  return Object.keys(currencies)
    .map(currencyId => isGoodForChart(currencies, curCurrencyId, currencyId)
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

function isCurrencyInteresting(currencyId, userValues) {
  for(var k in userValues) {
    if (userValues[k].currencyId == currencyId && !!userValues[k].amount) {
      return true
    }
  }
  return false
}


var TheChart = reactPure(function TheChart(props) {
  var {history, forecast, todayDate, 
    curCurrencyId, currencies, draggingCurrency, userValues} = props
  var {startDrag, stopDrag, setForecastPoint} = props.funs
  // if (!data) {
  //   return <div className='chd-history-chart'/>
  // }

  var margin = {top: 5, right: 5, bottom: 20, left: 30}
  var width = 253 - margin.left - margin.right
  var height = 195 - margin.top - margin.bottom

  var el = ReactFauxDOM.createElement('svg')
  var graphArea = d3.select(el)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  var movementRect = graphArea.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height)
      .classed({
        'chd-history-chart__chart-graph-area': true,
        'chd-history-chart__chart-graph-area_dragging': !!draggingCurrency
      })




  // var xAxis = d3.svg.axis().scale(x).orient('bottom')
  // var yAxis = d3.svg.axis().scale(y).orient('left')
  history = {...history}
  forecast.forEach((d, i) => {
    history[formatDate(getForecastDate(todayDate, i))] = d
  })
  var histarrs = getHistarrs(history, currencies, curCurrencyId, dateToNum)
    .filter(({currencyId}) => isCurrencyInteresting(currencyId, userValues))

  var histX = d3.scale.linear()
    .range([0, width])
    .domain([getYearAgoDate(todayDate), getForecastDate(todayDate, forecast.length - 1)])
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

  var forecastObj = {}
  forecast.forEach((d, i) => forecastObj[i] = d)
  var forecarrs = getHistarrs(forecastObj, currencies, curCurrencyId, x => Number(x))
    .filter(({currencyId}) => isCurrencyInteresting(currencyId, userValues))
  var forecX = d3.scale.linear()
    .range([width * 5 / 8, width])
    .domain([0, forecast.length - 1])
  var forecY = histY

  var CIRCLE_CLASS = 'chd-history-chart__forecast-circle'
  var getCircleClass = (currencyId) => CIRCLE_CLASS + '_' + currencyId

  var onMove = () => {
    if (!draggingCurrency) {
      return
    }
    d3.event.preventDefault()
    var {currencyId, pointNumber} = draggingCurrency
    var curValue = histY.invert(d3.event.offsetY - margin.top)
    var absValue = curToAbs(forecast[pointNumber], curCurrencyId)(curValue)
    setForecastPoint(currencyId, pointNumber, absValue)
  }

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
  movementRect.on('mousemove', onMove)

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


module.exports = HistoryChart
