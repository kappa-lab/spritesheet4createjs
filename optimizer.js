verbose=true;
function optimizer(source){
	var eol='\n';
	var lines = source.split(eol);
	var numLines=lines.length;
	var delimiter='this.timeline.addTween(';

	for (var i=100;i<numLines;i++){
		var line=lines[i];
		var l=(i+1);
		if(line.indexOf(delimiter) == -1) continue;
		var opt=timeline2Tween(line);
		// console.log(l + '\n' + line);
		if(verbose)console.log('l:' + l + '\n' + line + '\n-> ' + opt);
		lines[i] = opt;
	}
}
function timeline2Tween(source,fps){
	var prefix='this.timeline.addTween(';
	var suffix=');';
	source = source.replace(prefix,'');
	source = source.replace(suffix,';');

	fps=fps|24;
	var code=source.split(').');
	var len=code.length;
	var d = 1000/fps;
	function floor(value ){
		return Math.ceil(Number(value) * d);
	}
	var requireContainer=false;
	 // code[len] = String(code[len]).slice(0,-2);
	for (var i=0;i<len;i++){
		var cmd=code[i];
		//if(i==0){
			// code[0] = code[0];
		if(i+1==len){
			cmd = code[i].slice(0,-2);
		}
		if(cmd.indexOf('wait(') > -1 ){
			code[i] = 'wait(' + floor(cmd.substr(5));
		}else if(cmd.indexOf('to({_off:') > -1 ){
			cmd = cmd.split(',');
			if(cmd.length>1) cmd[1]=floor(cmd[1]);
			code[i] = cmd.join(',');
		}else if(cmd.indexOf('to({') > -1 ){
			var rev=cmd.split(',').reverse();
			if(rev.length==1) continue;
			if('NaN' != String(Number(rev[0]))){
				rev[0] = floor(rev[0]);
				code[i] = rev.reverse().join(',');
			}else if('NaN' != String(Number(rev[1]))){
				rev[1] = floor(rev[1]);
				code[i] = rev.reverse().join(',');
			}
		}
	}

	var opt=code.join(').') + ');';
	if(requireContainer){
		opt = 'var cntr=this;'+opt
	}
	return opt;
}

