'use strict'
var {Page} = require('./blocks.jsx')
var React = require('react')
var ReactDom = require('react-dom')


var state = {
  withDeposits: true,
  isAdding: false,
  curCurrencyId: 'rub',
  currencies: {
    rub: {
      id: 'rub',
      sign: '₽',
      displayName: 'рубль',
      price: 1
    },
    usd: {
      id: 'usd',
      sign: '$',
      displayName: 'доллар США',
      price: 79.95
    }
  },
  currencyIds: ['rub', 'usd'],
  userValueIds: ['0', '1'],
  userValues: {
    '0': {
      id: '0',
      currencyId: 'rub',
      amount: 100000,
      rate: 10
    },
    '1': {
      id: '1',
      currencyId: 'usd',
      amount: 1000,
      rate: 2
    }
  }
}

ReactDom.render(React.createElement(Page, state),
    document.getElementById('datalaboratory-ru-2016-01-app'))













