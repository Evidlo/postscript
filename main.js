var gmaxsizeview=120;
var gmaxsizeviewgz=30;
var gmaxsize=15;
var ischrome=false;
if (navigator.appName=="Netscape"){
	if (navigator.userAgent.indexOf("Chrome")>=0) ischrome=true;
}
var issafari=false;
var ua = navigator.userAgent.toLowerCase(); 
if (ua.indexOf('safari') != -1 && ua.indexOf('chrome') <0){ 
	issafari=true;
}

var henc=html_entity_encode;
var editor, editordata;
var loaded=false;
var g_option={"activeline":true, "theme":"default", "lineWrapping":true, "matchcase":false, "saveconfirm":true};

function proc_geteditordata(){
	return editordata;
}
function div_scriptinject_script_onresize(){
	if(!editor)return;
	var a=_getid('div_scriptinject_script');
	if(a) editor.setSize(a.clientWidth, a.clientHeight);
}
function proc_updatecodemirror(){
	var obj=_getid("runscript_fontsize");	
	var fontSize=obj.value;
	var obj=_getid("runscript_fontname");	
	var fontname=obj.value;
	
	var el;
	if(editor)el=editor.getWrapperElement();
	if(el){
		el.style.fontSize=fontSize+"pt";
		el.style.fontFamily=fontname;
		editor.refresh();
	}else{
		var tag=document.getElementsByTagName('DIV');
		var s;
		for (var i=0; i < tag.length; i++){
			s=tag[i].className;
			if(!s)continue;
			if(s=='CodeMirror' || s.indexOf("CodeMirror ")>=0 || s.indexOf(" CodeMirror")>=0){
				tag[i].style.fontSize=fontSize+"pt";
				tag[i].style.fontFamily=fontname;
			}
		}	
	}
}

function init(){
	_getid("query").onkeydown=function(e){
		if(!e)e=window.event;
		if(!e)return;
		if(e.keyCode==13) {
			proc_search();
    		if (e.preventDefault) {e.preventDefault(); e.stopPropagation();}
    		else {e.returnValue = false; e.cancelBubble = true;}				
		}
	}
	if (window.addEventListener){
		document.addEventListener('keydown', other_onkeydown); 	
	}else if (window.attachEvent){
		window.attachEvent("onkeydown", other_onkeydown);
	}

	var supportfontname = new Array("Arial","Arial Narrow","Arial Rounded MT Bold","Bitstream Vera Sans","Bookman Old Style","Century","Century Gothic","Comic Sans MS","Courier","Courier New","cursive","DejaVu Sans","Lucida Console","monospace","Monotype Corsiva","sans serif","serif","Tahoma","TeX","Times","Times New Roman","Verdana");
	var s=localStorage['runscript_fontname'] || '';
	if ((s==null) || (s=='undefined')) s='';
	var flag=false;
	for (var i = 0; i <= supportfontname.length-1; i++){				
		if (s==supportfontname[i]){
			flag=true;
			break;
		}
	}	
	s1="<option value='-'>"+"Custom font";
	s1+="<option value=''>Font None (Default)";					
	for (var i = 0; i <= supportfontname.length-1; i++){				
		s1+="<option value='"+supportfontname[i]+"'>"+supportfontname[i];
	}
	if ((!flag) && (s!='')){
		s1+="<option value='"+s+"'>"+s;		
	}
	_getid("sel_fontname").innerHTML="<select id='runscript_fontname'>"+s1+"</select>";

	s1='';
	for (var i = 8; i <= 20; i++){				
		s1+="<option value='"+i+"'>"+i+"pt";
		if(i==10) s1+=' (Default)';
	}
	_getid("sel_fontsize").innerHTML="<select id='runscript_fontsize'>"+s1+"</select>";

	var obj=_getid("runscript_fontname");	
	obj.value=localStorage['runscript_fontname'] || '';
	var obj=_getid("runscript_fontsize");	
	obj.value=localStorage['runscript_fontsize'] || 10;

	var obj=_getid("query");
	obj.value=localStorage["runscript_lastquery"] || '';	
	var obj=_getid("replace");
	obj.value=localStorage["runscript_lastreplace"] || '';

	_getid("runscript_fontname").onchange=proc_fontname;		
	_getid("runscript_fontsize").onchange=proc_fontsize;		
	_getid("runscript_theme").onchange=function(){proc_themeoption();}		
	_getid("runscript_activeline").onclick=proc_activelineoption;		
	_getid("runscript_wrap").onclick=proc_wrap;			
	_getid("runscript_case").onclick=function(){
		localStorage["runscript_case"]=this.checked;
		g_option.matchcase=this.checked;
	}
	_getid("runscript_scon").onclick=function(){
		localStorage["runscript_scon"]=this.checked;
		g_option.saveconfirm=this.checked;
	}	

	/*if(CodeMirror.commands){
		CodeMirror.commands.autocomplete = function(cm) {
			cm.showHint({hint: CodeMirror.htmlHint});
		}
	}*/
	editor=CodeMirror.fromTextArea(_getid('input'),{
		lineNumbers: true,
		dragDrop: false,
		cursorScrollMargin: 12,
		specialChars: /$^/,			
		/*specialCharPlaceholder:function(ch){
			var token = document.createTextNode("\u2022"); 
			return token;
		},*/
		gutters: ["CodeMirror-linenumbers", "breakpoints"],
		//extraKeys: {"Ctrl-Space": "autocomplete"}
	});		
	editor.on("gutterClick", editor_onGutterClick);
	editor.on("keydown", editor_onKeyEvent);
	editor.on("change", editor_onChange);

	proc_newtab('');

	var a=_getid("size_width");
	a.value=getstorage("c_notepad_width") || geditor_width;	
	size_width_onchange(a);		

	loaded=true;
	proc_setoption();
	//if(_getid('c_syntaxs').value) proc_syntaxs();
	proc_onresize();
	if(window.addEventListener) window.addEventListener("load", proc_onresize, false);
	else if (window.attachEvent) window.attachEvent("onload", proc_onresize);

	var s=getCookie('c_pdfviewer');
	if(!s){
		if(ischrome) s='0';
		else s='1';
	}
	if(ismsie){
		_getid('c_pdfviewer').remove(0);
		s='1';
	}	
	_getid('c_pdfviewer').value=s;

	/*window.onbeforeunload=function(){
		var data=proc_geteditordata();
		if(data.changed){
			return "Not saved. Would you just discard?";
		}
	}*/
	if(!gcssupport){
		_getid('filecharset1').style.display='none';
		_getid('filecharsetbtn').style.display='none';		
	}

	var holder = document;
	holder.ondragover = function(e){ 
		_getid('tablebottom').className = 'hover'; 
		try{var ua=navigator.userAgent;
			if(ua && ua.indexOf("Chrome")>=0){					
				if(e.originalEvent) e = e.originalEvent;
				if(e.dataTransfer){
					var b = e.dataTransfer.effectAllowed;
					e.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy';
				}
			}
		}catch(err){}
		return false; 
	};
	holder.ondragend = function(){ _getid('tablebottom').className = '';return false; };
	holder.ondrop = function (e){
		_getid('tablebottom').className = '';
		e.preventDefault();				
		handleFileSelect(e.dataTransfer.files);
		return false;
	};
	_getid('fileload1').onchange=function(e){
		if(!e || !e.target){
			alert("This browser does not support.");
			return;
		}
		handleFileSelect(e.target.files);	
	}

	window.onresize=function(){
		proc_closeoption();
		proc_closesize();
		proc_onresize();
	}
	document.documentElement.onmouseup=function(e){
		if(!e) e=event;
		if(e.button!=0 && e.button!=1)return;
    	var b2;
		if(e.target) b2 = e.target;
		else if(e.srcElement) b2 = e.srcElement;
    	while (b2) {
			if(b2.id=="div_size" || b2.id=="editor_options" || b2.id=="popup_container" || b2.id=="div_output"){
				return;
			}
    		if (b2==document.body) break;
			if (b2.parentElement) b2=b2.parentElement;
			else b2=b2.parentNode;
    	}
		proc_closeoption();
		proc_closesize();
		//proc_closeoutput();
	}

/*	_getid('c_pdf_pagesize').value=getstorage('c_pdf_pagesize') || 'A4';
	_getid('c_pdf_orientation').value=getstorage('c_pdf_orientation') || 'Portrait';	
	_getid('c_pdf_m_bottom').value=getstorage('c_pdf_m_bottom') || 10;	
	_getid('c_pdf_m_left').value=getstorage('c_pdf_m_left') || 10;	
	_getid('c_pdf_m_right').value=getstorage('c_pdf_m_right') || 10;	
	_getid('c_pdf_m_top').value=getstorage('c_pdf_m_top') || 10;	
	_getid('c_pdf_zoom').value=getstorage('c_pdf_zoom') || '1.0';*/
}
var glastblob;
function handleFileSelect(files){
	if(!files || files.length==0) return;			
	function go(idx){
		if(idx>files.length-1){
			return;
		}
		var data=proc_geteditordata();
		if(data && data.changed){
			var answer = confirm("Not saved. Would you just discard?");
			if(!answer)return;
		}
		var f=files[idx];
		if(!f)return;
		
		var resp={title:f.name, mimeType:f.type};

		var fmaxsize=gmaxsize; 
		var ext=getfileext(f.name || '');
		if(ext=='pdf'){
			//show_message('This file is PDF. You can not edit directly in this app.','','','',4000);
			if(glastblob) window.URL.revokeObjectURL(glastblob);
			glastblob=window.URL.createObjectURL(f);
			proc_view(glastblob, f.name);
			_getid('dest2').innerHTML='';
			_getid('dest3').innerHTML='';
			return;
		}
		function go1(){
			proc_pstopdf(f, resp);
			if(f.size>fmaxsize*1024*1024){
				proc_newtab('%% The file size is too large to edit directly ('+fmaxsize+' MB limit). Supports only converting to a PDF.',resp);
				_getid('gd_btn_save').disabled=true;			
				gd_setname(resp);
				g_blob1=f;
				return;
			}
			_blobtotext(f,'UTF-8',function(s,encdetect){		
				if(!/^(\s)*%!PS/i.test(s)){
					if(s.length>40*1024) s=s.substr(0,40*1024)+"\n...more";
					s='%% This file does not support editing directly. Supports only converting to a PDF.\n\n'+s;					
					encdetect=false;
				}
				proc_newtab(s,resp);
				_getid('gd_btn_save').disabled=true;			
				gd_setname(resp);
				g_blob1=f;
				if(encdetect){
					var answer=confirm("Text encoding has detected ("+encdetect+").\n\nDo you want to change the encoding automatically?");
					if(answer){
						_getid('filecharset1').value=encdetect;
						filecharset1_onchange();
					}
				}
			},function(){
				alert(f.name+'\nThere was an error.');
			},resp);
		}
		if(ext=='gz'){
			if(f.size>gmaxsizeviewgz*1024*1024){
				alert('The GZ file size is too large to convert and view. ('+gmaxsizeviewgz+' MB limit)');
				return;
			}
			show_message('Decompress a GZIP file....','','','',1000*60*60);
			var reader = new FileReader();
			reader.onload = function(e) {				
				try{
					var ps=new Uint8Array(e.target.result);
					var uncompressed=pako.ungzip(ps);
					f=new Blob([uncompressed]);
					go1();
				}catch(err){
					alert(err+'');
				}
				hide_message();
			}
			reader.onerror=function(e) {
				alert("File Reading Error.");
				hide_message();
			}
			reader.readAsArrayBuffer(f);		
		}else{
			if(f.size>gmaxsizeview*1024*1024){
				alert('The file size is too large to convert and view. ('+gmaxsizeview+' MB limit)');
				return;
			}
			go1();
		}
	}
	setTimeout(function(){
		go(0);
	},10);
}

function editor_onChange(cm, tc){
	if (!loaded) return;
	if(!editordata) return;
	var flag=!editordata.editor.isClean();
	if(flag!=editordata.changed){
		editordata.changed=flag;
		proc_displaytab();
	}
}
function editor_onKeyEvent(editor, e) {
  try{	
	other_onkeydown(e, editor);
  }catch(err){}
}

function makeMarker() {
	var marker = document.createElement("span");
	marker.style.color = "#900";
	marker.innerHTML = "●";
	return marker;
}
function editor_onGutterClick(cm, line){
	if (line < 0) return;
	var b=cm.lineInfo(line);
	cm.setGutterMarker(line, "breakpoints", b.gutterMarkers ? null : makeMarker());
}

function other_onkeydown(e, editor){ 
	if(!e)e=window.event;
	if(!e)return;
	var code=e.keyCode;
	var press_ctrl=typeof e.modifiers=='undefined'?e.ctrlKey:e.modifiers&Event.CONTROL_MASK;
	var press_alt=typeof e.modifiers=='undefined'?e.altKey:e.modifiers&Event.ALT_MASK;
	var press_shift=typeof e.modifiers=='undefined'?e.shiftKey:e.modifiers&Event.SHIFT_MASK;		
	
	var flag=false;
	if ((press_ctrl) && (!press_alt) && (!press_shift)){
		flag=true;
		if (code==70){ //ctrl+f
    		var b2='';
			if(e && e.target) b2 = e.target;
			else if(e && e.srcElement) b2 = e.srcElement;
			if(editor || (b2 && (b2.type=='text'))){
				var data=proc_geteditordata();
				var s;
				if (data) s=data.editor.getSelection();  			
				var obj = _getid("query");
				if (s) obj.value=s;			
				obj.focus();
				obj.select();
			}else{
				flag=false;
			}
		} else if (code==71){ //ctrl+g
			proc_jump();
		} else if (code==113){ //ctrl+f2
			proc_bookmark();
		} else if (code==83){ //ctrl+s
			gd_save();
		} else if (code==13){ //ctrl+enter
			proc_upload();
		} else {
			flag=false;
		}
	} else if ((!press_ctrl) && (press_alt) && (!press_shift)){
		flag=true;
		if (code==113){ //alt+f2
			proc_bookmark();
		} else if (code==114){ //alt+f3
			proc_nextsearch();
		} else if (code==87){ //alt+w
			gd_save();
		} else if (code==83){ //alt+s
			gd_save();
		} else {
			flag=false;
		}
	} else if ((press_ctrl) && (press_alt) && (!press_shift)){
		flag=false;
	} else if ((!press_ctrl) && (!press_alt) && (!press_shift)){
		flag=true;
		if (code==113){ //f2
			proc_next_bookmark();			
		} else if (code==114){ //f3
			proc_nextsearch();
		} else if (code==120){ //f9
			proc_upload();
		} else {
			flag=false;
		}
	}	
	if (flag){
    	if (e.preventDefault) {e.preventDefault(); e.stopPropagation();}
    	else {e.returnValue = false; e.cancelBubble = true;}	
	}
}

var gcschanged,gcssupport,g_blob1;
if(window.FileReader) gcssupport=true;
function filecharset1_onchange(){
	var enc=_getid('filecharset1').value;
	if(enc=='auto' && window._detect){
		_detect();return;
	}
	if(!enc || !g_blob1)return;
	_blobtotext(g_blob1,enc,function(s){
		gcschanged=true;
		editor.setValue(s || '');
	},function(){
		alert('There was an error.');
	});
}
function _blobtotext(blob,enc,success,error,resp){
	if(!blob)return;
		var reader = new FileReader();
		reader.onload = function(e){
			var encdetect;
			/*if(resp){
				var ext=getfileext(resp.title);
				if(ext=='html' || ext=='htm'){
					var s=e.target.result;
					var match=s.match(/<meta(?!\s*(?:name|value)\s*=)(?:[^>]*?content\s*=[\s"']*)?([^>]*?)[\s"';]*charset\s*=[\s"']*([^\s"'/>]*)/i);
					var a=_getid('filecharset1');
					if(a && match && match[2]){
						var b=match[2].toLowerCase().replace(/[^A-Za-z0-9]/g,' ');
						if(b!='utf 8' && b!='iso 8859 1' && b!='us ascii' && b!='windows 1252'){
							for(var i = 0; i <= a.options.length-1; i++){
								if(!a.options[i].value)continue;
								if(a.options[i].value.toLowerCase().replace(/[^A-Za-z0-9]/g,' ')==b){
									encdetect=a.options[i].value;
									break;
								}
							}
						}
					}
				}
			}*/
			if(success) success(e.target.result, encdetect);
		};
		reader.onerror = function(){
			if(error) error();
		};
		if(reader.readAsText) reader.readAsText(blob,enc);
		else alert("This browser does not support.");
}
function proc_newtab(txt,resp){
	var data={};
	data.id=0;
	data.title='';
	data.editor=editor;  		
	data.lastPos=null;
	data.lastQuery=null;
	data.marked=[];
	data.changed=false;
	data.resp=resp;	

	/*if(resp && (resp.mimeType=='text/plain' || resp.mimeType=='text/csv')){
		txt="<pre>\n"+txt+"\n</pre>";
	}*/	
	editordata=data;	
	if(txt || resp) editor.setValue(txt || '');
	gcschanged=false;
	_getid('filecharset1').value='UTF-8';

	editordata.changed=false;
	editordata.editor.clearHistory();
	editordata.editor.markClean();
	proc_displaytab();
}
function proc_displaytab(){
	var s='';
	if(editordata && editordata.changed) s='&nbsp;<font style="color:red;font-size:13px">*Changed</font>';
	_getid('status').innerHTML=s;
}
function proc_search(){   
    var data=proc_geteditordata();
    if (!data) return;
    var editor=data.editor;

	for (var i = 0; i < data.marked.length; ++i) data.marked[i].clear();
	data.marked.length = 0;
	data.lastPos=null;
	data.lastQuery=null;
  
  var text = _getid("query").value;
  if (!text) return;

	localStorage["runscript_lastquery"]=text; 
 
  var cc=editor.getCursor();
  var ffrom,fto,ff;
  for (var cursor = editor.getSearchCursor(text,null,!g_option.matchcase); cursor.findNext();) {
	ff=cursor.from();
    data.marked.push(editor.markText(ff, cursor.to(), {className: "searched"}));
    if (data.marked.length==1){
		ffrom=ff;
		fto=cursor.to();
	}	
	if(ffrom && cc && cursor && cc.line<=ff.line){
		//if(cc.line<ff.line || (cc.line==ff.line && cc.ch<=ff.ch)){
			editor.setSelection(ff, cursor.to());  
			ffrom=null;
		//}
	}
  }
  if(ffrom) editor.setSelection(ffrom, fto);  
  
	data.lastQuery = text;
    
  if (data.marked.length==0) {
		show_message("<label2><font style='font-size:13px'>Not found</font></label2>");
		return;
  } else {
  		show_message("<label2><font style='font-size:13px'>"+data.marked.length+" found</font></label2>");
  } 
}	
function proc_nextsearch(){   
    var data=proc_geteditordata();
    if (!data) return;
    var editor=data.editor;
	
  if (!data.lastQuery) {
  	proc_search();
  	return;
  }

  var cursor = editor.getSearchCursor(data.lastQuery, editor.getCursor(), !g_option.matchcase);
  if (!cursor.findNext()) {
    cursor = editor.getSearchCursor(data.lastQuery,null,!g_option.matchcase);
    if (!cursor.findNext()) return;
  }
  editor.setSelection(cursor.from(), cursor.to());  
  data.lastPos = cursor.to(); 	
}

function proc_replace(){
	var data=proc_geteditordata();
	if (!data) return;
	var editor=data.editor;

	for (var i = 0; i < data.marked.length; ++i) data.marked[i].clear();
	data.marked.length = 0;  

	var text = _getid("query").value;
	var replace = _getid("replace").value;
  if (!text) return;
  
  var cursor = editor.getSearchCursor(text, editor.getCursor(), !g_option.matchcase);
  if (!cursor.findNext()) {
    cursor = editor.getSearchCursor(text,null,!g_option.matchcase);
    if (!cursor.findNext()) {
    	_getid('editor_replace').style.display='none';
    	show_message("<label2><font style='font-size:13px'>Not found</font></label2>");
    	return;
    }
  }
  editor.setSelection(cursor.from(), cursor.to());    
  
	var a=_getid('editor_replace');
	if (a.style.display!=''){
		var b=_getid('replace');
		var c=getOffset(b);
		a.style.display='';	
		a.style.left=c.left+'px';
		a.style.top=(c.top+b.offsetHeight+2)+'px';	
	}
	_getid("editor_replace_yes").focus();
	
	_getid("editor_replace").onkeydown=function(e){
		if(!e)e=window.event;
		if(!e)return;
		if (e.keyCode==89) {
			cursor.replace(replace);
			proc_replace();
		}else if (e.keyCode==78){
			proc_replace();
		}else if (e.keyCode==27){
			_getid('editor_replace').style.display='none';
		}
	}	
	_getid("editor_replace_yes").onclick=function(){
		cursor.replace(replace);
		proc_replace();
	}
	_getid("editor_replace_no").onclick=function(){
		proc_replace();
	}	
	_getid("editor_replace_stop").onclick=function(){
		_getid('editor_replace').style.display='none';
	}	
}
function proc_replaceall(){
	_getid('editor_replace').style.display='none';
	
	var data=proc_geteditordata();
	if (!data) return;
	var editor=data.editor;

	for (var i = 0; i < data.marked.length; ++i) data.marked[i].clear();
	data.marked.length = 0;  
	
	var text = _getid("query").value;
	var replace = _getid("replace").value;
  if (!text) return;

  localStorage["runscript_lastquery"]=text;  
  localStorage["runscript_lastreplace"]=replace;
    
	var answer=confirm("Replace all search texts?\n\nOK: Replace All, Cancel: Replace one by one");
	if (!answer){
		proc_replace();
		return;
	}
 
	loaded=false;
	try{
		var k=0;
		for (var cursor = editor.getSearchCursor(text,null,!g_option.matchcase); cursor.findNext();) {			
			cursor.replace(replace);
			k++;
			if (k >= 2000){
				alert('Too many replacement!');
				break;
			}
		}  
	}catch(err){}
	loaded=true;
	  
  if (k==0) {
	show_message("<label2><font style='font-size:13px'>Not found</font></label2>");
  } else {
	if (!data.changed){
		data.changed=true;
		proc_displaytab();
	}	  	
  	alert(k+" search texts have been replaced.");
  }    
}
function proc_jump(){
	var s=localStorage["runscript_jumpline"] || '';
    var line;
	jPrompt("Jump to line. Enter a line number.", s, document.title, function(r){
		line=r;
		go();
	});
function go(){
    if (line && !isNaN(Number(line))){
    	localStorage["runscript_jumpline"]=line;
    	if (editor) {
    		editor.setCursor(Number(line)-1);
    		editor.scrollIntoView(null,200);
    		editor.focus();
    	}
    }
}
}
function proc_bookmark(){
	if(!editor) return;
	var a=editor.getCursor();
	var b=editor.lineInfo(a.line);
	editor.setGutterMarker(a.line, "breakpoints", b.gutterMarkers ? null : makeMarker());
}
function proc_next_bookmark(){
	if(!editor) return;	
	var a=editor.getCursor();	
	var c=editor.lineCount();
	var k=a.line+1;
	for (var i = k; i < c; i++) {
		var b=editor.lineInfo(i);
		if (b && b.gutterMarkers) {
			editor.setCursor(b.line);
			return;
		}
	}	
	
	for (var i = 0; i <= k; i++) {
		var b=editor.lineInfo(i);
		if (b && b.gutterMarkers) {
			editor.setCursor(b.line);
			return;
		}
	}
}

function proc_showoption(){
	var a=_getid('editor_options');
	/*if(a.style.display==''){
		a.style.display='none';
		return;
	}*/
	var b=_getid('btn_editor_options');
	var c=getOffset(b);
	a.style.display='';	
	var w=a.offsetWidth || 400;
	
	var diff=parseInt((w-b.offsetWidth) / 2);
	var x=c.left-diff;
	if (x+w>getWindowWidth()+getScrollLeft()-20) x=getWindowWidth()+getScrollLeft()-20-w;
	a.style.left=x+'px';
	a.style.top=(c.top+b.offsetHeight+2)+'px';	
	a.style.display='';	
		
	_getid('runscript_theme').value=g_option.theme;		
	_getid('runscript_activeline').checked=g_option.activeline;
	_getid('runscript_wrap').checked=g_option.lineWrapping;
	_getid('runscript_case').checked=g_option.matchcase;	
	_getid('runscript_scon').checked=g_option.saveconfirm;		
}	
function proc_closeoption(){
	var a=_getid('editor_options');
	a.style.display='none';	
}
function proc_fontname(){
	var s='';
	var obj=_getid("runscript_fontname");	
	if (obj.value=='-'){
		jPrompt("Enter a font name.", '', document.title, function(r){
			s=r;
			go();
		});
		function go(){
			if (!s) return;
			var obj2 = document.createElement('option');
    		obj2.text = s;
	    	obj2.value = s;
			obj.add(obj2);    	
    		obj.selectedIndex=obj.length-1;
			localStorage['runscript_fontname']=s;
			proc_updatecodemirror();
		}
	} else {
		s=obj.value;
		localStorage['runscript_fontname']=s;
		proc_updatecodemirror();
	}
}

function proc_fontsize(){
	var obj=_getid("runscript_fontsize");	
	localStorage['runscript_fontsize']=obj.value;
	proc_updatecodemirror();
}
function proc_setoption(){
	proc_updatecodemirror();	
	var a=localStorage['runscript_wrap'] || 'true';
	if(a){
		g_option.lineWrapping=toBool(a);
		if(editor) editor.setOption("lineWrapping", g_option.lineWrapping);
	}
	var a=localStorage['runscript_theme'] || '';
	if(a && a!='default'){
		g_option.theme=a;
		if(editor) editor.setOption("theme", g_option.theme);
	}
	var a=localStorage['runscript_activeline'] || 'true';
	if(a){
		g_option.activeline=toBool(a);
		if(editor) editor.setOption("styleActiveLine", g_option.activeline);
	}
	var a=localStorage['runscript_case'] || 'false';
	if(a) g_option.matchcase=toBool(a);
	//var a=localStorage['c_syntaxs'] || 'markdown';
	//if(a) _getid('c_syntaxs').value=a;
	var a=localStorage['runscript_scon'] || 'true';
	if(a) g_option.saveconfirm=toBool(a);
}
function proc_themeoption(){
	if(!editor) return;
	var a=_getid('runscript_theme');	
	var theme = a.value;
	editor.setOption("theme", theme);
	g_option.theme=theme;
	localStorage['runscript_theme']=theme;
}
function proc_activelineoption(){
	if(!editor) return;
	var a=_getid('runscript_activeline');
	g_option.activeline=a.checked;
	localStorage['runscript_activeline']=a.checked;
	editor.setOption("styleActiveLine", g_option.activeline);
}
function proc_wrap(){
	if(!editor) return;
	var a=_getid('runscript_wrap');
	g_option.lineWrapping=a.checked;
	localStorage['runscript_wrap']=a.checked;
	editor.setOption("lineWrapping", g_option.lineWrapping);
}
function showhotkeyhelp(){
	var s='F9 or Ctrl+Enter: Create PDF';
	//s=s+'\n\nCtrl+Space: HTML Tag Autocomplete';
	s=s+'\nCtrl+G : Jump to line';
	s=s+'\nCtrl+F : Find';
	s=s+'\nF3 or Alt+F3 : Find Next';		
	s=s+'\nCtrl+F2 or Alt+F2: Bookmark the current line';
	s=s+'\nF2: Jump to next bookmark line';	
	s=s+'\nAlt+W or Ctrl+S or Alt+S: Save';
	alert(s);
}
var gsyntaxtimer;
var gsyntaxs='clike,clojure,coffeescript,css,d,diff,django,dtd,ecl,fortran,gfm,go,groovy,haskell,htmlmixed,javascript,jinja2,livescript,lua,markdown,ntriples,pascal,perl,php,properties,python,r,rst,ruby,rust,sass,scheme,shell,smalltalk,smarty,sparql,sql,stex,tcl,tiddlywiki,vb,vbscript,velocity,verilog,xml,xquery,yaml';
var gsyntaxs2={"gfm":["xml","markdown"],"htmlmixed":["xml","javascript","css"],"htmlembedded":["xml","css"],"markdown":["xml"],"php":["xml","javascript","css","clike"]};

function proc_syntaxs(){
	function find(s){
		if(CodeMirror.modes[s])return true;
	}
	function inject(mode,src1,callback){
		var o = document.createElement('scri' + 'pt');
		o.setAttribute('src', src1);
		o.setAttribute('type', 'text/javascript');
		document.body.appendChild(o);
		clearInterval(gsyntaxtimer);
		gsyntaxtimer=setInterval(function(){
			if(find(mode)){
				//console.log(mode);
				clearInterval(gsyntaxtimer);
				callback();
			}
		},300);
	}

	var m=trim(_getid('c_syntaxs').value);
	//localStorage['c_syntaxs']=m;
	if(!m){
		editor.setOption("mode", "");
		return;
	}
	var arr=[];
	if(gsyntaxs2[m]){
		arr=(gsyntaxs2[m].join(',')+','+m).split(',');
	}else{
		arr.push(m);
	}
	//console.log(arr);
	function go(idx){
		if(idx>arr.length-1)return;
		var mode=arr[idx];
		if(!find(mode)){
			inject(mode,'js/CodeMirror5.13/mode/'+mode+'/'+mode+'.js',function(){
				if(idx==arr.length-1)editor.setOption("mode", mode);
				idx++;go(idx);
			});
		}else{
			if(idx==arr.length-1)editor.setOption("mode", mode);
			idx++;go(idx);
		}
	}
	go(0);
}


function size_width_onchange(f,noresize){
	if (f.value<parseInt(f.min)) f.value=parseInt(f.min);
	if (f.value>parseInt(f.max)) f.value=parseInt(f.max);
	_getid("div_scriptinject_script").style.width=f.value+"px";
	if (!noresize){
		proc_onresize();
		//div_scriptinject_script_onresize();
		setstorage("c_notepad_width",f.value);	
	}
}
function proc_size(){
	var a=_getid("div_size");

	var b=_getid('btn_size');
	var c=getOffset(b);
	a.style.display='';	
	var w=a.offsetWidth || 400;
	
	var diff=parseInt((w-b.offsetWidth) / 2);
	var x=c.left-diff;
	if (x+w>getWindowWidth()+getScrollLeft()-20) x=getWindowWidth()+getScrollLeft()-20-w;
	a.style.left=x+'px';
	a.style.top=(c.top+b.offsetHeight+2)+'px';	
	a.style.display='';	
}
function proc_closesize(){
	var a=_getid("div_size");
	a.style.display="none";
}
function proc_default(){
	var a=_getid("size_width");
	a.value=geditor_width;
	size_width_onchange(a);	
}
function proc_closeoutput(){
	var a=_getid("div_output");
	a.style.display="none";
}
function proc_onresize(){
	function dosize(a,center){
		if (!a) return;
		if (a.style.display=="none") return;
		var d1=document.body;
		var d2=document.documentElement;
		
		if (center){
			var w = window.innerWidth || document.body.clientWidth;
			var h = window.innerHeight || d2.clientHeight || d1.clientHeight;
			var dx=(d2.scrollLeft || d1.scrollLeft);
			var dy=(d2.scrollTop || d1.scrollTop);
			var x=dx+((w-a.clientWidth) / 2);
			var y=dy+((h-a.clientHeight) / 2);
		}else{
			var w = window.innerWidth || document.body.clientWidth;
			var dx=(d2.scrollLeft || d1.scrollLeft);
			var dy=0;
			var x=dx+((w-a.clientWidth) / 2);
			var b=_getid("btn_size");
			var c=getOffset(b);
			var y=c.top+b.offsetHeight+5;
		}
		x=parseInt(x);
		y=parseInt(y);
		if (x<dx) x=dx;
		if (y<dy) y=dy;
		a.style.left=x+"px";
		a.style.top=y+"px";
	}
	dosize(_getid("div_output"),true);

	var wh=getWindowHeight();
	var ww=getWindowWidth();
	var tabletop=_getid('tabletop');
	var tablebottom=_getid('tablebottom');
	var h=wh-(tabletop.offsetHeight+tablebottom.offsetHeight)-22;
	_getid("div_scriptinject_script").style.height=h+"px";
	div_scriptinject_script_onresize();

	var c_pdfviewer=_getid('c_pdfviewer');
	var viewer=_getid('viewer');
	var tableleft=_getid('tableleft');
	var tableedit=_getid('tableedit');
	
	var h=wh-c_pdfviewer.offsetHeight-6; //12
	viewer.style.height=h+'px';
	var w=ww-(tableleft.offsetWidth+tableedit.offsetWidth)-5;
	if(w<200) w=200;
	viewer.style.width=w+'px';
}

function guid(){
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}
function getfileext(s){
	var arr=s.split('.');
	if(arr.length>1){
		return arr[arr.length-1].toLowerCase();
	}
	return '';
}
function getfilename(s){
	var arr=s.split('.');
	if(arr.length>1){
		arr.splice(arr.length-1,1);
	}
	return arr.join('.');
}