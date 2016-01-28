'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {assignExisting, removeSpaces} = require('../tools.js');
var {act: uidAct} = require('./uid.js');

var act = {};
var STATE_NS = 'history';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['SET_HISTORY_ALL', 'SET_HISTORY_CURRENCY',
  'SET_CURRENT_ALL', 'SET_CURRENT_CURRENCY',
  'SET_FORECAST_POINT'
]);

registerSimpleActions({
  setHistoryAll: [act.SET_HISTORY_ALL, 'history'],
  setHistoryCurrency: [act.SET_HISTORY_CURRENCY, 'currencyId', 'data'],
  setCurrentAll: [act.SET_CURRENT_ALL, 'prices'],
  setCurrentCurrency: [act.SET_CURRENT_CURRENCY, 'currencyId', 'price'],
  setForecastPoint: [act.SET_FORECAST_POINT, 'currencyId', 'pointNumber', 'price'],
});

var defaultState = {
  history: [{
      date: 1,
      usd: 10,
      eur: 15,
      rub: 1
    }, {
      date: 2,
      usd: 20,
      eur: 30,
      rub: 1
    }, {
      date: 3,
      usd: 30,
      eur: 45,
      rub: 1
    }, {
      date: 4,
      usd: 40,
      eur: 60,
      rub: 1
    }, {
      date: 5,
      usd: 50,
      eur: 75,
      rub: 1
    }, {
      date: 6,
      usd: 60,
      eur: 90,
      rub: 1
    }, {
      date: 7,
      usd: 70,
      eur: 105,
      rub: 1
    }, {
      date: 8,
      usd: 80,
      eur: 120,
      rub: 1
    }
  ],
  forecast: [{
      date: 0,
      rub: 1,
      usd: 70,
      eur: 10
    }, {
      date: 1,
      rub: 1,
      usd: 80,
      eur: 20
    }, {
      date: 2,
      rub: 1,
      usd: 100,
      eur: 30
    }, {
      date: 3,
      rub: 1,
      usd: 80,
      eur: 40
    }
  ]
}

var reducer = createComplexEvReducer(defaultState, [
  ['forecast.{pointNumber}.{currencyId}', act.SET_FORECAST_POINT,
    (_, {price}) => price],
  // ['', act.OPEN_ADD_USER_VALUE, () => {
  //   return {...defaultState, isAddingUserValue: true}
  // }],

  // ['userValueColor', act.SET_USER_VALUE_COLOR, (_, {userValueColor}) => userValueColor],
  // ['userValueCurrencyId', act.SET_USER_VALUE_CURRENCY_ID, (_, {currencyId}) => currencyId],

  // ['', act.CLOSE_POPUPS, () => defaultState],
]);

module.exports = {
  act,
  reducer: wrapEvReducer(STATE_NS, reducer)
};

