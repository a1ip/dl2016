'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')
var {assign} = require('@evoja/ns-plain');
var {act: uidAct} = require('./uid.js');

var act = {};
var STATE_NS = 'accounts';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['SET_WITH_DEPOSITS',
  'UPDATE_ACCOUNT', 'DELETE_ACCOUNT', 'ADD_ACCOUNT',
]);

registerSimpleActions({
  setWithDeposits: [act.SET_WITH_DEPOSITS, 'withDeposits'],
  updateAccount: [act.UPDATE_ACCOUNT, 'accountId', 'account'],
  deleteAccount: [act.DELETE_ACCOUNT, 'accountId'],
  simpleAddAccount: [act.ADD_ACCOUNT, 'accountId', 'account'],
});

act.addAccount = (account) => function(dispatch, getState) {
  return dispatch(uidAct.inc())
    .then(id => dispatch(act.simpleAddAccount(id, account)))
}


var defaultState = {
  withDeposits: false,
  accountIds: [
    // 'uid1', 'uid2'
  ],
  accounts: {
    // uid1: {
    //     currencyId: 'usd',
    //     amount: 1000,
    //     percent: 2,
    // }
  }
}



function assignExisting(to, from) {
  var res = {...to}
  for(var key in from) {
    res[key] = from[key] !== undefined ? from[key] : to[key]
  }
  return res
}

function removeSpaces(x) {
  return ('' + x).replace(/ /g, '')
}

function cleanNumber(value) {
  value = removeSpaces(value)
  return isNaN(parseInt(value, 10)) ? 0 : parseInt(value, 10)
}

function cleanAmount(amount) {
  return amount === '' ? amount : cleanNumber(amount)
}
var reducer = createComplexEvReducer(defaultState, [
  ['withDeposits', act.SET_WITH_DEPOSITS, (_, {withDeposits}) => withDeposits],

  ['accounts.{accountId}', act.UPDATE_ACCOUNT, (account, {account: newAccount}) => {
    account = assignExisting(account, newAccount)
    account.amount = cleanAmount(account.amount)
    account.percent = cleanAmount(account.percent)
    return account
  }],

  ['', act.DELETE_ACCOUNT, (state, {accountId}) => {
    if (!state.accounts[accountId]) {
      return state
    }
    var accountIds = state.accountIds
    var newAccountIds = [];
    for (var i = 0; i < accountIds.length; ++i) {
      if (accountIds[i] != accountId) {
        newAccountIds.push(accountIds[i])
      }
    }
    state = assign('accounts.' + accountId, state, undefined)
    state.accountIds = newAccountIds
    return state;
  }],

  ['', act.ADD_ACCOUNT, (state, {accountId, account}) => {
    if (state.accounts[accountId]) {
      return state;
    }
    var amount = cleanAmount(account.amount)
    state = assign('accounts.' + accountId, state, {...account, amount})
    return assign('accountIds.' + state.accountIds.length, state, accountId)
  }],

]);

module.exports = {
  STATE_NS,
  act,
  reducer: wrapEvReducer(STATE_NS, reducer),
  getters: {
    getAccounts: state => state[STATE_NS].accounts,
    getAccountIds: state => state[STATE_NS].accountIds,
  }
};

