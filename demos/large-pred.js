#!/usr/bin/env node
var execSucc = function (filename) {    
	try {
		var t = require(filename)();
		var ans =t.testFunc();
		if (ans == 42) return true;
		return false;
	}
	catch(error){
//	console.log(error);
return false;
		// allow errors except the testFunc we are evaluating
		if (/testFunc is not a function/.test(error)) return false;
		return true;
	}
};
exports.test = execSucc;
execSucc();
