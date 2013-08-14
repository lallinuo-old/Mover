var paper;
var players ={};
var myId; 
var changes = false;
$(document).ready(function(){

	paper = Raphael(0, 0, $(window).width(), $(window).height());
	var background = paper.rect(0,0,10000,10000)
	background.attr("fill", "#000");

	window.setInterval(function(){
		if(myId && changes){
		
			socket.emit("update",getPlayerInfoJSON());
			changes = false;
		
		}
	},100);


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

	console.log(data);
	$.each(data,function(){
		if(this.guid != myId){
			players[this.guid].attr({"x": this.x, "y": this.y});
		}
	})

});





socket.on("you", function(player){
	myId = player.guid;
});


$(window).keydown(function(e){

	if(e.keyCode == 37){
		players[myId].attr("x",players[myId].attr("x")-5);
	}
	if(e.keyCode  == 38){
		players[myId].attr("y",players[myId].attr("y")-5);
	}
	if(e.keyCode  == 39){
		players[myId].attr("x",players[myId].attr("x")+5);
	}
	if(e.keyCode  == 40){
		players[myId].attr("y",players[myId].attr("y")+5);
	}
	changes = true;
});

function getPlayerInfoJSON(){
	return {x : players[myId].attr("x"), y: players[myId].attr("y"), color: players[myId].color, guid : players[myId].guid};
}