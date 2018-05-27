#!/usr/bin/env node
var execSucc = function (filename) {
  var process = require("child_process");
  var output = null;
  const options = {
      stdio: "pipe"
  };

  try {
      output = process.execSync('node ' + filename, options);
  } catch (err) {
      return false;
  }

  if (output === null) {
      return false;
  }
  // Output is a buffer. From the output we find if there is a string "success".
  // If "success" exists in the output, predicate returns false.
  // Delta debugger eventually targets the line that outputs "success"
  return output.indexOf("success") !== -1;
};
exports.test = execSucc;