'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber} = require('../tools.js')
var {InputText, InputSelect, ColorPicker} = require('./dribs.jsx')

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
 *     * setUserValueColor(color)
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
 *     * userValueColor
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
 *     * color
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
      <UserValueDialog {...props}/>
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
      <span className='chd-with-deposits-checkbox__label'>С вкладами</span>
    </div>
  )
}

function CurCurrencySelector(props) {
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
}

function UserForm (props) {
  var {currencies, userValues, userValueIds, withDeposits} = props.calc
  var {changeUserValue, addValue, openAddUserValue} = props.funs
  return (
    <div className='chd-user-form'>
      <UserFormHeader {...props}/>
      {mapsep(userValueIds, userValues, (_, id) =>
        <UserValueRow {...props}
                      userValueId={id}
                      key={id}
                      changeValue={changeUserValue}/>
      )}
      <button onClick={openAddUserValue}>+ Валюта</button>
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
  var ratesClassName = classNames('chd-user-form-header__c',
    {'chd-user-form-header__c_disabled': !withDeposits})
  return (
    <Row3>
      <span className='chd-user-form-header__c'>Сбережения<br/>&nbsp;</span>
      <span className='chd-user-form-header__c'>В моей валюте, {curCurrencySign}</span>
      <span className={ratesClassName}>Ставки вкладов, %</span>
    </Row3>
  )
}

function UserValueRow(props) {
  var userValueId = props.userValueId
  var {currencies, userValues, curCurrencyId, withDeposits} = props.calc
  var {currencyId, amount, rate, color} = userValues[userValueId]
  var {sign, price} = currencies[currencyId]
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
          <InputText className='chd-user-value-row__amount-input'
                 value={formatNumber(amount)}
                 onChange={({target: {value}}) =>
                    setUserValue({id: userValueId, amount: value.trim()})}/>
        </span>
      </div>
      <div className='chd-user-value-row__cell'>
        {formatNumber(Math.round(amount * price / curPrice))}
      </div>
      <div className='chd-user-value-row__cell'>
        <InputText className='chd-user-value-row__rate-input'
               value={formatNumber(rate)}
               disabled={!withDeposits}
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

function UserValueDialog (props) {
  var {setUserValueColor, setUserValueCurrencyId, setUserValue,
       addUserValue, closePopups} = props.funs
  var {curCurrencyId, currencies, currencyIds} = props.calc
  var {userValueColor, userValueCurrencyId, isAddingUserValue, editingUserValueId} = props.ui
  var className = classNames('chd-user-value-dialog',
    {'chd-user-value-dialog_visible': isAddingUserValue || editingUserValueId})

  return (
    <div className={className}>
      <div className='chd-user-value-dialog__panel'>
        <form onSubmit={(e) => {
          e.preventDefault()
          var {target: {elements}} = e
          var value = {
            currencyId: elements.currencyId.value,
            color: userValueColor
          }
          closePopups()
          if (editingUserValueId) {
            value.id = editingUserValueId
            setUserValue(value)
          } else {
            addUserValue(value)
          }
        }}>
          <div className='chd-user-value-dialog__row'>
            <InputSelect value={userValueCurrencyId || curCurrencyId}
                         name='currencyId'
                         onChange={({target: {value}}) => setUserValueCurrencyId(value)}>
              {mapsep(currencyIds, currencies,
                ({sign}, id) => <option value={id} key={id}>{sign}</option>
              )}
            </InputSelect>
          </div>
          <div className='chd-user-value-dialog__row'>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color={userValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <InputText value={userValueColor} name='color'
                style={{width:'100px'}}
                onChange={({target: {value}}) => setUserValueColor(value)}/>
            </span>
          </div>
          <div className='chd-user-value-dialog__row'>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#b22' setColor={setUserValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#bb2' setColor={setUserValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#2b2' setColor={setUserValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#2bb' setColor={setUserValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#22b' setColor={setUserValueColor}/>
            </span>
            <span className='chd-user-value-dialog__row-span'>
              <ColorPicker color='#b2b' setColor={setUserValueColor}/>
            </span>
          </div>
          <input type='submit' value={'Сохранить'}/>
        </form>
      </div>
    </div>
  )
}

module.exports = Page
