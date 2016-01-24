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
  history: {
    usd: [{
      date: 1,
      value: 10,
    }, {
      date: 2,
      value: 20,
    }, {
      date: 3,
      value: 30,
    }, {
      date: 4,
      value: 43,
    }, {
      date: 5,
      value: 43,
    }, {
      date: 6,
      value: 42,
    }, {
      date: 7,
      value: 32,
    }, {
      date: 8,
      value: 43,
    }]
  },
  current: {
    rub: 1,
    usd: 80,
  },
  forecast: {
    rub: [1, 1, 1, 1],
    usd: [70, 80, 100, 80],
  }
}

var reducer = createComplexEvReducer(defaultState, [
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

