var auth={};
var config = require('./json/config.json');
var hashTable= require("./redis.js");
var count=0;
var generateToken=function(){
	count++;
	var string=count.toString()+"-";
	for (var i=0;i<30;i++){
		let charcode=97+Math.floor(Math.random()*26);
		string+=String.fromCharCode(charcode)
	}
	return string;
}
var generateKey=function (token){
	var prefix="login-token#";
	return prefix+token;
}
auth.get=async function (token){
	var answer=null;
	var res=await hashTable.get(generateKey(token));
	if (res.data){
		let add=config.auth.expiredTime*60;//get expired time in seconds
		answer=res.data.data;
		hashTable.expandTime(generateKey(token),add);//i don't need to wait this
	}
	else ;
	return answer;
}
auth.login= async function (data){
	var answer=generateToken();
	var aux={data:data};
	var add=config.auth.expiredTime*60;//get expired time in seconds
	var res=await hashTable.set(generateKey(answer),aux,add);
	if (res.error)console.log(res.error);
	return answer;
}
auth.unlogin= async function (token){
	var answer=true;
	var res=await hashTable.delete(generateKey(token));
	if (res.error)answer=false;
	return answer;
}
auth.getCount=function (){
	return count;
}
var deleteTokens=async function (){
	var res=await hashTable.getKeys(generateKey("*"));
	if (res.data){
		for (var i in res.data){
			let key=res.data[i];
			hashTable.delete(key);
		}
	}
	else console.log(res.error);
}
deleteTokens();
module.exports=auth;
