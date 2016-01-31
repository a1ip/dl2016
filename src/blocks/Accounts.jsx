'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools/tools.js')
var {InputText, InputSelect, TitleSmall, Button} = require('./dribs.jsx')

/**
 * * currencies
 *     * curCurrencyId
 *     * currencies - (id -> currency) map
 *     * currencyIds - array of ids
 * * accounts
 *     * withDeposits - boolean
 *     * accountIds - array of ids
 *     * accounts - (id -> account) map
 * * prices
 * * callbacks
 *     * updateAccount(accountId, account={currencyId, amount, percent})
 *     * openEditAccount(accountId)
 */
var Accounts = reactPure(function Accounts (props) {
  var {
    currencies: {currencies, curCurrencyId},
    accounts: {accounts, accountIds, withDeposits},
    callbacks: {updateAccount, openAddAccount},
    prices
  } = props
  return (
    <div className='chd-accounts'>
      <AccountsHeader currencies={currencies}
                      curCurrencyId={curCurrencyId}
                      withDeposits={withDeposits}/>
      {mapsep(accountIds, accounts, (_, id) =>
        <AccountRow {...props}
                    accountId={id}
                    key={id}/>
      )}
      <div className='chd-accounts__button-container'>
        <Button onClick={openAddAccount}>+ Валюта</Button>
      </div>
    </div>
  )
})

var Row3 = reactPure(function Row3(props) {
  var [c1, c2, c3] = props.children
  return (
    <div className='chd-row3'>
      <div className='chd-row3__c chd-row3__c1'>{c1}</div>
      <div className='chd-row3__c chd-row3__c2'>{c2}</div>
      <div className='chd-row3__c chd-row3__c3'>{c3}</div>
    </div>
  )
})


/*
 * * currencies
 * * curCurrencyId
 * * withDeposits
 */
var AccountsHeader = reactPure(function AccountsHeader(props) {
  var {currencies, curCurrencyId, withDeposits} = props
  var curCurrencySign = curCurrencyId && currencies[curCurrencyId] && currencies[curCurrencyId].sign || '-'
  var percentsClassName = classNames('chd-accounts-header__c',
    {'chd-accounts-header__c_disabled': !withDeposits})
  return (
    <Row3>
      <TitleSmall className='chd-accounts-header__c'>Сбережения</TitleSmall>
      <TitleSmall className='chd-accounts-header__c'>{'В моей валюте, ' + curCurrencySign}</TitleSmall>
      <TitleSmall className={percentsClassName}>Ставки вкладов, %</TitleSmall>
    </Row3>
  )
})


var AccountRow = reactPure(function AccountRow(props) {
  var {
    accountId,
    currencies: {currencies, curCurrencyId},
    accounts: {accounts, withDeposits},
    prices,
  } = props
  var {updateAccount, openEditAccount} = props.callbacks

  var {currencyId, amount, percent} = accounts[accountId]
  var {sign, color} = currencies[currencyId]
  var price = prices[currencyId]
  var curPrice = prices[curCurrencyId]
  return (
    <Row3>
      <div>
        <span className='chd-account-row__sign'
              style={{background: color}}
              onClick={() => openEditAccount(accountId)}>
          {sign}
        </span>
        <span>
          <InputText className='chd-account-row__amount'
                 value={formatNumber(amount)}
                 onChange={({target: {value}}) =>
                    updateAccount(accountId, {amount: value.trim()})}/>
        </span>
      </div>
      <div className='chd-account-row__cell'>
        <span className='chd-account-row__amount-cur'>
          {formatNumber(Math.round(amount * price / curPrice))}
        </span>
      </div>
      <div className='chd-account-row__cell'>
        <InputText className='chd-account-row__percent'
               value={formatNumber(percent)}
               disabled={!withDeposits}
               onChange={({target: {value}}) =>
                  updateAccount(accountId, {percent: value.trim()})}/>
      </div>
    </Row3>
  )
})

module.exports = Accounts

