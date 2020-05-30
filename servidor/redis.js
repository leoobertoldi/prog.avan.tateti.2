var redis = require('redis')
var redisConfig= require("./json/config.json").redis;
const redisClient = redis.createClient(redisConfig);
var inter={};
redisClient.on('connect', function() {
    console.log("redis server connected");
});
redisClient.on('error', function(err) {
    console.log("error to connect to redis server",err);
    console.log("try again");
    redisCliente=redis.createClient(redisConfig);
});
var response=function (data,error){
	return {
	data:data,
	error:error
	}
}
inter.get=function(key) {
	var res=response();
	return new Promise((resolve) => {
      redisClient.get(key, (err, result) => {
          resolve(response(JSON.parse(result),err));
      });
  });
}
inter.set=function(key, value,time) {
    return new Promise((resolve) => {
    		if (time){
		      redisClient.set(key, JSON.stringify(value),"EX",time, (err, result) => {
		          resolve(response(result,err));
		      });
        }
        else {
        	redisClient.set(key, JSON.stringify(value), (err, result) => {
		          resolve(response(result,err));
		      });
        }
    });
}
inter.delete=function(key) {
    return new Promise((resolve) => {
        redisClient.del(key, (err, result) => {
            resolve(response(result,err));
        });
    });
}
inter.expandTime=function (key,time){
	return new Promise((resolve) => {
        redisClient.expire(key,time, (err, result) => {
            resolve(response(result,err));
        });
    });
}
inter.getKeys=function(key) {
    return new Promise((resolve) => {
        redisClient.keys((key), (err, result) => {
            resolve(response(result,err));
        });
    });
}
module.exports = inter;
