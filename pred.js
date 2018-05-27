#!/usr/bin/env node
var execSucc = function (filename) {    
//	var process = require("child_process");
//	var output = null;
//	const options = {
//		stdio: "pipe"
//	};
//
//	try {
//		output = process.execSync('node ' + filename, options);
//	} catch (err) {
//		return false;
//	}
//
//	if (output === null) {
//		return false;
//	}
//	console.log(output.toString());
//	return output.indexOf("success") !== -1;
	try {
		var t = require(filename);
		if (t.test() == 1){
			return true;
		}
	}
	catch(error){
		console.log(error);
		return false;
	}

};
exports.test = execSucc;
