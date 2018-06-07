#!/usr/bin/env node
var execSucc = function (filename) {
    try {
	    var input = require(filename);

    	if (input.test()){
			return true;
		}
    } catch (err) {
//	console.log(err);

        return false;
    }
	return false;
};
exports.test = execSucc;
