'use strict'
var React = require('react')
var {reactPure} = require('../tools.js')
var classNames = require('classnames');

var me = module.exports;

me.InputText = reactPure(function InputText(props) {
  var className = classNames('chd-input-text', props.className)
  return <input {...props} type='text' className={className}/>
})

me.InputSelect = reactPure(function InputSelect(props) {
  var className = classNames('chd-input-select', props.className)
  return <select {...props} className={className}/>
})

me.ColorPicker = reactPure(function ColorPicker ({setColor, color}) {
  return <div className='chd-color-picker'
              style={{background: color}}
              onClick={() => typeof setColor == 'function' && setColor(color)}/>
})

me.TitleSmall = reactPure(function TitleSmall(props) {
  var className = classNames('chd-title-small', props.className)
  return <div {...props} className={className} />
})

me.SubTitleSmall = reactPure(function SubTitleSmall(props) {
  var className = classNames('chd-sub-title-small', props.className)
  return <div {...props} className={className} />
})
