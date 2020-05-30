var Tateti=require("./tateti.js");
var games={};
count=0;
function Partida(id){
	return {
		id:0,
		creator:"",
		guestCreator:new Date(),
		guestUpdate:null,
		guest:"",
		allPlayers:false,
		game:null
	}
}

var inter={};

function setInvitado(game,player){
	game.allPlayers=true;
	game.guestUpdate=new Date();
	if (game.guest==""){
		game.guest=player;
	}
	game.game=Tateti();
	return game;
}
function getMinutes(date){
	
	var mili= (new Date()).getTime()- date.getTime();
	return mili/1000/60;
}
function deleteGames(){
	for (var i in games){
		var game=games[i];
		if (game.guestCreator && 1<getMinutes(game.guestCreator)){
				game.creator="";
				game.guestCreator=null;
				if (game.guestUpdate==null){
					delete games[i];
				
				}
		}
		if (game.guestUpdate && 1<getMinutes(game.guestUpdate)){
				game.guest="";
				game.guestUpdate=null;
				game.allPlayers=false;
				if (game.creator==""){
					delete games[i];
					
				}
				else {
					game.game=null;
				}
		}
		else if (game.creator==""){
				game.creator=game.guest;
				game.guestCreator=game.guestUpdate;
				game.guest="";
				game.allPlayers=false;
				game.guestUpdate=null;
				game.game=null;
		}
	
	}
}
setInterval(deleteGames,10*1000);
inter.update=function (user,id){//0 error, 1 sin guest,2 game en marcha
	if (games[id.toString()]){
		let game=games[id];
		if (game.game!=null && game.game.termino())return game;
		if (game.guest==user && game.guestUpdate!=null){
			game.guestUpdate=new Date();
			return game;
		}
		else if (game.creator==user  && game.guestCreator!=null){
			game.guestCreator=new Date();
			if (game.allPlayers){
				return game;
			}
			return game;
		}
	}
	return null;
}
inter.getGame=function (id){
	return games[id];
}
inter.move=function (user,id,x,y){
	var game=inter.update(user,id);
	if (game && game.game && game.game.termino()==false){
		if (game.game.turn()%2==1 && user==game.creator ){
			game.game.step(y,x);
		}
		else if (game.game.turn()%2==0 && user==game.guest){
			game.game.step(y,x);	
		}
	}
	return game;
}

inter.play=function (player,creator){//creator = al campañero deseado
	
	for (var i in games){
		let game=games[i]
		if (game.game!=null)continue; //esta game ya esta en macha
		if (game.creator==creator && game.guest==player){
			return setInvitado(game,player);
		}
		if (game.guest==player && creator=="" ){
			return setInvitado(game,player);
		}
		if (game.guest=="" && creator==game.creator ){
			return setInvitado(game,player);
		}
		if (game.guest=="" && creator=="" ){
			return setInvitado(game,player);
		}
	}
	var game=new Partida();
	count++;
	game.id=count;
	game.guest=creator;
	game.guestCreator=new Date();
	game.creator=player;
	games[game.id]=game;
	return game;
	
}
module.exports=inter;
