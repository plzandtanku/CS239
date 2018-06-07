var myFunc = function (){
	var x = 3;
	if (1 >2 ){
		return true;
	}
	x = 5;
	if (x > 3){
		return true;
	}
	return false;
}

exports.test = myFunc;
