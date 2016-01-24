'use strict'
var React = require('react')
var d3 = require('d3')
var classNames = require('classnames')
var ReactFauxDOM = require('react-faux-dom')
var {reactPure} = require('../tools.js')
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
  console.log('b', props)
  var {history, current, forecast, curCurrencyId, currencies} = props
  var data = history[curCurrencyId];

  if (!data) {
    return <div className='chd-history-chart'/>
  }
  console.log('history chart', data)

  var parseDate = d3.time.format('%d-%b-%y').parse

  var margin = {top: 0, right: 0, bottom: 20, left: 30}
  var width = 248 - margin.left - margin.right
  var height = 190 - margin.top - margin.bottom
  var x = d3.scale.linear()
    .range([0, width/2])
    .domain(d3.extent(data, d => d.date))
  var y = d3.scale.linear()
    .range([height, 0])
    .domain(d3.extent(data, d => d.value))

  // var xAxis = d3.svg.axis().scale(x).orient('bottom')
  // var yAxis = d3.svg.axis().scale(y).orient('left')
  var line = d3.svg.line()
    .x(d => x(d.date))
    .y(d => y(d.value))

  var el = ReactFauxDOM.createElement('svg')
  var svg = d3.select(el)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.left + margin.right)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

  svg.append('path')
    .datum(data)
    .attr('class', 'chd-history-chart__line')
    .attr('d', line)
    // .attr('fill', 'none')
    // .attr('stroke-width', '5')
    .attr('stroke', 'red')
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
  return (
    <div className='chd-history-chart'>
      <div className='chd-history-chart__title'>
        <TitleSmall>История и прогноз курсов</TitleSmall>
        <SubTitleSmall>Перетащите точку, чтобы изменить прогноз</SubTitleSmall>
      </div>
      <div className='chd-history-chart__chart'>{el.toReact()}</div>
      <div className='chd-history-chart__x'>
        год назад, сегодня, через год
      </div>
    </div>
  )
})


module.exports = HistoryChart
