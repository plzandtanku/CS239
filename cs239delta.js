var esprima = require('esprima');
var escodegen = require('escodegen');
var fs = require('fs');
var tmp = require('tmp');

var tmpFile;
var pred_file;
var debug = 0;
var ast;
function getFileName(tree){
	var code = escodegen.generate(tree);
	if (debug) console.log(code);
	tmpFile = tmp.fileSync();
	fs.writeFileSync(tmpFile.name,code);
	return tmpFile.name;
}
function test(tree){
	if (!pred_file){
		console.log("NO PREDICATE");
		return;
	}
	var js_file = getFileName(tree);
	var pred = require("./"+pred_file);
	var res = pred.test(tmpFile.name);
//	console.log(res);
	return res;
}
function shrink(subtree){
	// if one line stop
	console.log("TREE SHRINK");
	console.log(ast);
	console.log("END");
	switch(subtree.type){
		case 'Program':
			var arr = subtree.body;
			var old = subtree.body;
			for (var i=0;i<arr.length;i++){
				subtree.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
				console.log(subtree.body);
				if(!test(ast)){
					subtree.body = arr;
					//console.log("yeezy");
					//console.log(subtree);
					return shrink(arr[i]);
				}
			}
			break;
		case 'FunctionDeclaration':
			var block = subtree.body;
			var arr = block.body;
			var old = block.body;
			for (var i=0;i<arr.length;i++){
				block.body=arr.slice(0,i).concat(arr.slice(i+1,arr.length));
				if(!test(ast)){
					return old[i];
				}
			}
			break;
		default:
			return subtree;
			console.log("UNRECOGNIZED");
	}
}
function main() {
	if (process.argv.length < 4){
		var usage = `
> cs239delta.js [predicate_file] [js_file]
	predicate_file - the file that executes a test on the js_file
	js_file - the code being analyzed for errors against some test
		`;
		console.log("INVALID ARGS");
		console.log(usage);
		return 0;
	}
	pred_file = process.argv[2];
	var js_file = process.argv[3];
	var file = fs.readFileSync(js_file).toString();
	console.log("---Showing content of "+ process.argv[3] +"---");	
	console.log(file);
	console.log("---end of file---");
	ast = esprima.parse(file);
	test(ast);

	var ans = shrink(ast);
	console.log(ans);
	console.log(escodegen.generate(ans));

}
main();
