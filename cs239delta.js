/**
 * cs239delta
 * 
 * Given a predicate file and an input file, performs delta debugging.
 * Tries to find the smallest version of input file such that the predicate file
 * is satisfied.
 * */
var esprima = require('esprima'),
    escodegen = require('escodegen'),
    fs = require('fs'),
	tmp = require('tmp'),
	path = require('path');
var tmpFile;
var pred_file;
var debug = 0;
var ast;

// Graphing components
var plotly = require('plotly')("plzandtanku","ueloaDKZuTxtYNYhkO2o");
var opn = require('opn');
var lineCounts = [];


// Two possible forms of code to test
// 1. testing code that runs on its own
// 2. testing a package/module function. These files have function exports
var is_package = false;
/**
 * Generates a temp file representing to code for an AST
 * used for evaluating/testing an AST
 * */
function getFileName(tree){
	var code = escodegen.generate(tree);
//	console.log(code);
	if (debug) console.log(code);
	tmpFile = tmp.fileSync();
	fs.writeFileSync(tmpFile.name,code);
	return tmpFile.name;
}

/*
 * Test the current AST for true/false against a predicate file
 */
function test(tree){
	if (!pred_file){
		console.log("NO PREDICATE");
		return;
	}
	var js_file = getFileName(tree);
	var pred = require('./' + pred_file);
	try {
		var res = pred.test(tmpFile.name);
	} catch (err) {
		return false;
	}
//	console.log('res is: ', res);
	return res;
}


/*
 * Performs delta debugging on a given AST (abstract syntax tree)
 */
function shrink(subtree){
	var linesOfCode = escodegen.generate(subtree).split("\n").length;
	lineCounts.push(linesOfCode);
	// if one line stop
//	console.log("TREE SHRINK");
//	console.log(ast);
//	console.log("END");
//	console.log(escodegen.generate(ast));

//	console.log(subtree.type)
	switch(subtree.type){
		case 'BlockStatement':
		case 'Program':
	//		console.log('PROGRAM');
			var arr = subtree.body;
			var old = subtree.body;
			if (arr.length > 1) {
				// for non-package files, we can chop in half more leniently
				if (!is_package) {
					subtree.body=arr.slice(0,arr.length/2);
					if(!test(ast)){
						// need to put back the removed element in tree
						subtree.body = arr.slice(arr.length/2);
					}
					return shrink(subtree);
				}
				// for packages/library files, we can't just chop in half because of
				// statements that depend on each other (exports calls)
				else {
					for (var i=0;i<arr.length;i++){
						subtree.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
					//	console.log(subtree.body);
						if(!test(ast)){
							// need to put back the removed element in tree
							subtree.body = arr;
							return shrink(old[i]);
						}
					}
				}
			}
			if (arr.length == 1) return shrink(arr[0]);
			return subtree;
			break;
		case 'ExpressionStatement':
			return shrink(subtree.expression);
		case 'CallExpression':
			// Not all CallExpressions can be recursed on
			if (subtree.arguments.length > 0 
					&& subtree.arguments[0].type == 'ThisExpression'
			) return shrink(subtree.callee);
			return subtree;
		case 'FunctionExpression':
			return shrink(subtree.body);
		case 'FunctionDeclaration':
	//		console.log('FUNC_DECLAR');
			var block = subtree.body;
			if (subtree.type === 'CallExpression'){
				block = subtree.callee;
			}
			var arr = block.body;
			var old = block.body;
			for (var i=0;i<arr.length;i++){
				block.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
				if(!test(ast)){
					return shrink(old[i]);
				}
			}
			return subtree;
			break;
		case 'IfStatement':
	//		console.log('IF_STATE');
			var conseq = subtree.consequent;
			var alt = subtree.alternate;
			subtree.alternate = null;
			if (test(ast)){
				return shrink(conseq);
			}
			subtree.consequent = alt;
			return shrink(subtree);
		default:
			// This means we don't handle it specifically and just return what we have
	//		console.log("UNRECOGNIZED");
//			console.log(subtree);
			return subtree;
	}
}

// dump results to file
function writeOutput(ans_code,js_file){
	path_seps = path.dirname(js_file).split(path.sep);
	last_path = path_seps[path_seps.length - 1];
	// Save result into `js_file/../tmp/delta_minimized.js`
	if (!fs.existsSync(`${__dirname}/examples/tmp`)) {
		fs.mkdirSync(`${__dirname}/examples/tmp`);
	}
	if (!fs.existsSync(`${__dirname}/examples/tmp/${last_path}`)) {
		fs.mkdirSync(`${__dirname}/examples/tmp/${last_path}`);
	}
	fs.writeFile(`${__dirname}/examples/tmp/${last_path}/delta_js_smallest.js`, ans_code, (err) => {
		if (err) console.log(err);
	});

	console.log('Minimization result saved to ', `${__dirname}/examples/tmp/${last_path}/delta_js_smallest.js`);
}

function graphResults() {
	console.log("\n\n");
	console.log("Graphing Results........");
	var steps = [];
	for (var i=1;i<=lineCounts.length;i++){
		steps.push(i);
	}
	var data = [{
		y: lineCounts,
		x: steps,
		type: "scatter"
	}];
	var layout = {fileopt : "overwrite", filename : "simple-node-example"};
	plotly.plot(data, layout, function (err, msg) {
		if (err) return console.log(err);
		console.log(msg);
		opn(msg.url,{wait: false});
	});

}
function main() {
	if (process.argv.length < 4 || process.argv.length > 5){
		var usage = `
			> cs239delta.js [predicate_file] [js_file] [output]
			predicate_file - the file that executes a test on the js_file
			js_file - the code being analyzed for errors against some test
			output - flag indicating to output to file
		`;
		console.log("INVALID ARGS");
		console.log(usage);
		return 0;
	}
	// read in arguments
	pred_file = process.argv[2];
	var js_file = process.argv[3];
	var output = process.argv[4];
	var file = fs.readFileSync(js_file).toString();
console.log("Running on input [" + js_file + "] with predicate file [" + pred_file +"].........");
	// Display contents of input file (for debugging)
//	console.log("---Showing content of "+ process.argv[3] +"---");	
//	console.log(file);
//	console.log("---end of file---");
	// for now we assume an exports word indicates a package file
	// we could use a flag for this in the future
	if (/exports/.test(file)) is_package = true;

	ast = esprima.parse(file);
	// Shrink the file
	var ans = shrink(ast);
	var ans_code = 	escodegen.generate(ans);
	console.log("Resulting AST:");
	console.log('ans: ', ans);
	console.log("Resulting code:");
	console.log(ans_code);
	
	if (output) {
		writeOutput(ans_code,js_file);
	}
	graphResults();
}

main();
