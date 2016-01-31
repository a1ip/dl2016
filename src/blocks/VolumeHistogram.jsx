'use strict'
var React = require('react')
var d3 = require('d3')
var classNames = require('classnames')
var ReactFauxDOM = require('react-faux-dom')
var {reactPure, roundlabelillo, axisillo} = require('../tools/tools.js')
var {TitleSmall, SubTitleSmall} = require('./dribs.jsx')


var VolumeHistogram = reactPure(function VolumeHistogram (props) {
  return (
    <div className='chd-volume-histogram'>
      <TheHistogram {...props}
        labels={['', 'тыс', 'млн', 'млрд', 'трлн', 'квадрлн', 'квинтлн', 'секстлн', 'квинтлн']}/>
    </div>
  )
})

var TheHistogram = reactPure(function TheChart(props) {
  var {
    labels,
    accounts: {accounts, accountIds, withDeposits},
    history: {prices, forecast},
    currencies: {currencies, curCurrencyId},
  } = props
  var chartGeom = getChartGeom()

  var el = ReactFauxDOM.createElement('svg')
  var graphArea = d3.select(el)
      .attr('width', chartGeom.fullWidth)
      .attr('height', chartGeom.fullHeight)
    .append('g')
      .attr('transform', 'translate(' + chartGeom.margin.left + ',' + chartGeom.margin.top + ')')

  var volumeArr = getVolumeArr(props)
  var scales = getScales(volumeArr, chartGeom, labels)
  appendAxes(graphArea, chartGeom, scales)
  appendDiagram(volumeArr, currencies, graphArea, scales.scaleX, scales.scaleY)
  return el.toReact()
})

function getAccountVolume(account, pointNumber, forecast, curCurrencyId) {
  var {amount, currencyId, percent} = account
  var prices = forecast[pointNumber]
  var rate = 1 + percent / 100

  if (!prices[currencyId] || !prices[curCurrencyId]) {
    return undefined
  }

  var value = amount * prices[currencyId] / prices[curCurrencyId]
  var deposit = Math.pow(rate, (pointNumber + 1) / 4) * value - value
  return {value, deposit}
}

/**
 * [getVolumeArr description]
 * @param  {[type]} props
 * * currencies: {curCurrencyId}
 * * history: {forecast}
 * * accounts:
 *     * withDeposits
 *     * accounts
 *     * accountIds
 *
 * @return {[type]}
 * Array of 
 *     * totalValue - num
 *     * totalDeposit - num
 *     * pointNumber
 *     * currencyVolumesArr - array of
 *         * value - num
 *         * deposit - num
 *         * currencyId
 *         * prevSum - num
 */
function getVolumeArr(props) {
  var {
    currencies: {curCurrencyId},
    history: {forecast},
    accounts: {withDeposits, accounts, accountIds}
  } = props
  var volumeArr = forecast.map((d, pointNumber) => {
    var totalValue = 0
    var totalDeposit = 0
    var currencyVolumes = {}
    accountIds.forEach(accountId => {
      var account = accounts[accountId]
      var currencyId = account.currencyId
      var currencyVolume = currencyVolumes[currencyId] || {
        value: 0,
        deposit: 0
      }
      currencyVolumes[currencyId] = currencyVolume
      var accountVolume = getAccountVolume(account, pointNumber, forecast, curCurrencyId)
      if (accountVolume) {
        var {value, deposit} = accountVolume
        currencyVolume.value += value
        currencyVolume.deposit += withDeposits ? deposit : 0
        totalValue += value
        totalDeposit += withDeposits ? deposit : 0
      }
    })
    var cumSum = 0;
    var currencyVolumesArr = Object.keys(currencyVolumes).map(currencyId => {
      var prevSum = cumSum;
      var volume = currencyVolumes[currencyId]
      cumSum += volume.value + volume.deposit
      return {...volume, currencyId, prevSum}
    })
    return {totalValue, totalDeposit, currencyVolumesArr, pointNumber}
  })

  return volumeArr
}




function getScales(volumeArr, chartGeom, labels) {
  var {width, height} = chartGeom
  var {max, chartScale, axisScale, axis}
    = axisillo(volumeArr, d => d.totalValue, labels, 1.5)

  var scaleX = d3.scale.linear()
    .range([0, width])
    .domain([0, volumeArr.length])

  var scaleY = chartScale.range([height, 0])
  var axisScale = axisScale.range([height, 0])
  return {max, scaleX, scaleY, axisScale}
}



function getChartGeom() {
  var margin = {top: 7, right: 23, bottom: 3, left: 29}
  var fullWidth = 272
  var fullHeight = 182
  var axisYLabelsTranslate = 6
  var width = fullWidth - margin.left - margin.right
  var height = fullHeight - margin.top - margin.bottom
  return {margin, width, height, fullWidth, fullHeight,
    axisYLabelsTranslate}
}



function appendAxes(graphArea, chartGeom, scales) {
  var {axisYLabelsTranslate} = chartGeom
  var {max, scaleY, axisScale} = scales
  var {label, backKoeff, koeff} = max

  var axisY = d3.svg.axis()
    .scale(axisScale)
    .ticks(4)
    .tickFormat(v => v)
    .orient('left')
    .innerTickSize(0)
    .outerTickSize(0)
  graphArea.append('g')
    .attr('class', 'chd-volume-histogram__axis')
    .call(axisY)
    .selectAll('text')
    .attr('transform', 'translate(0, ' + axisYLabelsTranslate + ')')
}

function appendDiagram(volumeArr, currencies, graphArea, scaleX, scaleY) {
  var heightScale = v => scaleY(0) - scaleY(v)
  console.log('aaa', volumeArr)
  var pointGroups = graphArea
    .selectAll('g.chd-volume-histogram__column')
      .data(volumeArr)
    .enter()
      .append('g')
      .attr('class', 'chd-volume-histogram__column')
      .attr('transform', point => 'translate('
        + scaleX(point.pointNumber) + ', 0)')

  var currencyGroups = pointGroups
    .selectAll('g')
      .data(point => point.currencyVolumesArr)
    .enter()
      .append('g')

  var rects = currencyGroups
      .selectAll('rect')
       .data(({currencyId, value, deposit, prevSum}) => [{
            currencyId,
            value,
            prevSum
          }, {
            currencyId,
            value: deposit,
            prevSum: prevSum + value,
            isDeposit: true
          }
        ])
      .enter()
        .append('rect')
        .attr('width', scaleX(1) - 1)
        .attr('height', r => heightScale(r.value))
        .style('fill', r => (console.log(r, r.currencyId), currencies[r.currencyId].color))
        .style('opacity', r => r.isDeposit ? .5 : 1)
        .attr('transform', r => 'translate(0, ' + scaleY(r.prevSum + r.value) + ')')
}









module.exports = VolumeHistogram

