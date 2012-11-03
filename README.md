traceme
=======

**traceme** is a super light-weight client-side JavaScript exception catching utility.

DEMO (HTML + JS)
----

[Live demo](http://jsdo.it/hedger/shiC)


Usage
-----
    
     # (Optional) Don't need this if you already have esprima installed.
     npm install esprima

     # Inject JS expression __TRACE__ to every JS function.
     node bin/injector.js demo/example.js > demo/example_traced.js


Why need this?
------------

In JavaScript, you can listen to the `error` event which fires whenever an uncaught error occurs.

    window.addEventListener('error', function(event) {
       var message =  event.message; // string
       var stack = event.stack; // undefined
    }, true);

However, the error stack information of the Error object is not available from the `ErrorEvent` instance.

So when an ubiquitous  error message like  **Object not defined** happens, developers find it harder to debug the source of the error.

Normally this is not a big problem for developers if errors happen locally at developers own browser which should have debugging tools such as WebInspector installed, but it has become a bigger issue if the errors happen from the remote client browsers and real-time debugging on those clients is almost impossible. 

**traceme** helps you to identify the source function that triggers the JS error easier.

How it works?
-----------

Say that you have a function that will cause an error.

    function makeError() {
      // TypeError: Property 'undefined' of object [object Window] is not
      // a  function
      undefined();
    }

After running **traceme** for your code, every function will be injected  one-line expression `__TRACE__` for tracing purpose.

    function makeError() {
      __TRACE__; // Injected by traceme
      undefined();
    }

The  variable `__TRACE__` is expected to be a global variable that you should have put at the very beginning of your JavaScript.

    var __TRACE__; // declare at global scope.
   
Injecting the expression `__TRACE__` to every function with **traceme** shouldn't change the behavior of the existing functions except that those functions runtime may need to spend a very little more time on resolving the global variable  `__TRACE__`.

The next thing we want to do is to track the function that is being executed. Since JavaScript is single threaded, knowing the current running function can help you to identify the source of the JS error a lot.

     var runningFunction = '';

     var onTrace = function() {
        runningFunction  = onTrace.caller;     
     };

     global.__defineGetter__('__TRACE__', onTrace);  

As you can see, whenever a function is trying to access the global `__TRACE__`, we can track that function for later use if an error is about to happen.

    window.addEventListener('error', function(event) {
       var message =  event.message; // string
       var source =  runningFunction.toString(); // The source function
    }, true);

Once you have the source of the function that causes the error, you can do whatever you want. Normally you can just log the error to the error-log server and aggregate the result for the developers. 

Note that the getter function  for the global variable `__TRACE__` is completely optional. Without the getter, you should either just declare `__TRACE__` as global variable or constant environment variable ( so that other JS compressor may remove it completely).

The getter function simply provides an easy way for you to track the running function without having `try {...} catch (ex) {....}` blocks everywhere to capture the error information.
  

Resources
---------
* [Bug 55092 - Stack information of uncaught Error object should be available in window.onerror](https://bugs.webkit.org/show_bug.cgi?id=55092)
   
   A bug tracking why we don't have stack from the error even 

* [http://stacktracejs.com/](http://stacktracejs.com/)

   A nice JS framework that can help to print out the stacktrace of any function given.
    
