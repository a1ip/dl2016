'use strict'
var React = require('react')
var {mapsep} = require('./tools.js')
/**
 * Callbacks:
 * * setWidthDeposits(boolean)
 * * changeCurCurrency(currencyId)
 * * changeUserValue(userValueId, currencyId, amount, rate)
 * * deleteUserValue(userValueId)
 * * showCurrencySelectorForUserValue(userValueId)
 * * showCurrencySelectorForAddingUserValue()
 * * hideCurrencySelector()
 * 
 * Values:
 * * withDeposits - boolean
 * * isAdding - boolean
 * * curCurrencyId
 * * currencies - (id -> currency) map
 * * userValues - (id -> userValue) map
 * * currencyIds - array of ids
 * * userValueIds - array of ids
 *
 * Where:
 * * currency
 *     * id
 *     * sign
 *     * displayName
 *     * price
 * * userValue
 *     * id
 *     * currencyId
 *     * amount
 *     * rate
 */

function Page (props) {
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
          <UserForm {...props}/>
        </span>
        <span className='chd-page__c1 chd-page__c12'>
          <HistoryChart {...props}/>
        </span>
        <span className='chd-page__c1 chd-page__c13'>
          <UserChart {...props}/>
        </span>
      </div>
    </div>
  )
}

function Header() {
  return <div className='chd-header'>Прогноз сбережений</div>
}

function WithDepositsCheckbox(props) {
  var {withDeposits} = props
  var {setWithDeposits} = props
  return (
    <div className='chd-with-deposits-checkbox'>
      <input type='checkbox' checked={withDeposits} onChange={setWithDeposits}/>
      <span className='chd-with-deposits-checkbox__label'> С вкладами</span>
    </div>
  )
}

function CurCurrencySelector(props) {
  var {currencies, currencyIds, curCurrencyId} = props
  var {changeCurCurrency} = props
  return (
    <div className='chd-cur-currency-selector'>
      <span className='chd-cur-currency-selector__label'>Моя валюта </span>
      <select value={curCurrencyId} onChange={changeCurCurrency}>
        {mapsep(currencyIds, currencies,
          ({sign}, id) => <option value={id}>{sign}</option>
        )}
      </select>
    </div>
  )
}

function UserForm (props) {
  var {currencies, userValues, userValueIds, withDeposits} = props
  var {changeUserValue, addValue} = props
  return (
    <div className='chd-user-form'>
      <UserFormHeader {...props}/>
      {mapsep(userValueIds, userValues, (_, id) =>
        <UserValueRow {...props}
                      userValueId={id}
                      key={id}
                      changeValue={changeUserValue}/>
      )}
    </div>
  )
}

function Row3(props) {
  var [c1, c2, c3] = props.children
  return (
    <div className='chd-row3'>
      <div className='chd-row3__c chd-row3__c1'>{c1}</div>
      <div className='chd-row3__c chd-row3__c2'>{c2}</div>
      <div className='chd-row3__c chd-row3__c3'>{c3}</div>
    </div>
  )
}

function UserFormHeader({currencies, curCurrencyId, withDeposits}) {
  return (
    <Row3>
      <span className='chd-user-form-header__c'>Сбережения<br/>&nbsp;</span>
      <span className='chd-user-form-header__c'>В моей валюте, {currencies[curCurrencyId].sign}</span>
      <span className='chd-user-form-header__c'>Ставки вкладов, %</span>
    </Row3>
  )
}

function UserValueRow(props) {
  var {currencies, userValues, userValueId, curCurrencyId} = props
  var {currencyId, amount, rate} = userValues[userValueId]
  var {sign, price} = currencies[currencyId]
  var {price: curPrice} = currencies[curCurrencyId]
  var {changeUserValue} = props
  return (
    <Row3>
      <div>
        <span className='chd-user-value-row__sign'>{sign}</span>
        <span>
          <input className='chd-user-value-row__amount-input'
                 type='text' value={amount}/>
        </span>
      </div>
      <div className='chd-user-value-row__cell'>
        {Math.round(amount * price / curPrice)}
      </div>
      <div className='chd-user-value-row__cell'>
        <input className='chd-user-value-row__rate-input'
               type='text' value={rate || 0}/>
      </div>
    </Row3>
  )
}

function HistoryChart () {
  return (
    <div className='chd-history-chart'>
      История и прогноз курсов
    </div>
  )
}

function UserChart () {
  return (
    <div className='chd-user-chart'>
      User Chart
    </div>
  )
}

module.exports.Page = Page
