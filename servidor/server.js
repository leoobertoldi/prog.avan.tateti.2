global.auth = require('./auth.js');
const express = require("express");
const ends= require("./endpoints.js");
const routes= require("./json/endpoints.json");
const validator= require("./validator.js");
const config= require("./json/config.json");
const  bodyParser = require('body-parser')
const server = express();
//habilito cors para poder trabajar con el server developer de react... en produccion sacar.. 
server.use(function(req, res, next) {
	res.header("Access-Control-Allow-Methods",'GET,POST,PUT,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.listen(config.http.port, ()=> {
	console.log("the server is working in the port:",config.http.port);
});
server.use('/ui', express.static('../ui/build'));
console.log("UI: http://localhost:"+config.http.port+"/ui");
function getValidations(json){
	var res={};
	for (var key in json){
		var arg=json[key];
		if (routes.args[arg]){
			res[key]=routes.args[arg]
		}
	}
	return res;
}

function binding(server,route,end){
	server[route.method](route.path, async function (req,res){
		var data={};
		var error=false;
		var user=null;
		var token=req.headers.authorization;
		if (token){
				user=await auth.get(token);
		}
		if (route.user && user==null){
			res.status(401).send("Login is Required");
			return;
		}
		if (route.getArgs){
			let validations=validator.inputs(req.query,getValidations(route.getArgs));
			if (validations.error){
				error=true;
				data.getArgs=validations.error0data;
			}
		}
		if (route['urlArgs']){
			let validations=validator.inputs(req.params,getValidations(route.urlArgs));
			if (validations.error){
				error=true;
				data.urlArgs=validations.error0data;
			}
			
		}
		if (route['bodyArgs']){
			let validations=validator.inputs(req.body,getValidations(route.bodyArgs));
			if (validations.error){
				error=true;
				data.bodyArgs=validations.error0data;
			}
			
		}
		if(!error){
			await end(req,res,user,token);
		}
		else {
			res.status(400).send(data)
		}
	});
}
//bindear routes con end-points archivos routes.json y endpoints.js
for (var key in routes.ends){
	let aux=routes.ends[key];
	if (ends[key]){
		binding(server,aux,ends[key]);
		console.log("binding route:",aux.method,aux.path,"=>key:",key);
	}
	else {
		console.log("warning route cannot bind:",aux.path,"=>key:",key);
	}
}
