

(function (global) {
  global.__TRACE__ = undefined;

  var tracedFunction = '';

  function onTrace() {
    tracedFunction = onTrace.caller;
    return undefined;
  };

  function onError(evt) {
    var msg = evt.message + '\n\n' +
      (evt.filename ? 'filename:' + evt.filename + '\n\n' : '') +
      (evt.lineno ? 'lineno:' + evt.lineno + '\n\n' : '') +
      String(tracedFunction).replace(/__TRACE__;/g, '');    
    alert(msg); 
  }
 
  global.__defineGetter__('__TRACE__', onTrace);  
  window.addEventListener('error', onError, true);
})(this);
