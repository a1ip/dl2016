'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools.js')
var {InputText, InputSelect, TitleSmall} = require('./dribs.jsx')

var UserValues = reactPure(function UserValues (props) {
  var {currencies, userValues, userValueIds, withDeposits} = props.calc
  var {changeUserValue, addValue, openAddUserValue} = props.funs
  return (
    <div className='chd-user-values'>
      <UserValuesHeader {...props}/>
      {mapsep(userValueIds, userValues, (_, id) =>
        <UserValueRow {...props}
                      userValueId={id}
                      key={id}
                      changeValue={changeUserValue}/>
      )}
      <button onClick={openAddUserValue}>+ Валюта</button>
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



var UserValuesHeader = reactPure(function UserValuesHeader(props) {
  var {currencies, curCurrencyId, withDeposits} = props.calc
  var curCurrencySign = curCurrencyId && currencies[curCurrencyId] && currencies[curCurrencyId].sign || '-'
  var ratesClassName = classNames('chd-user-values-header__c',
    {'chd-user-values-header__c_disabled': !withDeposits})
  return (
    <Row3>
      <TitleSmall className='chd-user-values-header__c'>Сбережения</TitleSmall>
      <TitleSmall className='chd-user-values-header__c'>{'В моей валюте, ' + curCurrencySign}</TitleSmall>
      <TitleSmall className={ratesClassName}>Ставки вкладов, %</TitleSmall>
    </Row3>
  )
})


var UserValueRow = reactPure(function UserValueRow(props) {
  var userValueId = props.userValueId
  var {currencies, userValues, curCurrencyId, withDeposits} = props.calc
  var {currencyId, amount, rate} = userValues[userValueId]
  var {sign, price, color} = currencies[currencyId]
  var {price: curPrice} = currencies[curCurrencyId]
  var {setUserValue, openEditUserValue} = props.funs
  return (
    <Row3>
      <div>
        <span className='chd-user-value-row__sign'
              style={{background: color}}
              onClick={() => openEditUserValue(userValueId)}>
          {sign}
        </span>
        <span>
          <InputText className='chd-user-value-row__amount'
                 value={formatNumber(amount)}
                 onChange={({target: {value}}) =>
                    setUserValue({id: userValueId, amount: value.trim()})}/>
        </span>
      </div>
      <div className='chd-user-value-row__cell'>
        <span className='chd-user-value-row__amount-cur'>
          {formatNumber(Math.round(amount * price / curPrice))}
        </span>
      </div>
      <div className='chd-user-value-row__cell'>
        <InputText className='chd-user-value-row__rate'
               value={formatNumber(rate)}
               disabled={!withDeposits}
               onChange={({target: {value}}) =>
                  setUserValue({id: userValueId, rate: value.trim()})}/>
      </div>
    </Row3>
  )
})

module.exports = UserValues

