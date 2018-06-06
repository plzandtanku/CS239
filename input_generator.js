/**
 * input_generator.js
 * creates a large input containing several console.log("nope"); statements
 * and one console.log("success"); statement
 **/

var fs = require('fs');
var lines = 1000;
var d = 1;
var b = 1;
var count = lines;
if (process.argv.length > 2){
	lines = process.argv[2];
	count = lines;
}
if (process.argv.length > 3){
	d = process.argv[3];
	count = count * d;
}
if (process.argv.length > 4){
	b = process.argv[4];
	count = count * b;
}


var needle = Math.floor((Math.random() * count) +1);
var code = "";
var c = 1;
for (var i=1;i<=lines;i++){
	for (var j = 0;j<d;j++){
		if (d > 1) code += "if (1 < 2) {\n";
		for (var k = 1;k<=b;k++){
			if (b > 1) {
				code += "var power_level"+ c + " = 9001;\n";
				code += "if ( power_level"+c+" > 9000 ) {\n";
			}
			if (c!=needle){
				code += 'console.log("nope");\n';
			}else{
				code += 'console.log("success");\n';
			}
			if (b > 1) code += "}\n";
			c++;
		}
	}
	for (var j = 0;j<d;j++){
		if (d > 1) code += "}\n";
	}
}
fs.writeFileSync("generated_input.js",code);
console.log("Created input file 'generated_input.js' with " + lines + " lines. Specify a custom amount by passing a [line_count] parameter:\n input_generator.js [line_count]");

