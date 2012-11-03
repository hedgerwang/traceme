
/**
 * comment 
 */
function namedFunction(a, b, c) {
  // comment 
  return anonymousFunction();
}

var anonymousFunction = function (a, b, c) {
  return obj.namedMethod();
};

var obj = {
  namedMethod : function method(a, b, c) {
    return this.throwAErrorNow();
  }
};

var boundFunction = function(a, b, c) {
  return namedFunction();
}.bind(this);


var onClick = function(evt) {
  if (evt.target.tagName === 'BUTTON') {
    var timer = setTimeout(boundFunction, 1);
  }
};


document.onclick = onClick;