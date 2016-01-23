'use strict'

var me = module.exports

me.mapsep = (ids, values, iter) =>
  ids.map(id => iter(values[id], id))

me.assignExisting = (to, from) => {
  var res = {}
  for(var key in to) {
    res[key] = from[key] !== undefined ? from[key] : to[key]
  }
  return res
}
