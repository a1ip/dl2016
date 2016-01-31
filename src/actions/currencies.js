'use strict'
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')

var ipinfo = require('../tools/ipinfo-api.js')
var countries = require('../countries.js')

function getCurrencies(state) {
  return state[STATE_NS].currencies
}

function getBaseCurrency(state) {
  var currencies = getCurrencies(state)
  for (var currencyId in currencies) {
    if (!currencies[currencyId].apiId) {
      return currencyId
    }
  }
}

function getCurCurrencyId(state) {
  return state[STATE_NS].curCurrencyId
}


var act = {};
var STATE_NS = 'currencies';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['SET_CURRENCIES', 'SET_CUR_CURRENCY']);
registerSimpleActions({
  simpleSetCurrencies: [act.SET_CURRENCIES, 'currenciesArr'],
  setCurCurrency: [act.SET_CUR_CURRENCY, 'curCurrencyId'],
})

var getCurrencyByCountry = (country) => {
  for (var currencyId in countries) {
    if (countries[currencyId].indexOf(country.toUpperCase()) >= 0) {
      return currencyId
    }
  }
  return undefined
}

act.setCurrencies = (currenciesArr) => (dispatch, getState) => {
  dispatch(act.simpleSetCurrencies(currenciesArr))
  return ipinfo()
    .then(function success(result) {
        if (getCurCurrencyId(getState())) {
          return
        }
        if (result && result.country) {
          var currencyId = getCurrencyByCountry(result.country)
          if (getCurrencies(getState())[currencyId]) {
            dispatch(act.setCurCurrency(currencyId))
            return;
          }
        }
        dispatch(act.setCurCurrency(getBaseCurrency(getState())))
      }, function error() {
        if (getCurrencyIds(getState())) {
          return
        }
        dispatch(act.setCurCurrency(getBaseCurrency(getState())))
      })
}

var defaultState = {
  currencies: {
      // eur: {
      //   id: 'eur',
      //   sign: '€',
      //   displayName: 'евро',
      //   color: '#2b2',
      //   apiId: null
      // }
  },
  currencyIds: [
    // 'eur', 'rub', 'usd'
  ],
  curCurrencyId: undefined
}

var reducer = createComplexEvReducer(defaultState, [
  ['', act.SET_CUR_CURRENCY, (state, {curCurrencyId}) => {
    return state.currencies[curCurrencyId]
      ? {...state, curCurrencyId}
      : state
  }],

  ['', act.SET_CURRENCIES, (state, {currenciesArr}) => {
    var currencies = {}
    var currencyIds = []
    currenciesArr.forEach(currency => {
      currencies[currency.id] = currency
      currencyIds.push(currency.id)
    })
    return {
      ...state,
      currencies,
      currencyIds,
      curCurrencyId: undefined
    }
  }],
]);

module.exports = {
  act,
  reducer: wrapEvReducer(STATE_NS, reducer),
  getters: {
    getCurrencies: getCurrencies,
    getCurrencyIds: state => state[STATE_NS].currencyIds,
    getCurCurrencyId: getCurCurrencyId,
    getBaseCurrency: getBaseCurrency,
  }
};

