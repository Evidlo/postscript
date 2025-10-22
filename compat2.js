function init_compat201912_a(){
function go(obj){
	if(obj && obj.onchange && window.addEventListener){
		var func=obj.onchange;
		obj.onchange=function(){};
		window.addEventListener("load", function(){
			obj.onchange=func;
			obj.value='';
		}, false);
	}
}
	var a=document.getElementsByTagName('INPUT');
	for(var i = 0; i < a.length; i++){    
		if(a[i].type && a[i].type.toLowerCase()=='file'){
			go(a[i]);
		}
	}
}

function init_compat201912_b(){
function go(){	
	try{
		var a=document.getElementsByTagName('INPUT');
		for(var i = 0; i < a.length; i++){    
			if(a[i].type && a[i].type.toLowerCase()=='file' && a[i].addEventListener){
				a[i].addEventListener("change", function(e){
					var self=this; setTimeout(function(){self.value='';},400);
				});
			}
		}
	}catch(err){}
}
	if(window.addEventListener) window.addEventListener("load", go, false);
}