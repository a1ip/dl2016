'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer, chainReducers} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {assignExisting} = require('../tools/tools.js');
var {act: uidAct} = require('./uid.js');

var act = {};
var STATE_NS = 'ui';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['OPEN_ADD_USER_VALUE', 'OPEN_EDIT_USER_VALUE',
  'SET_USER_VALUE_COLOR', 'SET_USER_VALUE_CURRENCY_ID',
  'CLOSE_POPUPS',
  'START_DRAG', 'STOP_DRAG'
]);

registerSimpleActions({
  openAddUserValue: act.OPEN_ADD_USER_VALUE,
  openEditUserValue: [act.OPEN_EDIT_USER_VALUE, 'userValueId'],
  setUserValueCurrencyId: [act.SET_USER_VALUE_CURRENCY_ID, 'currencyId'],
  setUserValueColor: [act.SET_USER_VALUE_COLOR, 'userValueColor'],
  closePopups: [act.CLOSE_POPUPS],
  startDrag: [act.START_DRAG, 'currencyId', 'pointNumber'],
  stopDrag: act.STOP_DRAG,
});


var defaultState = {
  isAddingUserValue: false,
  editingUserValueId: undefined,
  userValueColor: '#d22',
  userValueCurrencyId: undefined,
  draggingCurrency: undefined,
}

var reducerLocal = createComplexEvReducer(defaultState, [
  ['', act.OPEN_ADD_USER_VALUE, () => {
    return {...defaultState, isAddingUserValue: true}
  }],
  ['userValueColor', act.SET_USER_VALUE_COLOR, (_, {userValueColor}) => userValueColor],
  ['userValueCurrencyId', act.SET_USER_VALUE_CURRENCY_ID, (_, {currencyId}) => currencyId],
  ['', act.CLOSE_POPUPS, () => defaultState],
  ['draggingCurrency', act.START_DRAG, (_, {currencyId, pointNumber}) => {
      return {currencyId, pointNumber}
    }],
  ['draggingCurrency', act.STOP_DRAG, () => undefined],
]);

var reducerGlobal = createComplexEvReducer([
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
  reducer: chainReducers([wrapEvReducer(STATE_NS, reducerLocal), reducerGlobal])
};

