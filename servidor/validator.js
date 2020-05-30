var validate={};
var controls={};
controls.date=function (value,json){
	var res={
			error:0,
			data:"",
			error0data:{}
	};
	if ((value==undefined || value==="" || value==null) && json.default!=undefined){
		res.data=json.default;
		if (res.data=="now"){
			let aux=new Date();
			res.data=aux.toISOString();
		}
		else {
			let aux=new Date(json.default);
			res.data=aux.toISOString();
		}
		return res;
	}
	if (typeof value!="string"){
		res.error0data.type="stringDate";
		res.error=1;
		return res;
	}
	var date=new Date(value);
	if (date.valueOf().toString() =="NaN"){
		res.error0data.type="stringDate";
		res.error=1;
		return res;
	}
	if (json.start){
		let aux;
		if (json.start=="now"){
			aux=new Date();
		}
		else {
			aux=new Date(json.start);
		}
		if (date<aux){
			res.error0data.start=json.start;
			res.error=1;
			return res;
		}
	}
	if (json.end){
		let aux;
		if (json.start=="now"){
			aux=new Date();
		}
		else {
			aux=new Date(json.end);
		}
		if (aux<date){
			res.error0data.end=json.end;
			res.error=1;
			return res;
		}
	}
	res.data=date.toISOString();
	return res;
}
controls.string=function (value, json){
	var res={
		error:0,
		data:"",
		error0data:{}
	};
	if ((value==undefined || value=="") && json.default!=undefined){
		res.data=json.default;
		return res;
	}
	if (typeof value!="string"){
		res.error0data.type="string";
		res.error=1;
	}
	else if(json.RegExp && !(new RegExp(json.RegExp[0],json.RegExp[1])).test(value)){
		res.error0data.RegExp=json.RegExp;
		res.error=1;
	}
	else if (json.maxLength<value.length){
		res.error0data.maxLength=json.maxLength;
		res.error=1;
	}
	else if (value.length<json.minLength){
		res.error0data.minLength=json.minLength;
		res.error=1;
	}
	if (!res.error){
		res.data=value;
	}
	
	return res;
}
controls.int=function (value, json){
	let res={
		error:0,
		data:"",
		error0data:{}
	};
	if (value==undefined && json.default!=undefined){
		res.data=value;
	}
	else {
		value*=1;
		value=value.toFixed(0)*1;
		if (value.toString()=='NaN'){
			res.error=1;
			res.error0data.type="int";
		}
		else if (json.max<value){
			res.error=1;
			res.error0data.max=json.max;
		}
		else if (value<json.min){
			res.error=1;
			res.error0data.min=json.min;
		}
	}
	if (!res.error){
		res.data=value;
	}
	return res;
}
validate.input=function (value,json){
	var res= controls[json.type](value,json);
	return res;
}
validate.inputs= function (values,formats){
	var res={
		error:0,
		data:{},
		error0data:{}
	}
	for (var key in formats){
		let aux=validate.input(values[key],formats[key]);
		if (aux.error){
			res.error=1;
			res.error0data[key]=aux.error0data;
			res.error0data[key].value=values[key];
		}
		else {
			res.data[key]=aux.data;
			if (values[key]!=aux.data){
				values[key]=aux.data;
			}
		}
	}
	return res;
}
module.exports=validate;
