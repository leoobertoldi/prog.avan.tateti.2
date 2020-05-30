import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as libasync from "./libasync.js"
import * as libcookies from "./libcookies.js"
//--globals var
var host="http://"+window.location.hostname+":3001";
var consulta=libasync.ajax();
consulta.method="post";
consulta.headers.Authorization="";
//--classes react 

class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.parent=props.parent;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(event) {
    this.setState({value: event.target.value});
  }
  async handleSubmit(event) {
  	consulta.url=host+"/login";
  	consulta.method="post";
  	consulta.bodyArgs={name:this.state.value};
  	var res=await consulta.send();
  	if (res.status==200 && res.json){
  		consulta.headers.Authorization=res.json.token;
  		this.parent.setState({logeado:true,user:res.json.name});
  		libcookies.setCookie("token",res.json.token,1);
  	}
  	else if (res.status==400){
  		alert("El nombre solo debe tener caracteres alfabeticos,con un min 5 y un max de 10");
  	}	
  }

  render() {
  	if (!this.parent.state.logeado){
		  return (
		    <div  >
		      <label>
		        Name:
		        <input type="text" value={this.state.value} onChange={this.handleChange} />
		      </label>
		      <button onClick={this.handleSubmit}>
  					Enviar
	      	</button>
		    </div>
		  )
    }
    else return (null);
  }
}
class FormPartida extends React.Component {
	constructor(props) {
		super(props);
	 	this.state = {value: ''};
    this.parent=props.parent;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    
	}
	handleChange(event) {
    this.setState({value: event.target.value});
  }
	async handleSubmit(event) {
  	consulta.url=host+"/play";
  	consulta.method="post";
  	consulta.bodyArgs.name=this.state.value;
  	this.parent.setState({cruces:"",circulos:"",estado:""});
  	var res=await consulta.send();
  	if (res.status==200 && res.json){
  		this.parent.partida=res.json.id;
  		
  		this.parent.setState({joined:true});
  	}
  	else if (res.status==401){
  		this.parent.setState({logeado:false});
  	}	
  }
	render (){
		if (!this.parent.state.logeado)return (null);
		return (
			<div>
	      <label>
	        <input placeholder="mate" 
	        type="text" value={this.state.value} onChange={this.handleChange} />
	      </label>
	      <button onClick={this.handleSubmit}>
  					Enviar
      	</button>
	    </div>
		);
	}
}
class Board extends React.Component {
	constructor(props) {
    super(props);
    this.parent=props.parent;
    this.move = this.move.bind(this)
    this.state={
    	 youAre:"",
		   yourRivalName:"",
		   yourRival:"",
		   board:"---------",
		   estado:""
  	};
  	this.turno=0;
    this.darpresente=true;
    if (this.parent.hilo)clearInterval(this.parent.hilo);
    this.parent.hilo=setInterval(()=>{this.presente()},1000);
	}
	updateState(json){
		var final=json.winner? <div>Gano {json.winner}</div>:"";
		if (!final && 9<=json.turn)final=<div>Empate</div>;
		this.turno=json.turn;
		var youAre="X";
		if (json.players.circle==json.players.cross){
			youAre="X y O";
		}
		else if (json.players.circle==this.parent.state.user){
			youAre="O";
		}
		this.setState({
			youAre:youAre,
			board:json.board,
			yourRival:json.players.circle==this.parent.state.user? 'X' : 'O',
			yourRivalName:json.players.circle==this.parent.state.user?json.players.cross:json.players.circle,
			estado:final
			
		});
	}
	async presente(event){
		if (this.parent.state.joined==false)return;
		if (this.darpresente===false) {
			this.darpresente=true;
			return;
		}
		var consulta2=libasync.ajax();
		consulta2.headers=consulta.headers;
		consulta2.method="put";
		consulta2.bodyArgs={game:this.parent.partida};
		consulta2.url=host+"/present";
  	var res=await consulta2.send();
  	if (res.status==200 && res.json){
  		this.updateState(res.json);
  	}
	}
	async move(event){
		var y=event.target.getAttribute("pos")*1;
		var x=y%3;
		y=parseInt(y/3);
		this.darpresente=false;
		consulta.method="put";
		consulta.url=host+"/move";
  	consulta.bodyArgs={game:this.parent.partida,x:x,y:y};
  	var res=await consulta.send();
  	var turno=this.turno;
  	if (res.status==200 && res.json){
  		this.darpresente=false;
  		this.updateState(res.json);
  		if (turno==this.turno && res.json.winner=="" && this.turno<9 && this.state.yourRivalName){
  			if (res.json.players.circle==res.json.players.cross){
  				this.setState({estado:<div>Esa casilla esta ocupada</div>})
  			}
  			else if (turno%2==0 && this.state.youAre=="X"){
  				this.setState({estado:<div>Esa casilla esta ocupada</div>});
  			}
  			else if (turno%2==1 && this.state.youAre=="O"){
  				this.setState({estado:<div>Esa casilla esta ocupada</div>});
  			}
  			else {
  				this.setState({estado:<div>No es tu turno</div>});
  			}
  		}
  	}
  	else if (res.status==401){
  		
  	}	
	}
	render (){
		if (!this.parent.state.logeado || !this.parent.state.joined)return (null);
		var elems=[];
		var style={width:100,height:100};
		for (var i=0;i<9;i++){
			if (i%3===0){
				elems.push(<br/>);
			}
			elems.push(
				<button style={style} pos={i} onClick={this.move}> 
					{this.state.board[i]} 
				</button>
			);
		}
		return (
			<div>
			Eres:
			{this.state.youAre}<br/>
			Juegas contra:{this.state.yourRivalName}<br/>
			{this.state.estado}
			{elems}
			</div>
		);
	}
}
class App extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
     logeado:false,
     user:"",
     joined:false,
    };
  	this.getUser();
	}
	async getUser(){
		consulta.headers.Authorization=libcookies.getCookie("token");
		consulta.method="get";
  	consulta.url=host+"/user";
  	var res=await consulta.send();
  	if (res.status==200 && res.json){
  		this.setState({user:res.json.name,logeado:true});
  	}
  	else if (res.status==401){
  		
  	}
	}
  render() {
  	return (
		  <div className="App">
		    <header className="App-header">
		    <h2>{this.state.user}</h2>
		    	<Form 
		    		parent={this}
    			/>
		    	<FormPartida parent={this} />
		      <Board parent={this}/>
		    </header>
		  </div>
		);
  }
}

export default App;
