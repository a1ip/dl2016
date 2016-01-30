'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer, chainReducers} = require('@evoja/redux-reducers')
var {getters: {getAccounts}} = require('./accounts.js')

var act = {};
var STATE_NS = 'ui';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['OPEN_ADD_ACCOUNT', 'OPEN_EDIT_ACCOUNT',
  'SET_ACCOUNT_CURRENCY_ID',
  'CLOSE_POPUPS',
  'START_DRAG',
  'STOP_DRAG'
]);

registerSimpleActions({
  openAddAccount: act.OPEN_ADD_ACCOUNT,
  openEditAccount: [act.OPEN_EDIT_ACCOUNT, 'accountId'],
  setAccountCurrencyId: [act.SET_ACCOUNT_CURRENCY_ID, 'currencyId'],
  closePopups: [act.CLOSE_POPUPS],
  startDrag: [act.START_DRAG, 'currencyId', 'pointNumber'],
  stopDrag: act.STOP_DRAG,
});


var defaultState = {
  isAddingAccount: false,
  editingAccountId: undefined,
  accountCurrencyId: undefined,
  draggingCurrency: undefined,
}

var reducerLocal = createComplexEvReducer(defaultState, [
  ['isAddingAccount', act.OPEN_ADD_ACCOUNT, () => true],
  ['accountCurrencyId', act.SET_ACCOUNT_CURRENCY_ID, (_, {currencyId}) => currencyId],
  ['', act.CLOSE_POPUPS, () => defaultState],
  ['draggingCurrency', act.START_DRAG, (_, {currencyId, pointNumber}) => {
      return {currencyId, pointNumber}
    }],
  ['draggingCurrency', act.STOP_DRAG, () => undefined],
]);

var reducerGlobal = createComplexEvReducer([
  ['', act.OPEN_EDIT_ACCOUNT, (state, {accountId}) => {
    var account = getAccounts(state)[accountId]
    if (!account) {
      return state
    }
    return {...state, 
      ui: {...defaultState,
        editingAccountId: accountId,
        accountCurrencyId: account.currencyId
      }
    }
  }],
]);

module.exports = {
  act,
  reducer: chainReducers([wrapEvReducer(STATE_NS, reducerLocal), reducerGlobal])
};

