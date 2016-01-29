'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer, chainReducers} = require('@evoja/redux-reducers')
var {assign, access} = require('@evoja/ns-plain');
var {assignExisting, removeSpaces, getYearAgoDate} = require('../tools/tools.js');
var {act: uidAct} = require('./uid.js');
var calcStateNs = require('./calc.js').STATE_NS;

var act = {};
var STATE_NS = 'history';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

function getBaseCurrency(state) {
  var currencies = access(calcStateNs, state).currencies
  for (var currencyId in currencies) {
    if (!currencies[currencyId].apiId) {
      return currencyId
    }
  }
}

registerActionConst(['SET_HISTORY_CURRENCY',
  'SET_FORECAST_POINT'
]);

registerSimpleActions({
  setHistoryCurrency: [act.SET_HISTORY_CURRENCY, 'currencyId', 'data'],
  setForecastPoint: [act.SET_FORECAST_POINT, 'currencyId', 'pointNumber', 'price'],
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
]);

var globalReducer = createComplexEvReducer([
  ['', act.SET_HISTORY_CURRENCY, (globalState, {currencyId, data}) => {
      var state = globalState[STATE_NS]
      var prices = {...state.prices}
      var yearAgoDate = getYearAgoDate(state.todayDate)
      prices[currencyId] = data[0] && Number(data[0].value)

      var history = {...state.history}
      data.forEach(({date, value}) => {
        if (new Date(date) >= yearAgoDate) {
          history[date] = {...history[date]}
          history[date][currencyId] = Number(value)
        }
      })
      var baseCurrencyId = getBaseCurrency(globalState)
      Object.keys(history).forEach(date => {
        if (history[date][baseCurrencyId] !== 1) {
          history[date] = {...history[date]}
          history[date][baseCurrencyId] = 1
        }
      })

      var forecast = state.forecast.map(d => {
        d = {...d}
        d[currencyId] = prices[currencyId]
        if (d[baseCurrencyId] !== 1) {
          d[baseCurrencyId] = 1
        }
        return d
      })
      globalState = {...globalState}
      globalState[STATE_NS] = {...state, prices, history, forecast}
      return globalState
    }]
  ])

module.exports = {
  STATE_NS,
  act,
  reducer: chainReducers([wrapEvReducer(STATE_NS, localReducer), globalReducer])
};

