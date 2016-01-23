'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {assignExisting} = require('../tools.js');
var {act: uidAct} = require('./uid.js');

var act = {};
var STATE_NS = 'calc';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['SET_CUR_CURRENCY', 'SET_WITH_DEPOSITS',
  'SET_USER_VALUE', 'DELETE_USER_VALUE', 'ADD_USER_VALUE',
  'SET_CURRENCIES'
]);

registerSimpleActions({
  setCurCurrency: [act.SET_CUR_CURRENCY, 'curCurrencyId'],
  setWithDeposits: [act.SET_WITH_DEPOSITS, 'withDeposits'],
  setUserValue: [act.SET_USER_VALUE, 'userValue'],
  deleteUserValue: [act.DELETE_USER_VALUE, 'userValueId'],
  simpleAddUserValue: [act.ADD_USER_VALUE, 'userValue'],
  setCurrencies: [act.SET_CURRENCIES, 'currencies'],
});

act.addUserValue = (userValue) => function(dispatch, getState) {
  return dispatch(uidAct.inc())
    .then(id => dispatch(act.simpleAddUserValue(assign('id', userValue, id))))
}


var defaultState = {
  withDeposits: false,
  curCurrencyId: undefined,
  currencies: {},
  currencyIds: [],
  userValueIds: [],
  userValues: {}
}

var reducer = createComplexEvReducer(defaultState, [
  ['', act.SET_CUR_CURRENCY, (state, {curCurrencyId}) => {
    console.log('set cur currency', curCurrencyId)
    return state.currencies[curCurrencyId]
      ? assign('curCurrencyId', state, curCurrencyId)
      : state;
  }],

  ['withDeposits', act.SET_WITH_DEPOSITS, (_, {withDeposits}) => {
        console.log('set with deposits', withDeposits)
        return withDeposits
    }],

  ['userValues.{userValue.id}', act.SET_USER_VALUE, (userValue, {userValue: newUserValue}) => {
    return assignExisting(userValue, newUserValue)
  }],

  ['', act.DELETE_USER_VALUE, (state, {userValueId}) => {
    if (!state.userValues[userValueId]) {
      return state
    }
    var userValueIds = state.userValueIds
    var newUserValueIds = [];
    for (var i = 0; i < userValueIds.length; ++i) {
      if (userValueIds[i] != userValueId) {
        newUserValueIds.push(userValueIds[i])
      }
    }
    state = assign('userValues.' + userValueId, state, undefined)
    return assign('userValueIds', state, newUserValueIds)
  }],

  ['', act.ADD_USER_VALUE, (state, {userValue}) => {
    var {id: userValueId} = userValue
    if (state.userValues[userValueId]) {
      return state;
    }
    state = assign('userValues.' + userValueId, state, userValue)
    return assign('userValueIds.' + state.userValueIds.length, state, userValueId)
  }],

  ['', act.SET_CURRENCIES, (state, {currencies}) => {
    var currencyIds = Object.keys(currencies)
    state = assign('currencies', state, currencies)
    state = assign('currencyIds', state, currencyIds)
    return assign('curCurrencyId', state, currencyIds[0])
  }]
]);

module.exports = {
  act,
  reducer: wrapEvReducer(STATE_NS, reducer)
};

