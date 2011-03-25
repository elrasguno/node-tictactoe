var sys  = require("sys"), 
	ws   = require('./node-websocket-server/lib/ws/server'),
	game = require('./ttt.js');

var server = ws.createServer({debug: true}),
	ttt    = game.create();

// Handle WebSocket Requests
server.addListener("connection", function(conn){
	var vCmdName = 'connection',
		vResponse;

	ttt.addPlayer(conn.id);

	vResponse = {
		success : true,
		type    : "connection",
		msg     : "Player " + ttt.getPlayers().length + " has joined the table.",
		cb      : 'on' + vCmdName.toProperCase(),
		data    : { 
					"player_id"     : conn.id,
					"player_letter" : ttt.getPlayers().length === 1 ? 'X' : 'Y'
				  }
	}

	conn.send(JSON.stringify(vResponse));

	/***
	 * The following is responsible for routing all
	 * calls to the server. If the "game" object has
	 * a method matching the message.cmd property,
	 * it will be called. Otherwise, an error will be 
	 * thrown.
	 **/
	conn.addListener("message", function(message){
		var cmdObj = null,
			result = null,
			vResponse;
		
		try {
			cmdObj = JSON.parse(message);
		} catch (e) {
			// Listen to server to see this on the client side?
			conn.emit("error", "bad message");
			// Send message to client only.
			conn.send('oops');
			return false;
		}

		if (!ttt[cmdObj.cmd]) { 
			conn.emit("error", "valid cmd not passed");
			return false;
		}

		// Pass commands to ttt object if valid
		try {
			result = ttt[cmdObj.cmd].apply(ttt, [].concat((cmdObj.args || [])));
		} catch (e) {
			conn.send(JSON.stringify(e));
			return;
		}

		/***
		 * Object to be returned to game client.
		 * @param {string} type game server command that was just called.
		 * @param {string} cb   game client command that's about to be called.
		 **/
		vResponse = {
			success : true,
			type    : cmdObj.cmd,
			cb      : cmdObj.cb || 'on' + cmdObj.cmd.toProperCase(),
			data    : {
						"result" : result,
						"board"  : ttt._board,
						"player" : cmdObj.args && cmdObj.args[0]
					  }
		}

		// Send goes back to message sender, broadcast goes to everyone else.
		conn.send     (JSON.stringify(vResponse));

		/***
		 * This needs to be updated to only send to the other player of the game,
		 * not every player on the server.
		 **/
		conn.broadcast(JSON.stringify(vResponse));

		if(message == "error"){
			conn.emit("error", "test");
		}
	});
});

server.addListener("error", function(){
	console.log('error', Array.prototype.join.call(arguments, ", "));
});

server.addListener("disconnected", function(conn){
	server.broadcast("<"+conn.id+"> disconnected");
});

server.listen(8000);

// Utility function to convert "this" to "This".
if (!String.prototype.toProperCase)
{
	String.prototype.toProperCase = function(){
		return this.replace(
			/^(.)|\s(.)/g,
			function($1) { return $1.toUpperCase(); }
		);
	}
}