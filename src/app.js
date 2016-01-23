'use strict'
var Promise = require('promise')
var React = require('react')
var ReactDom = require('react-dom')
var Redux = require('redux')
var thunk = require('redux-thunk')
var {Provider, connect} = require('react-redux')
var {chainReducers} = require('@evoja/redux-reducers')
var {Page} = require('./blocks.jsx')
import DevTools from './DevTools.jsx'

console.log(DevTools.instrument);

var createStore = Redux.compose(
  Redux.applyMiddleware(thunk),
  DevTools.instrument()
)(Redux.createStore);


function getReducer() {
  var uid = require('./actions/uid.js')
  var calc = require('./actions/calc.js')
  return chainReducers([
      uid.reducer,
      calc.reducer,
    ])
}


var store = createStore(getReducer())
// Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
if (module.hot) {
  module.hot.accept('./actions/uid.js', () =>
    store.replaceReducer(getReducer())
  );
  module.hot.accept('./actions/calc.js', () =>
    store.replaceReducer(getReducer())
  );
}


function dispatch() {
  var r = store.dispatch.apply(store, arguments)
  if (r instanceof Promise) {
    r.then(null, function(e) {console.error(e)})
  }
  return r
}
var calc = require('./actions/calc.js')
dispatch(calc.act.setCurrencies({
    rub: {
      id: 'rub',
      sign: '₽',
      displayName: 'рубль',
      price: 1
    },
    usd: {
      id: 'usd',
      sign: '$',
      displayName: 'доллар США',
      price: 79.95
    }
  }))
dispatch(calc.act.addUserValue({
    currencyId: 'rub',
    amount: 100000,
    rate: 10
  }))
dispatch(calc.act.addUserValue({
    currencyId: 'usd',
    amount: 1000,
    rate: 2
  }))




function mapDispatchToProps(dispatch, {componentId}) {
  var calc = require('./actions/calc.js')
  var funs = {}
  for (var k in calc.act) {
    if (typeof calc.act[k] === 'function') {
      funs[k] = calc.act[k]
    }
  }
  // return {funs}
  // for (var k in ui.act) {
  //   if (typeof ui.act[k] === 'function') {
  //     funs[k] = ui.act[k]
  //   }
  // }
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

