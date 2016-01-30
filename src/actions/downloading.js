'use strict';
var Promise = require('promise')
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')
var {getYearAgoDate, assert} = require('../tools/tools.js')

var {getters: {getCurrencies, getCurrencyIds}} = require('./currencies.js')
var {act: historyAct, getters: {getTodayDate}} = require('./history.js')

var act = {};
var STATE_NS = 'downloading';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act)
var registerSimpleActions = getSimpleActionsRegistrator(act)

var resolvedPromise = new Promise((resolve, reject) => resolve())


registerActionConst(['START_DOWNLOADING', 'COMMIT_DOWNLOADING', 'STOP_DOWNLOADING']);

registerSimpleActions({
  startDownloading: [act.START_DOWNLOADING, 'currencyId'],
  commitDownloading: act.COMMIT_DOWNLOADING,
  stopDownloading: act.STOP_DOWNLOADING,
});


function isDownloading(state) {
  return state[STATE_NS].isDownloading
}
function getYearAgoDateFromState(state) {
  return getYearAgoDate(getTodayDate(state))
}

function findNextCurrencyId(state) {
  var currencyIds = getCurrencyIds(state)
  var currencies = getCurrencies(state)
  var {loadedCurrencyIds} = state[STATE_NS]
  for (var i = 0; i < currencyIds.length; ++i) {
    var currencyId = currencyIds[i]
    if (currencies[currencyId]
        && currencies[currencyId].apiId
        && !loadedCurrencyIds[currencyId]) {
      return currencyId
    }
  }
}

act.download = (api) => function(dispatch, getState) {
  if (isDownloading(getState())) {
    return resolvedPromise
  }
  return dispatch(act.chainDownload(api))
}

act.chainDownload = (api) => function(dispatch, getState) {
  var state = getState()
  var currencyId = findNextCurrencyId(state)
  var apiId = currencyId && getCurrencies(state)[currencyId].apiId
  if (!currencyId || !apiId) {
    dispatch(act.stopDownloading())
    return resolvedPromise
  }

  dispatch(act.startDownloading(currencyId))
  return api(apiId, getYearAgoDateFromState(state), getTodayDate(state))
    .then(function success(data) {
        dispatch(historyAct.setHistoryCurrency(currencyId, data))
        dispatch(act.commitDownloading())
        return dispatch(act.chainDownload(api))
      }, function error() {
        console.error('error downloading', currencyId)
        dispatch(act.commitDownloading())
        return dispatch(act.chainDownload(api))
      })
}


var defaultState = {
  isDownloading: false,
  downloadingCurrencyId: undefined,
  loadedCurrencyIds: {},
}

var reducer = createComplexEvReducer(defaultState, [
  ['', act.START_DOWNLOADING, (state, {currencyId}) => {
    assert(!state.downloadingCurrencyId, 'Every downloading must be committed')
    return {
      ...state,
      isDownloading: true,
      downloadingCurrencyId: currencyId,
    }
  }],
  ['', act.COMMIT_DOWNLOADING, (state, _) => {
    var {downloadingCurrencyId, loadedCurrencyIds, isDownloading} = state
    assert(isDownloading && !!downloadingCurrencyId, 'Something must be being downloaded')
    loadedCurrencyIds = {...loadedCurrencyIds}
    loadedCurrencyIds[downloadingCurrencyId] = true
    return {
      isDownloading: true,
      downloadingCurrencyId: undefined,
      loadedCurrencyIds: loadedCurrencyIds
    }
  }],
  ['', act.STOP_DOWNLOADING, (state, _) => {
    var {downloadingCurrencyId, isDownloading} = state
    assert(isDownloading && !downloadingCurrencyId, 'Downloading process must be launched but everything must be committed')
    return {
      ...state,
      isDownloading: false,
      downloadingCurrencyId: undefined,
    }
  }],
]);

module.exports = {
  act: {
    download: act.download
  },
  reducer: wrapEvReducer(STATE_NS, reducer)
};

