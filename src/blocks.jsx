'use strict'
var React = require('react')
var {mapsep} = require('./tools.js')
/**
 *
 * * funs
 *     * setWidthDeposits(boolean)
 *     * changeCurCurrency(currencyId)
 *     * changeUserValue(userValueId, currencyId, amount, rate)
 *     * deleteUserValue(userValueId)
 *     * showCurrencySelectorForUserValue(userValueId)
 *     * showCurrencySelectorForAddingUserValue()
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
 *     * isEditingCurCurrency - boolean
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
  var {withDeposits} = props.calc
  var {setWithDeposits} = props.funs
  return (
    <div className='chd-with-deposits-checkbox'>
      <input type='checkbox' checked={withDeposits}
             onChange={({target: {checked}}) => setWithDeposits(checked)}/>
      <span className='chd-with-deposits-checkbox__label'> С вкладами</span>
    </div>
  )
}

function CurCurrencySelector(props) {
  var {currencies, currencyIds, curCurrencyId} = props.calc
  var {setCurCurrency} = props.funs
  return (
    <div className='chd-cur-currency-selector'>
      <span className='chd-cur-currency-selector__label'>Моя валюта </span>
      <select value={curCurrencyId}
              onChange={({target: {value}}) => setCurCurrency(value)}>
        {mapsep(currencyIds, currencies,
          ({sign}, id) => <option value={id} key={id}>{sign}</option>
        )}
      </select>
    </div>
  )
}

function UserForm (props) {
  var {currencies, userValues, userValueIds, withDeposits} = props.calc
  var {changeUserValue, addValue} = props.funs
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

function UserFormHeader(props) {
  var {currencies, curCurrencyId, withDeposits} = props.calc
  var curCurrencySign = curCurrencyId && currencies[curCurrencyId] && currencies[curCurrencyId].sign || '-'
  return (
    <Row3>
      <span className='chd-user-form-header__c'>Сбережения<br/>&nbsp;</span>
      <span className='chd-user-form-header__c'>В моей валюте, {curCurrencySign}</span>
      <span className='chd-user-form-header__c'>Ставки вкладов, %</span>
    </Row3>
  )
}

function UserValueRow(props) {
  var userValueId = props.userValueId
  var {currencies, userValues, curCurrencyId} = props.calc
  var {currencyId, amount, rate} = userValues[userValueId]
  var {sign, price} = currencies[currencyId]
  var {price: curPrice} = currencies[curCurrencyId]
  var {setUserValue} = props.funs
  return (
    <Row3>
      <div>
        <span className='chd-user-value-row__sign'>{sign}</span>
        <span>
          <input className='chd-user-value-row__amount-input'
                 type='text' value={amount}
                 onChange={({target: {value}}) =>
                    setUserValue({id: userValueId, amount: value.trim()})}/>
        </span>
      </div>
      <div className='chd-user-value-row__cell'>
        {Math.round(amount * price / curPrice)}
      </div>
      <div className='chd-user-value-row__cell'>
        <input className='chd-user-value-row__rate-input'
               type='text' value={rate || 0}
               onChange={({target: {value}}) =>
                  setUserValue({id: userValueId, rate: value.trim()})}/>
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
