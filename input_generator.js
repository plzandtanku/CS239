/**
 * input_generator.js
 * creates a large input containing several console.log("nope"); statements
 * and one console.log("success"); statement
 **/

var fs = require('fs');
var lines = 1000;
if (process.argv.length > 2){
	lines = process.argv[2];
}

console.log("Created input file 'generated_input.js' with " + lines + " lines. Specify a custom amount by passing a [line_count] parameter:\n input_generator.js [line_count]");
var needle = Math.floor((Math.random() * lines) +1);
var code = "";
for (var i=1;i<=lines;i++){
	if (i!=needle){
		code += 'console.log("nope");\n';
	}else{
		code += 'console.log("success");\n';
	}
}
fs.writeFileSync("generated_input.js",code);
