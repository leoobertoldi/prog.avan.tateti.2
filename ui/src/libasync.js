export function ajax (method="post",url="",bodyArgs={},getArgs={},headers={}){
	var retorno={};
	retorno.method=method;
	retorno.url=url;
	retorno.bodyArgs=bodyArgs;
	retorno.getArgs=getArgs;
	retorno.headers=headers;
	retorno.response={status:0,json:null,string:null};
	retorno.onload=null;
	retorno.send=async function (){
		return new Promise(resolve =>{
			var json = JSON.stringify(retorno.bodyArgs);
			var ajax = new XMLHttpRequest();
			var promesa=this;
			ajax.onloadend=function(){
				retorno.response.status=this.status;
				retorno.response.string=this.responseText;
				try {
					retorno.response.json=JSON.parse(this.responseText);
				}
				catch (e){
					retorno.response.json=null
				}
				
				if (typeof  retorno.onload=="function"){
					
					setTimeout(function (){retorno.onload(retorno)},50);
				}
				resolve(retorno.response);
			}
			var params =new URLSearchParams(retorno.getArgs).toString();
			if (params)params="?"+params;
			ajax.open( retorno.method,  retorno.url+params, true );
			if (retorno.headers){
				for (var k in retorno.headers){
					ajax.setRequestHeader(k,retorno.headers[k]);
				}
			}
			ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		
			ajax.send( JSON.stringify(retorno.bodyArgs) );
		})
	}
	return retorno;
}
export function loadImage(src){
	return new Promise(function (resolve){
		var img=new Image();
		img.onload=function (){
			resolve(this);
		}
		img.onerror=function (){
			
			resolve(null);
		}
		img.src=src;
	
	});
}


