'use strict';
var Promise = require('promise')
var d3 = require('d3')
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')
var {access} = require('@evoja/ns-plain')
var {assignExisting, removeSpaces, getYearAgoDate} = require('../tools/tools.js')
var {act: uidAct} = require('./uid.js')

var {STATE_NS: historyStateNs,
     act: historyAct,
   } = require('./history.js')
var calcStateNs = require('./calc.js').STATE_NS

var act = {};
var STATE_NS = 'downloading';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act)
var registerSimpleActions = getSimpleActionsRegistrator(act)

function getResolvedPromise() {
  return new Promise((resolve, reject) => resolve())
}


registerActionConst(['START_DOWNLOADING', 'STOP_DOWNLOADING']);

registerSimpleActions({
  startDownloading: [act.START_DOWNLOADING, 'currencyId'],
  stopDownloading: [act.STOP_DOWNLOADING]
});


function isDownloading(state) {
  return !!access(STATE_NS, state).downloadingCurrencyId
}
function getTodayDate(state) {
  return access(historyStateNs, state).todayDate
}
function getYearAgoDateFromState(state) {
  return getYearAgoDate(access(historyStateNs, state).todayDate)
}

function findNextCurrencyId(state) {
  var {currencyIds, currencies} = access(calcStateNs, state)
  var {loadedCurrencyIds} = access(STATE_NS, state)
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
    return getResolvedPromise()
  }

  var currencyId = findNextCurrencyId(getState())
  var apiId = currencyId && access(calcStateNs, getState()).currencies[currencyId].apiId
  if (!currencyId || !apiId) {
    return getResolvedPromise()
  }

  dispatch(act.startDownloading(currencyId))
  return api(apiId, getYearAgoDateFromState(getState()), getTodayDate(getState()))
    .then(function success(data) {
        dispatch(historyAct.setHistoryCurrency(currencyId, data))
        dispatch(act.stopDownloading())
        return dispatch(act.download(api))
      }, function error() {
        console.error('error downloading', currencyId)
        dispatch(act.stopDownloading())
        return dispatch(act.download(api))
      })
}


var defaultState = {
  downloadingCurrencyId: undefined,
  loadedCurrencyIds: {},
}

var reducer = createComplexEvReducer(defaultState, [
  ['downloadingCurrencyId', act.START_DOWNLOADING, (_, {currencyId}) => currencyId],
  ['', act.STOP_DOWNLOADING, (state, _) => {
    if (!state.downloadingCurrencyId) {
      return state
    }
    var loadedCurrencyIds = {...state.loadedCurrencyIds}
    loadedCurrencyIds[state.downloadingCurrencyId] = true
    return {...state,
      downloadingCurrencyId: undefined,
      loadedCurrencyIds: loadedCurrencyIds
    }
  }],
]);

module.exports = {
  act,
  reducer: wrapEvReducer(STATE_NS, reducer)
};

