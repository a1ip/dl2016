'use strict'
var React = require('react')
var classNames = require('classnames');

var me = module.exports;

me.InputText = function InputText(props) {
  var className = classNames('chd-input-text', props.className)
  return <input {...props} type='text' className={className}/>
}

me.InputSelect = function InputSelect(props) {
  var className = classNames('chd-input-select', props.className)
  return <select {...props} className={className}/>
}

me.ColorPicker = function ColorPicker ({setColor, color}) {
  return <div className='chd-color-picker'
              style={{background: color}}
              onClick={() => typeof setColor == 'function' && setColor(color)}/>
}
