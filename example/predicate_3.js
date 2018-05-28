#!/usr/bin/env node
var execSucc = function (filename) {
	try {
		var t = require(filename);
		return t.test();
	}
	catch(error){
		console.log(error);
		return false;
	}
};
exports.test = execSucc;