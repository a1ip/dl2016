'use strict'
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer, wrapEvReducer} = require('@evoja/redux-reducers')

var act = {};
var STATE_NS = 'currencies';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['SET_CURRENCIES', 'SET_CUR_CURRENCY']);
registerSimpleActions({
  setCurrencies: [act.SET_CURRENCIES, 'currenciesArr'],
  setCurCurrency: [act.SET_CUR_CURRENCY, 'curCurrencyId'],
})

var defaultState = {
  currencies: {
      // eur: {
      //   id: 'eur',
      //   sign: '€',
      //   displayName: 'евро',
      //   color: '#2b2',
      //   apiId: null
      // }
  },
  currencyIds: [
    // 'eur', 'rub', 'usd'
  ],
  curCurrencyId: undefined
}

var reducer = createComplexEvReducer(defaultState, [
  ['', act.SET_CUR_CURRENCY, (state, {curCurrencyId}) => {
    return state.currencies[curCurrencyId]
      ? {...state, curCurrencyId}
      : state
  }],

  ['', act.SET_CURRENCIES, (state, {currenciesArr}) => {
    var currencies = {}
    var currencyIds = []
    currenciesArr.forEach(currency => {
      currencies[currency.id] = currency
      currencyIds.push(currency.id)
    })
    return {
      ...state,
      currencies,
      currencyIds,
      curCurrencyId: currencyIds[0]
    }
  }],
]);

module.exports = {
  act,
  reducer: wrapEvReducer(STATE_NS, reducer),
  getters: {
    getCurrencies: state => state[STATE_NS].currencies,
    getCurrencyIds: state => state[STATE_NS].currencyIds,
    getCurCurrencyId: state => state[STATE_NS].curCurrencyId,
  }
};

