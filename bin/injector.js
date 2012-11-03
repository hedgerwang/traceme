#!/usr/bin/env node

var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');

var Syntax = esprima.Syntax;
var __TRACE__ = '__TRACE__';


/**
 * @param {Object} object
 * @param {Function} visitor
 * @param {Array} path
 * @param {Object} state
 */
function traverse(object, path, state) {
  var key, child;

  if (walker(traverse, object, path, state) === false) {
    return;
  }
  path.unshift(object);
  for (key in object) {
    if (object.hasOwnProperty(key)) {
      child = object[key];
      if (typeof child === 'object' && child !== null) {
        traverse(child, path, state);
      }
    }
  }
  path.shift();
}

function visitFunction(traverse, object, path, state) {
  catchup(object.body.range[0] + 1, state);
  state.g.buffer += __TRACE__ + ';';
  return false;
}

visitFunction.test = function(object, path, state) {
  switch (object.type) {
    case Syntax.FunctionExpression:
    case Syntax.FunctionDeclaration:
      return true;
    default:
      return false;
  }
};

function walker(traverse, object, path, state) {
  var visitors = [
    visitFunction
  ];

  for (var i = 0; i < visitors.length; i++) {
    if (visitors[i].test(object, path, state)) {
      return visitors[i](traverse, object, path, state);
    }
  }
}

function transform(code) {
  var commentsMap = {};

  var inputOptions = {
    comment: true,
    loc: true, 
    range: true
    // raw: true 
  };

  try {
    var ast = esprima.parse(code, inputOptions);
    var state = createState(code);
    traverse(ast, [], state);
    catchup(code.length, state);
    var newCode = state.g.buffer;
    return newCode;
  } catch (ex) {
    var lines = code.split('\n');
    lines = lines.map(function(line, i){
      return (1 + i) + ' : ' + line;
    });
    console.log(lines.join('\n'));
    throw ex;
  }  
}


function createState(source) {
  return {
    /**
     * Name of the super class variable
     * @type {String}
     */
    superVar: '',
    /**
     * Name of the enclosing class scope
     * @type {String}
     */
    scopeName: '',
    /**
     * Global state (not affected by updateState)
     * @type {Object}
     */
    g: {
      /**
       * Current position in the source code
       * @type {Number}
       */
      position: 0,
      /**
       * Buffer containing the result
       * @type {String}
       */
      buffer: '',
      /**
       * Identation offset (only negative offset is supported now)
       * @type {Number}
       */
      indentBy: 0,
      /**
       * Source that is being tranformed
       * @type {String}
       */
      source: source,

      /**
       * Fallback prefix for tags
       * @type {String}
       */
      tagNamespace: undefined,

      /**
       * Whether the thing was used
       * @type {Boolean}
       */
      tagNamespaceUsed: false
    }
  };
}


/**
 * Given a state fill the resulting buffer from the original source up to
 * the end
 * @param  {Number} end
 * @param  {Object} state
 */
function catchup(end, state) {
  if (end < state.g.position) {
    // cannot move backwards
    return;
  }
  state.g.buffer += updateIndent(
    state.g.source.substring(state.g.position, end), state);
  state.g.position = end;
}


/**
 * Update indent using state.indentBy property. Indent is measured in
 * double spaces. Updates a single line only.
 *
 * @param  {String} str
 * @param  {Object} state
 * @return {String}
 */
function updateIndent(str, state) {
  for (var i = 0; i < -state.g.indentBy; i++) {
    str = str.replace(/(^|\n)( {2}|\t)/g, '$1');
  }
  return str;
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};


function showUsage() {
  console.log('Usage:');
  console.log('   node bin/injector.js demo/example.js > demo/example.trace.js')
}

function main() {
  var input;
  var output;

  if (process.argv.length < 3) {
    showUsage();
  } else {
    for (var i = 2, j = process.argv.length; i < j ; i++) {
      var arg = process.argv[i];
      if (!endsWith(arg, '.js')) {
        continue;
      }
    }    

    try {
      var code = fs.readFileSync(arg, 'utf-8');
      var newCode = transform(code);
      console.log(newCode);
    } catch (e) {
      console.log(arg);
      console.log('Error: ' + e.message);
      process.exit(1);
    }
  }
}

main();
