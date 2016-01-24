'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer, chainReducers} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {assignExisting} = require('../tools.js');
var {act: uidAct} = require('./uid.js');

var act = {};
var STATE_NS = 'ui';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['OPEN_ADD_USER_VALUE', 'OPEN_EDIT_USER_VALUE',
  'SET_USER_VALUE_COLOR', 'SET_USER_VALUE_CURRENCY_ID',
  'CLOSE_POPUPS'
]);

registerSimpleActions({
  openAddUserValue: act.OPEN_ADD_USER_VALUE,
  openEditUserValue: [act.OPEN_EDIT_USER_VALUE, 'userValueId'],
  setUserValueCurrencyId: [act.SET_USER_VALUE_CURRENCY_ID, 'currencyId'],
  setUserValueColor: [act.SET_USER_VALUE_COLOR, 'userValueColor'],
  closePopups: [act.CLOSE_POPUPS],
});


var defaultState = {
  isAddingUserValue: false,
  editingUserValueId: undefined,
  userValueColor: '#d22',
  userValueCurrencyId: undefined,
}

var reducer1 = createComplexEvReducer(defaultState, [
  ['', act.OPEN_ADD_USER_VALUE, () => {
    return {...defaultState, isAddingUserValue: true}
  }],

  ['userValueColor', act.SET_USER_VALUE_COLOR, (_, {userValueColor}) => userValueColor],
  ['userValueCurrencyId', act.SET_USER_VALUE_CURRENCY_ID, (_, {currencyId}) => currencyId],

  ['', act.CLOSE_POPUPS, () => defaultState],
]);

var reducer2 = createComplexEvReducer([
  ['', act.OPEN_EDIT_USER_VALUE, (state, {userValueId}) => {
    var userValue = state.calc.userValues[userValueId]
    if (!userValue) {
      return state
    }
    return {...state, 
      ui: {...defaultState,
        editingUserValueId: userValueId,
        userValueColor: userValue.color,
        userValueCurrencyId: userValue.currencyId
      }
    }
  }],
]);

module.exports = {
  act,
  reducer: chainReducers([wrapEvReducer(STATE_NS, reducer1), reducer2])
};

