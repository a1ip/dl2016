'use strict'
var localforage = require('localforage')
var me = module.exports;

var {
  getters: {getCurCurrencyId, getAccounts},
  act: currenciesAct
} = require('../actions/currencies.js')
var {
  getters: {getWithDeposits, getAccounts},
  act: accountsAct
} = require('../actions/accounts.js')
var {
  getters: {getForecast, getTodayDate},
  act: historyAct
} = require('../actions/history.js')

var KEY = 'chd-saving-state'

function localforageMiddleware({ dispatch, getState }) {
  return next => action => {
    var result = next(action)
    storeState(getState)
    return result
  }
}

var isSaving = false;
function storeState(getState) {
  if (isSaving) {
    return
  }
  isSaving = true;
  setTimeout(() => {
      var savingState = extractSavingState(getState())
      localforage.setItem(KEY, JSON.stringify(savingState))
      isSaving = false;
    }, 5000);
}

function extractSavingState(state) {
  var accounts = getAccounts(state)
  return {
    todayDate: getTodayDate(state),
    curCurrencyId: getCurCurrencyId(state),
    withDeposits: getWithDeposits(state),
    accounts: Object.keys(accounts).map(accountId => accounts[accountId]),
    forecast: getForecast(state),
  }
}

function applySavingState(savingState, dispatch) {
  var {todayDate, curCurrencyId, forecast, withDeposits, accounts} = savingState
  dispatch(historyAct.setTodayDate(todayDate))
  dispatch(historyAct.setForecast(forecast))
  dispatch(currenciesAct.setCurCurrency(curCurrencyId))
  dispatch(accountsAct.setWithDeposits(withDeposits))

  var addAccount = i => {
    if (i == accounts.length) {
      return
    }
    dispatch(accountsAct.addAccount(accounts[i]))
      .then(() => addAccount(i + 1))
  }
  addAccount(0)
}

function restoreStateFromLocalStorage(dispatch) {
  localforage.getItem(KEY)
    .then(storedString => {
      if (!storedString) {
        return
      }
      var savingState = JSON.parse(storedString);
      if (!savingState) {
        return
      }
      applySavingState(savingState, dispatch)
    })
}


module.exports = {
  restoreStateFromLocalStorage,
  applySavingState,
  extractSavingState,
  localforageMiddleware
}
