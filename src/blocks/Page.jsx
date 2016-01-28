'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools.js')
var {InputText, InputSelect} = require('./dribs.jsx')
var UserValues = require('./UserValues.jsx')
var HistoryChart = require('./HistoryChart.jsx')
var UserValueDialog = require('./UserValueDialog.jsx')

/**
 *
 * * funs
 *     * setWidthDeposits(boolean)
 *     * changeCurCurrency(currencyId)
 *     * changeUserValue(userValueId, currencyId, amount, rate)
 *     * deleteUserValue(userValueId)
 *     * openEditUserValue(userValueId)
 *     * openAddUserValue()
 *     * hideCurrencySelector()
 *
 * * calc
 *     * withDeposits - boolean
 *     * curCurrencyId
 *     * currencies - (id -> currency) map
 *     * userValues - (id -> userValue) map
 *     * currencyIds - array of ids
 *     * userValueIds - array of ids
 * * ui
 *     * isAddingUserValue - boolean
 *     * editingUserValueId - undefined or userValueId
 * * history
 *     ... are described in HistoryChart.jsx
 *
 * Where:
 * * currency
 *     * id
 *     * sign
 *     * displayName
 *     * price
 *     * color
 * * userValue
 *     * id
 *     * currencyId
 *     * amount
 *     * rate
 */

var Page = reactPure(function Page (props) {
  var {
    calc: {curCurrencyId, currencies},
    ui: {draggingCurrency},
  } = props

  return (
    <div className='chd-page'>
      <div>
        <span className='chd-page__c0 chd-page__c01'>
          <Header/>
        </span>
        <span className='chd-page__c0 chd-page__c02'>
          <WithDepositsCheckbox {...props}/>
        </span>
        <span className='chd-page__c0 chd-page__c03'>
          <CurCurrencySelector {...props}/>
        </span>
      </div>
      <div>
        <span className='chd-page__c1 chd-page__c11'>
          <UserValues {...props}/>
        </span>
        <span className='chd-page__c1 chd-page__c12'>
          <HistoryChart {...props.history}
                        curCurrencyId={curCurrencyId}
                        draggingCurrency={draggingCurrency}
                        currencies={currencies}
                        funs={props.funs}/>
        </span>
        <span className='chd-page__c1 chd-page__c13'>
          <UserChart {...props}/>
        </span>
      </div>
      <UserValueDialog {...props}/>
    </div>
  )
})

var Header = reactPure(function Header() {
  console.log('Header')
  return <div className='chd-header'>Прогноз сбережений</div>
})

var WithDepositsCheckbox = reactPure(function WithDepositsCheckbox(props) {
  var {withDeposits} = props.calc
  var {setWithDeposits} = props.funs
  return (
    <div className='chd-with-deposits-checkbox'>
      <input type='checkbox' checked={withDeposits}
             onChange={({target: {checked}}) => setWithDeposits(checked)}/>
      <span className='chd-with-deposits-checkbox__label'>С вкладами</span>
    </div>
  )
})

var CurCurrencySelector = reactPure(function CurCurrencySelector(props) {
  var {currencies, currencyIds, curCurrencyId} = props.calc
  var {setCurCurrency} = props.funs
  return (
    <div className='chd-cur-currency-selector'>
      <span className='chd-cur-currency-selector__label'>Моя валюта </span>
      <InputSelect className='chd-cur-currency-selector__select'
              value={curCurrencyId}
              onChange={({target: {value}}) => setCurCurrency(value)}>
        {mapsep(currencyIds, currencies,
          ({sign}, id) => <option value={id} key={id}>{sign}</option>
        )}
      </InputSelect>
    </div>
  )
})




var UserChart = reactPure(function UserChart () {
  return (
    <div className='chd-user-chart'>
      User Chart
    </div>
  )
})


module.exports = Page
