var io = require('socket.io').listen(3000);
var players = {};
var updates = {};
var _ = require("underscore");


io.sockets.on('connection', function (socket) {
	var player = {x: 100, y: 100, color: get_random_color(), guid : generateUUID()};
	players[player.guid] = player;
	socket.set("guid", player.guid);
	socket.emit('players', players);
	socket.broadcast.emit("players",players);
	socket.emit("you",player);

	socket.on("update", function(data){
		console.log("we got some updates");
		players[data.guid] = data;
		updates[data.guid] = data;
	})

	socket.on("disconnect", function(){
		socket.get("guid",function(err,guid){

			delete players[guid];
			socket.broadcast.emit("playerDisconnect",guid);
		})
	})

	setInterval(function(){
		
		if(_.size(updates) > 0){
			socket.emit("updates", updates);
			socket.broadcast.emit("updates", updates);
			console.log("changes sent");
			updates= {};
		}
	},100)
});



function get_random_color() {

	return "#"+((1<<24)*Math.random()|0).toString(16);
}

function generateUUID(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x7|0x8)).toString(16);
	});
	return uuid;
};
