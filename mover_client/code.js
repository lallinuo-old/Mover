var paper;
var players ={};
var myId; 
var lastUpdate = new Date().getTime();
var background;
var crosshair;
var crosshairX;
var crosshairY;


$(document).ready(function(){
	changes = true;
	paper = Raphael(0, 0, $(window).width(), $(window).height());
	background = paper.rect(0,0,10000,10000)
	background.attr("fill", "#000");


});

var socket = io.connect("http://80.222.223.155:3000");

socket.on("players",function(playerlist){

	$.each(playerlist,function(data){
		if(!players[this.guid]){
		
			players[this.guid] = paper.rect(this.x,this.y,10,10);
			players[this.guid].attr("fill",this.color);
			players[this.guid].color = this.color;
			players[this.guid].guid = this.guid;
		}else{
			if(this.guid != myId){
	
				players[this.guid].attr({"x": this.x, "y": this.y});
			}
		}
	});

})

socket.on("playerDisconnect",function(data){
	players[data].attr("fill","black");
	delete players[data];
})
socket.on("updates",function(data){

	$.each(data,function(){
		if(this.guid != myId){
			players[this.guid].attr({"x": this.x, "y": this.y});
		}
	})

});


  


socket.on("you", function(player){
	myId = player.guid;
	createCrosshair();

});
function getX(){
	return players[myId].attr("x");

}

function getY(){
	return players[myId].attr("y");
}

function createCrosshair(){
	crosshair = paper.path();
	crosshair.attr("stroke", "#fff");
	background.mousemove(function(event){
		crosshairX= event.pageX;
		crosshairY = event.pageY;
		var newPath =["M", getX()+5, getY()+5, "L", crosshairX,crosshairY];
		crosshair.attr("path",newPath);
	});	
};

function updateCrosshairStart(startX,startY){

	var newPath = ["M",getX()+5, getY()+5, "L", crosshairX,crosshairY];
	crosshair.attr("path",newPath);
}


//Moving
$(window).keydown(function(e){
	
	
	if(e.keyCode == 37){
		players[myId].attr("x",players[myId].attr("x")-3);
	}
	if(e.keyCode  == 38){
		var changes = calcDirection();
	
		players[myId].attr("y",players[myId].attr("y")+changes["y"]);
		players[myId].attr("x",players[myId].attr("x")+changes["x"]);
	}
	if(e.keyCode  == 39){
		players[myId].attr("x",players[myId].attr("x")+3);
	
	}
	if(e.keyCode  == 40){
		
	}
	updateCrosshairStart();

	if(new Date().getTime() - lastUpdate > 100){

		socket.emit("update",getPlayerInfoJSON());
		lastUpdate = new Date().getTime();
	
	}


});

function calcDirection(){
	var deltaX = getX()-crosshairX;
	var deltaY = getY()-crosshairY;

	var angle = Math.atan(deltaY/deltaX);

	 var x = Math.cos(angle) * 3;
	 var y = Math.sin(angle) * 3;
		
	 if(crosshairX <getX()){
	 	x=x*-1;
	 	y=y*-1;
	 }
	 console.log("X: "+x+" Y: "+y);
	 return {"y" : y, "x": x};

}

function getPlayerInfoJSON(){
	return {x : players[myId].attr("x"), y: players[myId].attr("y"), color: players[myId].color, guid : players[myId].guid};
}