'use strict'

function getUriFromSavingState (savingState) {
  return btoa(utf8_to_prezip(JSON.stringify(savingState)))
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
  return prezip_to_utf8(atob(part))
}

function utf8_to_prezip(str) {
  return unescape(encodeURIComponent(str))
}
function prezip_to_utf8(str) {
  return decodeURIComponent(escape(str))
}

function getLink(uri) {
  return location.origin + location.pathname + "?savingState=" + uri;
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

module.exports = {
  extractSavingStateFromUri,
  getUriFromSavingState,
  getLink
}

