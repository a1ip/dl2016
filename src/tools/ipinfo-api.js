'use strict'
var d3 = require('d3')
var Promise = require('promise')

module.exports = function() {
  var url = 'http://ipinfo.io/json'
  return new Promise((resolve, reject) => 
    d3.json(url, result => result ? resolve(result) : reject()))
}
