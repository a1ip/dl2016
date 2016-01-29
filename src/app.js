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

var reducerSources = ['uid', 'calc', 'ui', 'history', 'downloading']
function getReducer() {
  return chainReducers([
      require('./actions/uid.js').reducer,
      require('./actions/calc.js').reducer,
      require('./actions/ui.js').reducer,
      require('./actions/history.js').reducer,
      require('./actions/downloading.js').reducer,
    ])
}


var store = createStore(getReducer())
// Hot reload reducers (requires Webpack or Browserify HMR to be enabled)

function refreshStore() {
  store.replaceReducer(getReducer())
}
if (module.hot) {
  module.hot.accept('./actions/uid.js', refreshStore)
  module.hot.accept('./actions/calc.js', refreshStore)
  module.hot.accept('./actions/ui.js', refreshStore)
  module.hot.accept('./actions/history.js', refreshStore)
  module.hot.accept('./actions/downloading.js', refreshStore)
}

var origDispatch = store.dispatch
store.dispatch = function() {
  var r = origDispatch.apply(store, arguments)
  if (r instanceof Promise) {
    r.then(null, e => console.error(e.stackTrace))
  }
  return r
}

var calc = require('./actions/calc.js')
store.dispatch(calc.act.setCurrencies(config))
store.dispatch(calc.act.addUserValue({
    currencyId: 'rub',
    amount: 100000,
    rate: 10,
  }))
store.dispatch(calc.act.addUserValue({
    currencyId: 'usd',
    amount: 1000,
    rate: 2,
  }))
store.dispatch(calc.act.addUserValue({
    currencyId: 'eur',
    amount: 1000,
    rate: 2,
  }))
// store.dispatch(calc.act.addUserValue({
//     currencyId: 'jpy',
//     amount: 1000,
//     rate: 2,
//   }))
var downloading = require('./actions/downloading.js')
store.dispatch(downloading.act.download(quandlApi))



function mapDispatchToProps(dispatch, {componentId}) {
  var sources = [
    './actions/calc.js',
    './actions/ui.js',
    './actions/history.js',
  ]
  var funs = {}
  sources.forEach((source) => {
    var {act} = require(source)
    for (var k in act) {
      if (typeof act[k] === 'function') {
        funs[k] = act[k]
      }
    }
  })
  return {
    funs: Redux.bindActionCreators(funs, dispatch)
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
