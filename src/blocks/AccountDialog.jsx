'use strict'
var React = require('react')
var classNames = require('classnames')
var {mapsep, formatNumber, reactPure} = require('../tools/tools.js')
var {InputText, InputSelect} = require('./dribs.jsx')

/*
 * * currencies
 *     * curCurrencyId
 *     * currencies - (id -> currency) map
 *     * currencyIds - array of ids
 * * ui
 *     * isAddingAccount: false,
 *     * editingAccountId: undefined,
 *     * accountCurrencyId: undefined,
 * * callbacks
 *     * updateAccount(accountId, account)
 *     * addAccount(account)
 *     * closePopups()
 */
var AccountDialog = reactPure(function AccountDialog (props) {
  var {currencies, currencyIds} = props.currencies
  var {accountCurrencyId, isAddingAccount, editingAccountId} = props.ui
  var {updateAccount, addAccount, closePopups} = props.callbacks
  var className = classNames('chd-account-dialog',
    {'chd-account-dialog_visible': isAddingAccount || editingAccountId})

  return (
    <div className={className}>
      <div className='chd-account-dialog__panel'>
        <div className='chd-account-dialog__row'>
          <InputSelect value={accountCurrencyId}
                       name='currencyId'
                       onChange={({target: {value}}) => {
                          var account = {currencyId: value}
                          closePopups()
                          if (editingAccountId) {
                            updateAccount(editingAccountId, account)
                          } else {
                            addAccount(account)
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


module.exports = AccountDialog



