'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools/tools.js')
var {InputText, InputSelect} = require('./dribs.jsx')
var Accounts = require('./Accounts.jsx')
var HistoryChart = require('./HistoryChart.jsx')
var AccountDialog = require('./AccountDialog.jsx')

/**
 *
 * * callbacks
 *     * setWidthDeposits(boolean)
 *     * changeCurCurrency(currencyId)
 *     * changeAccount(AccountId, currencyId, amount, percent)
 *     * deleteAccount(AccountId)
 *     * openEditAccount(AccountId)
 *     * openAddAccount()
 *     * hideCurrencySelector()
 *
 * * currencies
 *     * curCurrencyId
 *     * currencies - (id -> currency) map
 *     * currencyIds - array of ids
 * * history
 *     * todayDate
 *     * history
 *     * prices
 *     * forecast
 * * downloading
 *     * isDownloading
 *     * downloadingCurrencyId
 *     * loadedCurrencyIds
 * * accounts
 *     * withDeposits - boolean
 *     * accountIds - array of ids
 *     * accounts - (id -> account) map
 * * ui
 *     * isAddingAccount: false,
 *     * editingAccountId: undefined,
 *     * accountCurrencyId: undefined,
 *     * draggingCurrency: undefined,
 *
 * Where:
 * * currency
 *     * sign
 *     * displayName
 *     * color
 * * account
 *     * currencyId
 *     * amount
 *     * percent
 */

var Page = reactPure(function Page (props) {
  var {prices} = props.history
  var {withDeposits, accounts} = props.accounts
  var {setWithDeposits, setCurCurrency} = props.callbacks
  var {draggingCurrency} = props.ui
  // var {
  //   calc: {curCurrencyId, currencies, accounts},
  //   ui: {draggingCurrency},
  // } = props

  return (
    <div className='chd-page'>
      <div>
        <span className='chd-page__c0 chd-page__c01'>
          <Header/>
        </span>
        <span className='chd-page__c0 chd-page__c02'>
          <WithDepositsCheckbox withDeposits={withDeposits}
                                setWithDeposits={setWithDeposits}/>
        </span>
        <span className='chd-page__c0 chd-page__c03'>
          <CurCurrencySelector {...props.currencies}
                               setCurCurrency={setCurCurrency}/>
        </span>
      </div>
      <div>
        <span className='chd-page__c1 chd-page__c11'>
          <Accounts currencies={props.currencies}
                    accounts={props.accounts}
                    prices={prices}
                    callbacks={props.callbacks}/>
        </span>
        <span className='chd-page__c1 chd-page__c12'>
          <HistoryChart currencies={props.currencies}
                        history={props.history}
                        draggingCurrency={draggingCurrency}
                        accounts={accounts}
                        callbacks={props.callbacks}/>
        </span>
        <span className='chd-page__c1 chd-page__c13'>
          <UserChart currencies={props.currencies}
                     history={props.history}
                     accounts={accounts}
                     callbacks={props.callbacks}/>
        </span>
      </div>
      <AccountDialog currencies={props.currencies}
                     ui={props.ui}
                     callbacks={props.callbacks}/>
    </div>
  )
})

var Header = reactPure(function Header() {
  return <div className='chd-header'>Прогноз сбережений</div>
})

var WithDepositsCheckbox = reactPure(function WithDepositsCheckbox(props) {
  var {withDeposits, setWithDeposits} = props
  return (
    <div className='chd-with-deposits-checkbox'>
      <input type='checkbox' checked={withDeposits}
             onChange={({target: {checked}}) => setWithDeposits(checked)}/>
      <span className='chd-with-deposits-checkbox__label'>С вкладами</span>
    </div>
  )
})

var CurCurrencySelector = reactPure(function CurCurrencySelector(props) {
  var {currencies, currencyIds, curCurrencyId} = props
  var {setCurCurrency} = props
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
