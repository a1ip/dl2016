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
import DevTools from './DevTools.jsx'


var createStore = Redux.compose(
  Redux.applyMiddleware(thunk),
  DevTools.instrument()
)(Redux.createStore);

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
// Hot reload reducers (requires Webpack or Browserify HMR to be enabled)

function refreshStore() {
  store.replaceReducer(getReducer())
}
if (module.hot) {
  reducerSources.forEach(name =>
    module.hot.accept(getSourcePath(name), refreshStore))
}

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
store.dispatch(accounts.act.addAccount({
    currencyId: 'rub',
    amount: 100000,
    percent: 10,
  }))
store.dispatch(accounts.act.addAccount({
    currencyId: 'usd',
    amount: 1000,
    percent: 2,
  }))
store.dispatch(accounts.act.addAccount({
    currencyId: 'eur',
    amount: 1000,
    percent: 2,
  }))
store.dispatch(accounts.act.addAccount({
    currencyId: 'jpy',
    amount: 1000,
    percent: 2,
  }))
var downloading = require('./actions/downloading.js')
store.dispatch(downloading.act.download(quandlApi))



function mapDispatchToProps(dispatch, {componentId}) {
  // var sources = [
  //   './actions/calc.js',
  //   './actions/ui.js',
  //   './actions/history.js',
  // ]
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
      <DevTools/>
    </div>
  </Provider>,
  document.getElementById('datalaboratory-ru-2016-01-app')
)



/*
TODO: The style of the button "+ Валюта"
 */
