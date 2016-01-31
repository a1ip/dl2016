'use strict'

var deflate = require('../tools/rawdeflate.js')
var inflate = require('../tools/rawinflate.js')

function getUriFromSavingState (savingState) {
  return btoa(deflate(utf8_to_prezip(JSON.stringify(savingState))))
}
function getSavingStateStringFromUri (uri) {
  var first = uri.indexOf('?savingState=') + '?savingState='.length
  if (first == -1) {
    return ''
  }
  var part = uri.substring(first)
  var last = part.indexOf('&')
  last = last == -1 ? part.length : last
  part = part.substring(0, last)
  return prezip_to_utf8(inflate(atob(part)))
}

function utf8_to_prezip(str) {
  return encodeURIComponent(str)
  // return unescape(encodeURIComponent(str))
}
function prezip_to_utf8(str) {
  return decodeURIComponent(str)
  // return decodeURIComponent(escape(str))
}

function getLink(uri) {
  // Dancing for Firefox where location.origin is 'null' for 'file:' protocol
  var origin = location.origin && location.origin != 'null' && location.origin
    || (location.protocol + (location.port || '') + '//');
  console.log('well', origin)
  return origin + location.pathname + "?savingState=" + uri;
}

function getUri() {
  return location.search && location.search.substring(1)
}

function hasSavingStateInUri(uri) {
  return (uri + '').indexOf('savingState=') >= 0
}

function extractSavingStateFromUri() {
  var uri = getUri()
  if (!hasSavingStateInUri(uri)) {
    return
  }
  var savingStateString = getSavingStateStringFromUri(uri)
  try {
    return savingStateString && JSON.parse(savingStateString)
  } catch (e) {
    console.error(e.stack)
    return
  }
}

function selectTargetText(e) {
  console.log(e)
  e.preventDefault()

  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(e.target);
    range.select();
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(e.target);
    window.getSelection().addRange(range);
  }
}

module.exports = {
  extractSavingStateFromUri,
  getUriFromSavingState,
  getLink,
  selectTargetText
}

