# CS239

Run `npm install` after git clone

## Usage
```
node cs239delta.js example/predicate.js example/input.js
```
Currently cs239delta.js does not work the same way as jsdelta, as described below.

## Example 
See example folder for a predicate.js and input.js as examples.

Try 

```
> node example/predicate.js example/input.js

X
```

without an error.

Another example:

```
> node example/predicate.js node_modules/jquery/dist/jquery.js`

~/Projects/CS239/example/predicate.js:39
      console.log(node.callee.object.name.toUpperCase());
                                    ^
TypeError: Cannot read property 'name' of undefined
  ...
```

This tells us that jquery.js fails as an input to the predicate.js.

We can use JSDelta to find the minimum input in jquery.js that causes this error.

```
node node_modules/jsdelta/delta.js --cmd "node example/predicate.js" --msg "TypeError: Cannot read property 'name' of undefined" node_modules/jquery/dist/jquery.js`

...
Minimisation finished; final version is at /tmp/tmp0/delta_js_smallest.js (21 bytes)
```

Opening /tmp/tmp0/delta_js_smallest.js, we find

```
(function () {
    factory();
}());
```
