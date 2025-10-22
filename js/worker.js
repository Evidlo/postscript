if (!Math.imul) Math.imul = function(a, b) {
  var aHi = (a >>> 16) & 0xffff;
  var aLo = a & 0xffff;
  var bHi = (b >>> 16) & 0xffff;
  var bLo = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((aLo * bLo) + (((aHi * bLo + aLo * bHi) << 16) >>> 0) | 0);
};

Math.fround = Math.fround || (function (array) {
  return function(x) {
    return array[0] = x, array[0];
  };
})(new Float32Array(1));

if (!Math.clz32) Math.clz32 = (function(log, LN2){
  return function(x) {
    // Let n be ToUint32(x).
    // Let p be the number of leading zero bits in 
    // the 32-bit binary representation of n.
    // Return p.
    var asUint = x >>> 0;
    if (asUint === 0) {
      return 32;
    }
    return 31 - (log(asUint) / LN2 | 0) |0; // the "| 0" acts like math.floor
  };
})(Math.log, Math.LN2);

if (!Math.trunc) {
	Math.trunc = function(v) {
		v = +v;
		return (v - v % 1)   ||   (!isFinite(v) || v === 0 ? v : v < 0 ? -0 : 0);
	};
}

if (!ArrayBuffer['isView']) {
  ArrayBuffer.isView = function(a) {
    return a !== null && typeof(a) === "object" && a['buffer'] instanceof ArrayBuffer;
  };
}

function getValue(s,s_find,s_end){
  s_find=s_find.toLowerCase();
  s_end=s_end.toLowerCase();
  
  ss=s.toLowerCase();    
  p1=ss.indexOf(s_find);
  if (p1<0) return;
  s1=s.substr(p1+s_find.length,s.length);
  
  ss=s1.toLowerCase();
  p1=ss.indexOf(s_end);
  if (p1<0) return;
  s1=s1.substr(0,p1);
  return s1;
}
function number_format(number, decimals, dec_point, thousands_sep) {
  number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}

function print(text) {
	//console.log('print: '+text);
    postMessage({'type' : 'stdout', 'data' : text+''});
}

function printErr(text) {
	//console.log('printErr: '+text);
	var s=(text || '')+'';
    postMessage({'type' : 'stderr', 'data' : s});
}

var self2=self;
var iswebassembly=false;
if(self2.WebAssembly) iswebassembly=true;

var memoryInitializer, gwasmbinary;

function go(){	
if(iswebassembly){
	importScripts('gs_wasm.js');
	_getbinary('gs_wasm.wasm');
}else{
	importScripts('gs.js');
	_getbinary('gs.mem');
}

self2.addEventListener('message', function(event) {
    var message = event.data;
    if (message.type === "command") {
		var s1,arr,arguments2,result;
		var TOTAL_MEMORY=128*1024*1024; 
        postMessage({'type':'start'});		

		//main
		arguments2=[];
		var s1=message.commands;
		if(s1){
			arr=s1.split(' ');
			for(var i = 0; i <= arr.length-1; i++){
				arguments2.push(arr[i]);
			}
		}
		for(var i = 0; i <= message.arguments.length-1; i++){
			arguments2.push(message.arguments[i]);
		}

		var totalsize=0;
		var Module = {
			preRun: [function(){				
				gfs.writeFile('input.ps', message.files[0].data);
			}],
			postRun: [function() {
				var uarray = gfs.readFile('output.pdf', {encoding: 'binary'}); 
				//var pdfData = new Uint8Array(Array.from(uarray));
				var blob=new Blob([uarray], {type: "application/pdf"});
				postMessage({'type' : 'done', 'data' : blob, 'totalsize':totalsize});
			}],
			//arguments: ['-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-q', '-sOutputFile=output.pdf', '-c', '.setpdfwrite <</AlwaysEmbed [/Helvetica /Times-Roman]>> setdistillerparams', '-f', 'input.ps'],
			//arguments: ['-dBATCH', '-dNOPAUSE', '-dSAFER', '-sDEVICE=pdfwrite', '-q', '-sOutputFile=output.pdf', '-c', '.setpdfwrite', '-f', 'input.ps'],
			//arguments: ['-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.4', '-sOutputFile=output.pdf', '-c', '.setpdfwrite', '-f', 'input.ps'],
			arguments: arguments2,
			print: print, printErr: printErr,
		};
		if(iswebassembly){
			Module['wasmBinary']=gwasmbinary;
			totalsize=1500;
		}else{
			Module['TOTAL_MEMORY']=TOTAL_MEMORY;
			Module['memoryInitializerRequest']=memoryInitializer;
		}

        postMessage({'type' : 'stdout', 'data' : 'Received command: ' + Module.arguments.join(" ")});

        var time = Date.now();
		result='';
		try{
			result = gs_run(Module);
		}catch(err){
			postMessage({'type': 'done',	'error': ''+err, 'totalsize':totalsize});
			return;
		}        
		var totalTime = Date.now() - time;

        /*postMessage({
            'type' : 'stdout',
            'data' : 'Finished processing (took ' + totalTime + 'ms)'
        });*/        
        //postMessage({'type' : 'done', 'data' : result});
    }
}, false);
}

function _getbinary(fname){
try{
	var gd_lastprogress=(new Date()).getTime();
	var xhr = new XMLHttpRequest();
	xhr.open("GET", fname, true);
	xhr.responseType = "arraybuffer";
	xhr.onprogress=function(event){
		if(gd_lastprogress){
			var elaspetime = new Date();
			var dt=(elaspetime.getTime()-gd_lastprogress);
			if(dt<300)return;
			gd_lastprogress=elaspetime.getTime();
		}
		var a=event;
		if(iswebassembly){
			var total=a.totalSize || a.total || 13807993;
			if(total>=18446744073709552000) total=13807993;
		}else{
			var total=a.totalSize || a.total || 10342580;
			if(total>=18446744073709552000) total=10342580;
		}
		/*if(total==0){
			total=parseInt(a.target.getResponseHeader('x-decompressed-content-length'),10);
		}
		if(total<0) total=0;*/
		var current=a.position || a.loaded  || 0;
		postMessage({'type' : 'progress', 'data': 'Downloading... ('+number_format(current)+'/'+number_format(total)+')'});
	}
	xhr.onload = function xhr_onload() {
		if(xhr.status == 200 || xhr.status == 0 && xhr.response){
			if(iswebassembly){
				gwasmbinary=this.response;
			}else{
				memoryInitializer=xhr;
			}
			postMessage({'type' : 'ready'});
			return;
		}
		postMessage({'type' : 'ready', 'error': "Error (status) " + this.status + "("+this.statusText+") occurred while receiving the library."});
	}
	xhr.onerror=function(e){
		postMessage({'type' : 'ready', 'error': "Error " + e.target.status + " occurred while receiving the library."});
	}
	xhr.send(null);
}catch(err){
	postMessage({'type' : 'ready', 'error': err+'\n\nor This browser does not support. Please upgrade your browser.'});
}
}

go();