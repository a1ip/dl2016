'use strict'

var me = module.exports

me.mapsep = (ids, values, iter) =>
  ids.map(id => iter(values[id], id))
