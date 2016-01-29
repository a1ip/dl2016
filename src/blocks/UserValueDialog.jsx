'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools/tools.js')
var {InputText, InputSelect} = require('./dribs.jsx')


var UserValueDialog = reactPure(function UserValueDialog (props) {
  var {setUserValueCurrencyId, setUserValue,
       addUserValue, closePopups} = props.funs
  var {curCurrencyId, currencies, currencyIds} = props.calc
  var {userValueCurrencyId, isAddingUserValue, editingUserValueId} = props.ui
  var className = classNames('chd-user-value-dialog',
    {'chd-user-value-dialog_visible': isAddingUserValue || editingUserValueId})

  return (
    <div className={className}>
      <div className='chd-user-value-dialog__panel'>
        <div className='chd-user-value-dialog__row'>
          <InputSelect value={userValueCurrencyId || curCurrencyId}
                       name='currencyId'
                       onChange={({target: {value}}) => {
                          var userValue = {currencyId: value}
                          closePopups()
                          if (editingUserValueId) {
                            userValue.id = editingUserValueId
                            setUserValue(userValue)
                          } else {
                            addUserValue(userValue)
                          }
                        }}>
            {mapsep(currencyIds, currencies,
              ({sign}, id) => <option value={id} key={id}>{sign}</option>
            )}
          </InputSelect>
        </div>
      </div>
    </div>
  )
})


module.exports = UserValueDialog



