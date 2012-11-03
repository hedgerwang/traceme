
/**
 * comment 
 */
function namedFunction(a, b, c) {__TRACE__;

  // comment 
  return anonymousFunction();
}

var anonymousFunction = function (a, b, c) {__TRACE__;

  return obj.namedMethod();
};

var obj = {
  namedMethod : function method(a, b, c) {__TRACE__;

    return this.throwAErrorNow();
  }
};

var boundFunction = function(a, b, c) {__TRACE__;

  return namedFunction();
}.bind(this);


var onClick = function(evt) {__TRACE__;

  if (evt.target.tagName === 'BUTTON') {
    var timer = setTimeout(boundFunction, 1);
  }
};


document.onclick = onClick;
