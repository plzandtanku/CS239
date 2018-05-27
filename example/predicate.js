/*
This is an example predicate that will run on the test input (input.js)
Example:
-----------------------------
> node example/predicate.js example/input.js
X
------------------------------
This succeeds without an error. However, another example
--------------------------------------------------------
> node example/predicate.js node_modules/jquery/dist/jquery.js

~/Projects/CS239/example/predicate.js:39
      console.log(node.callee.object.name.toUpperCase());
                                    ^
TypeError: Cannot read property 'name' of undefined
  ...
---------------------------------------------------------  
would fail. Using JSDelta, we can find the sized down input (jquery.js) that is causing this error
---------------------------------------------------------
> node node_modules/jsdelta/delta.js --cmd "node example/predicate.js" --msg "TypeError: Cannot read property 'name' of undefined" node_modules/jquery/dist/jquery.js
...
Minimisation finished; final version is at /tmp/tmp0/delta_js_smallest.js (21 bytes)

(function () {
    factory();
}());
----------------------------------------------------------
*/

var esprima = require('esprima'),
estraverse = require('estraverse'),
fs = require('fs');
var file = process.argv[2];
var ast = esprima.parse(String(fs.readFileSync(file)));
estraverse.traverse(ast, {
  leave: function (node, parent) {
    if (node.type === 'CallExpression')
      console.log(node.callee.object.name.toUpperCase());
  }
});

exports.cmd = "node example/predicate.js";
exports.checkResult = function (errCode, stdout, stderr, time) {
  return errCode == 0;
};