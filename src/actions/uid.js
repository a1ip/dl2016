'use strict';
var {getActionConstRegistrator, getSimpleActionsRegistrator} = require('@evoja/redux-actions')
var {createComplexEvReducer} = require('@evoja/redux-reducers')
var Promise = require('promise');
var act = {};
var STATE_NS = 'uid';
var registerActionConst = getActionConstRegistrator(STATE_NS + '__', act);
var registerSimpleActions = getSimpleActionsRegistrator(act);

registerActionConst(['INC']);

act.inc = () => function(dispatch, getState) {
  var lastValue = getState()[STATE_NS];
  dispatch({type: act.INC});
  return new Promise((resolve, reject) => resolve('uid' + lastValue));
};

var reducer = createComplexEvReducer([[STATE_NS, act.INC, 1, (uid) => uid+1]]);

module.exports = {
  act: {inc: act.inc},
  reducer: reducer
};
