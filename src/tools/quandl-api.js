// rub EURRUB
// jpy EURJPY
// usd EURUSD

'use strict'
var d3 = require('d3')
var Promise = require('promise')
var {formatDate} = require('./tools.js')

var API_KEY = 'fGms5RYp2gUob_cxYDax'

module.exports = function(apiId, startDate, endDate) {
    var params = '.csv?api_key=' + API_KEY
        + '&start_date=' + formatDate(startDate)
        + '&end_date=' + formatDate(endDate)
        + '&order=desc'
    var url = 'https://www.quandl.com/api/v3/datasets/ECB/' + apiId + params
    return new Promise((resolve, reject) => 
        d3.csv(url, 
            ({Date, Value}) => ({date: Date, value: 1 / Number(Value)}),
            result => result ? resolve(result) : reject()))
}
