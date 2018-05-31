#!/usr/bin/env node

var fs = require('fs');

var read_file = function(filename) {
    var data = fs.readFileSync(filename, 'utf8');

    // Trying to parse a non-json format string will certainly fail
    json_data = JSON.parse(data);

    return true;
};

exports.test = read_file;