var errors=require("./json/error.json");
var endpoints=require("./json/endpoints.json");
var games=require("./game.js");
var ends={};
//class
function ResponseInLogin(){
	return {
		token:"",
		name:""
	}
}
function ResponseInGame(Game){
	return {
		id:Game.id,
		board:Game.game? Game.game.prettyBoard():"---------",//xxx--ooo for example
		players:{
			circle:Game.creator,
			cross:Game.guestUpdate? Game.guest: ""
		},
		turn:Game.game? Game.game.turn(): 0,// from O to 9 
		winner:Game.game? Game.game.winner():""
	}
}
ends.login=async function (req,res){
	var response=ResponseInLogin();
	response.name=(auth.getCount()+1)+"-"+req.body.name;
	response.token=await auth.login(response.name);
	res.status(200).send(response);
}
ends.getUser=function (req,res,user,token){
	var response=ResponseInLogin();
	response.token=token;
	response.name=user;
	res.status(200).send(response);
}
ends.play=function (req,res,user,token){
	var partida=games.play(user,req.body.name);
	var response=ResponseInGame(partida);
	res.status(200).send(response);
}
ends.present=function (req,res,user,token){
	var game=games.update(user,req.body.game);
	if (game==null){
		res.status(400).send({"error":"the game doesn't exist"});
		return;
	}
	var response=ResponseInGame(game);
	res.status(200).send(response);
}
ends.move=function (req,res,user,token){
	var game=games.move(user,req.body.game,req.body.x,req.body.y);
	if (game==null){
		res.status(400).send({"error":"the game doesn't exist"});
		return;
	}
	var response=ResponseInGame(game);
	res.status(200).send(response);
}

module.exports=ends;
