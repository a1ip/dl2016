'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer, chainReducers} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {getYearAgoDate} = require('../tools/tools.js')

var {getters: {getCurrencies},
   act: currenciesAct} = require('./currencies.js')

var act = {}
var STATE_NS = 'history'
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act)
var registerSimpleActions = getSimpleActionsRegistrator(act);

function getBaseCurrency(state) {
  var currencies = getCurrencies(state)
  for (var currencyId in currencies) {
    if (!currencies[currencyId].apiId) {
      return currencyId
    }
  }
}

registerActionConst(['SET_HISTORY_CURRENCY', 'SET_FORECAST_POINT',
  'SET_TODAY_DATE',
]);

registerSimpleActions({
  setHistoryCurrency: [act.SET_HISTORY_CURRENCY, 'currencyId', 'data'],
  setForecastPoint: [act.SET_FORECAST_POINT, 'currencyId', 'pointNumber', 'price'],
  setTodayDate: [act.SET_TODAY_DATE, 'todayDate'],
});

var defaultState = {
  todayDate: new Date(),
  history: {
    // '2016-01-01': {
    //     usd: 0.8,
    //     jpy: 1.2,
    //     rub: 0.03
    //   },
  },
  prices: {
    // usd: 0.9,
    // rub: 0.02,
    // jpy: 12
  },
  forecast: [{
      // usd: 0.5,
      // jpy: 1.2,
      // rub: 0.025,
      // eur: 1,
    }, {}, {}, {}
  ]
}

var localReducer = createComplexEvReducer(defaultState, [
  ['forecast.{pointNumber}.{currencyId}', act.SET_FORECAST_POINT,
    (_, {price}) => price],
  ['todayDate', act.SET_TODAY_DATE, (_, {todayDate}) => todayDate],
]);

var globalReducer = createComplexEvReducer([
  ['', currenciesAct.SET_CURRENCIES, (globalState, _) => {
      var baseCurrencyId = getBaseCurrency(globalState)
      var prices = {}
      prices[baseCurrencyId] = 1
      return assign(STATE_NS + '.prices', globalState, prices)
    }],
  ['', act.SET_HISTORY_CURRENCY, (globalState, {currencyId, data}) => {
      if (!data || data.length == 0) {
        return globalState
      }

      var state = globalState[STATE_NS]
      var yearAgoDate = getYearAgoDate(state.todayDate)
      var baseCurrencyId = getBaseCurrency(globalState)

      var prices = {...state.prices}
      prices[currencyId] = data[0] && Number(data[0].value)

      var history = {...state.history}
      data.forEach(({date, value}) => {
        if (new Date(date) >= yearAgoDate) {
          history[date] = {...history[date]}
          history[date][currencyId] = Number(value)
          history[date][baseCurrencyId] = 1
        }
      })

      var forecast = state.forecast.map(d => {
        d = {...d}
        if (isNaN(d[currencyId])) {
          d[currencyId] = prices[currencyId]
        }
        if (isNaN(d[baseCurrencyId])) {
          d[baseCurrencyId] = 1
        }
        return d
      })

      globalState = {...globalState}
      globalState[STATE_NS] = {...state, prices, history, forecast}
      return globalState
    }],
  ])

module.exports = {
  act,
  reducer: chainReducers([wrapEvReducer(STATE_NS, localReducer), globalReducer]),
  getters: {
    getPrices: state => state[STATE_NS].prices,
    getTodayDate: state => state[STATE_NS].todayDate,
  }
};

