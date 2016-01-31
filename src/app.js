'use strict'
var Promise = require('promise')
var React = require('react')
var ReactDom = require('react-dom')
var Redux = require('redux')
var thunk = require('redux-thunk')
var {Provider, connect} = require('react-redux')
var {chainReducers} = require('@evoja/redux-reducers')
var quandlApi = require('./tools/quandl-api.js')
var config = require('./config.js')
var Page = require('./blocks/Page.jsx')
var {localforageMiddleware, restoreStateFromLocalStorage, applySavingState} = require('./actions/local-storage.js')
var {extractSavingStateFromUri} = require('./actions/sharing.js')

var createStore = Redux.applyMiddleware(thunk, localforageMiddleware)(Redux.createStore)

function getReducer() {
  return chainReducers([
      require('./actions/uid.js').reducer,
      require('./actions/currencies.js').reducer,
      require('./actions/history.js').reducer,
      require('./actions/downloading.js').reducer,
      require('./actions/accounts.js').reducer,
      require('./actions/ui.js').reducer,
    ])
}
var reducerSources = ['uid', 'currencies', 'history', 'downloading', 'accounts', 'ui']
var getSourcePath = name => './actions/' + name + '.js'


var store = createStore(getReducer())

var origDispatch = store.dispatch
store.dispatch = function() {
  var r = origDispatch.apply(store, arguments)
  if (r instanceof Promise) {
    r.then(null, e => console.error(e.stack))
  }
  return r
}

var currencies = require('./actions/currencies.js')
store.dispatch(currencies.act.setCurrencies(config))

var accounts = require('./actions/accounts.js')
var downloading = require('./actions/downloading.js')
store.dispatch(downloading.act.download(quandlApi))
var savingState = extractSavingStateFromUri()

if (savingState) {
  applySavingState(savingState, store.dispatch)
} else {
  restoreStateFromLocalStorage(store.dispatch)
}



function mapDispatchToProps(dispatch, {componentId}) {
  var callbacks = {}
  reducerSources.map(getSourcePath).forEach((source) => {
    var {act} = require(source)
    for (var k in act) {
      if (typeof act[k] === 'function') {
        callbacks[k] = act[k]
      }
    }
  })
  return {
    callbacks: Redux.bindActionCreators(callbacks, dispatch)
  }
};

var WrappedPage = connect(state => state, mapDispatchToProps)(Page)

ReactDom.render(
  <Provider store={store}>
    <div>
      <WrappedPage/>
    </div>
  </Provider>,
  document.getElementById('datalaboratory-ru-2016-01-app')
)

document.onkeydown = (e) => {
  if (e.keyCode == 27) {
    store.dispatch(require(getSourcePath('ui')).act.closePopups())
  }
}




