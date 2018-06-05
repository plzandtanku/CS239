/**
 * input_generator.js
 * creates a large input containing several console.log("nope"); statements
 * and one console.log("success"); statement
 **/

var fs = require('fs');
var lines = 1000;
var d = 1;
if (process.argv.length > 2){
	lines = process.argv[2];
}
if (process.argv.length > 3){
	lines = process.argv[2];
	d = process.argv[3];
}

var needle = Math.floor((Math.random() * lines) +1);
var code = "";
for (var i=1;i<=lines;i++){
	if (d > 1){
		for (var j = 0;j<d;j++){
			code += "if (1 < 2) {\n";
		}
	}
	if (i!=needle){
		code += 'console.log("nope");\n';
	}else{
		code += 'console.log("success");\n';
	}
	if (d > 1){
		for (var j = 0;j<d;j++){
			code += "}\n";
		}
	}
}
fs.writeFileSync("generated_input.js",code);
console.log("Created input file 'generated_input.js' with " + lines + " lines. Specify a custom amount by passing a [line_count] parameter:\n input_generator.js [line_count]");

