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

/**
 * Generates a temp file representing to code for an AST
 * used for evaluating/testing an AST
 * */
function getFileName(tree){
	var code = escodegen.generate(tree);
	console.log(code);
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
	console.log('res is: ', res);
	return res;
}


/*
 * Performs 'ddmin' on a given AST (abstract syntax tree)
 */
function shrink(subtree){
	// if one line stop
	console.log("TREE SHRINK");
	console.log(ast);
	console.log("END");
	console.log(subtree.type)
	switch(subtree.type){
		case 'BlockStatement':
		case 'Program':
			console.log('PROGRAM');
			var arr = subtree.body;
			var old = subtree.body;
			for (var i=0;i<arr.length;i++){
				subtree.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
				console.log(subtree.body);
				if(!test(ast)){
					// need to put back the removed element in tree
					subtree.body = arr;
					//console.log("yeezy");
					//console.log(subtree);
					return shrink(old[i]);
				}
			}
			break;
		case 'FunctionDeclaration':
			console.log('FUNC_DECLAR');
			var block = subtree.body;
			var arr = block.body;
			var old = block.body;
			for (var i=0;i<arr.length;i++){
				block.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
				if(!test(ast)){
					return shrink(old[i]);
				}
			}
			break;
		case 'IfStatement':
			console.log('IF_STATE');
			var conseq = subtree.consequent;
			var alt = subtree.alternate;
			subtree.consequent = null;
			if (!test(ast)){
				return shrink(conseq);
			}
			return shrink(alt);
		default:
			console.log("UNRECOGNIZED");
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

	// Display contents of input file (for debugging)
	console.log("---Showing content of "+ process.argv[3] +"---");	
	console.log(file);
	console.log("---end of file---");
	ast = esprima.parse(file);
	if (!test(ast)){
		console.log("Input file does not pass predicate file, so unable to reduce");
		return;
	}

	// Shrink the file
	var ans = shrink(ast);
	var ans_code = 	escodegen.generate(ans);
	console.log('ans: ', ans);
	console.log(ans_code);

	if (output) {
		writeOutput(ans_code,js_file);
	}
}

main();
