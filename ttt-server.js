var sys = require("sys")
, ws = require('./node-websocket-server/lib/ws/server');

var ttt = new (function () {
	return {
		X      : 1,
		Y      : 2,

		_turnCounter : 1,
		_players     : [],
		_board       : [0, 0, 0, 0, 0, 0, 0, 0, 0],
		_wins        : [123, 147, 159, 258, 357, 369, 456, 789],
		_lastWho     : null,

		addPlayer : function(rID)
		{
			this._players.push(rID);
		},

		getPlayers : function()
		{
			return this._players;
		},

		playTurn : function(rWho, rSpotIdx)
		{
			console.log('_lastWho', this._lastWho);
			// rWho?
			if (rWho !== 'X' && rWho !== 'Y') 
			{
				throw {
					"type"    : "error",
					"success" : false,
					"msg"     : "Invalid player (" + rWho + ")"
				}
			}

			// Bad value, bad. Also, make sure rSpotIdx is whole.
			rSpotIdx = parseInt(rSpotIdx) >> 0;
			if (isNaN(rSpotIdx) || rSpotIdx < 0 || rSpotIdx > 8) 
			{
				throw {
					"type"    : "error",
					"success" : false,
					"msg"     : "Invalid slot (" + rSpotIdx + ")"
				}
			}
			
			// Spot is taken
			if (this._board[rSpotIdx])
			{
				console.log('test 001');
				throw {
					"type"    : "error",
					"success" : false,
					"msg"     : "Invalid slot (" + rSpotIdx + " already used.)"
				}
				console.log('test 002');
			}

			// It's not rWho's turn
			if (rWho === this._lastWho) {
				throw {
					"type"    : "error",
					"success" : false,
					"msg"     : "It's not " + rWho + "'s turn."
				}
			}

			this._board[rSpotIdx] = this[rWho];
			this._turnCounter++;
			this._lastWho = rWho;

			return this._isWinner(rWho);
		},

		_getMoves : function(rWho)
		{
			console.log('getMoves', rWho, Array.prototype.join.call(this._board, ', '));
			var res = '', i;
			for (i=0, l=this._board.length; i < l; i++)
			{
				if (this._board[i] === this[rWho]) { 
					res += (parseInt(i)+1); 
				}
			}
			return res;
		},

		_isWinner : function(rWho)
		{
			var vMoves = this._getMoves(rWho),
				vSplit, i;
			if (!vMoves) return false;
			
			for (i=0, l=this._wins.length; i < l; i++)
			{
				vSplit = this._wins[i].toString().split('');
				if (vMoves.indexOf(vSplit[0]) !== -1 &&
					vMoves.indexOf(vSplit[1]) !== -1 &&		
					vMoves.indexOf(vSplit[2]) !== -1) {
					return true;
				}		
			}
				
			return false;
		}
	}
})();

var server = ws.createServer({debug: true});

// Handle WebSocket Requests
server.addListener("connection", function(conn){
	var vResponse;
	ttt.addPlayer(conn.id);

	vResponse = {
		success : true,
		type    : "connection",
		msg     : "Player " + ttt.getPlayers().length + " has joined the table.",
		data    : { 
					"player_id"     : conn.id,
					"player_letter" : ttt.getPlayers().length === 1 ? 'X' : 'Y'
				  }
	}
	conn.send(JSON.stringify(vResponse));

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
			result = ttt[cmdObj.cmd].apply(ttt, [].concat(cmdObj.args));
		} catch (e) {
			conn.send(JSON.stringify(e));
			return;
		}

		vResponse = {
			success : true,
			type    : cmdObj.cmd,
			data    : {
						"result" : result,
						"board"  : ttt._board,
						"player" : cmdObj.args[0]
					  }
		}

		// Send goes back to message sender, broadcast goes to everyone else.
		conn.send     (JSON.stringify(vResponse));
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