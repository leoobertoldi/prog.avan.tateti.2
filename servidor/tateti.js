module.exports=function (){
	var tateti={};
	var turno=0;
	var termino=false;
	var ganador=0;
	var tableroBinA=2**9;
	var tableroBinB=2**9;
	//generar respuestas
	var respuestas=[];
	(function (){
		var s1,s2,s3,s4;
		s3=s4=0;
		for (var i=0;i<3;i++){
			s1=0;
			s2=0;
			for (var j=0;j<3;j++){
					s1+=2**(i*3+j);
					s2+=2**(j*3+i);
			}
			respuestas.push(s1,s2);
			s3+=2**(i*3+i);
			s4+=2**(3*(i+1)-(i+1));
		}
		respuestas.push(s3,s4);
	})();
	var comprobarGanador=function (){
		for (var i in respuestas){
			var res=respuestas[i];
			if ((res & tableroBinA)==res) return 1;
			if ((res & tableroBinB)==res) return -1;
		}
		return 0;
	}
	//interfaz de comunicacion con la clase
	tateti.step=function (j,i){
		j*=1;
		i*=1;
		var aux=2**(j*3+i);
		if ((tableroBinA & aux) || (tableroBinB & aux) || termino){
			return false;
		}
		if (turno%2==0){
			tableroBinA+=aux;
		}
		else {
			tableroBinB+=aux;
		}
		turno++;
		ganador=comprobarGanador();
		if (ganador!=0)termino=true;
		if (turno==9)termino=true;
		return true;
	}
	tateti.iniciar=function (){
		termino=false;
		ganador=0;
		turno=0;
		tableroBinA=2**9;
		tableroBinB=2**9;
	}
	tateti.termino=function (){
		return termino;
	}
	tateti.winner=function (){
		if (ganador==1)return "x";
		if (ganador==-1)return "o";
		return "";
	}
	tateti.turn=function (){
		return turno;
	}
	tateti.tablero=function (){
		var cruces=tableroBinA.toString(2);
		var circulos=tableroBinB.toString(2);
		return {cruces:cruces,circulos:circulos};
	}
	tateti.prettyBoard=function (){
		var cruces=tableroBinA.toString(2);
		var circulos=tableroBinB.toString(2);
		var string="";
		var i=cruces.length-1;
		for (;0<i;i--){
			if (cruces[i]=="1"){
				string+="x";
			}
			else if (circulos[i]=="1"){
				string+="o"
			}
			else string+="-";
		}
		return string;
	}
	tateti.getState=function (){
		return {
			ganador:ganador,
			termino:termino,
			turno:turno,
			tablero:tateti.tablero()
		}
	}
	return tateti;
}

