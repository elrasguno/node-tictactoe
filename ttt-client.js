var conn, recvd, connections = 0;
var connect = function() {
  if (window["WebSocket"]) {
    recvd = 0;
    //host = (document.location.host != "" ? document.location.host : "localhost:8000");
    host = "localhost:8000";
    conn = new WebSocket("ws://"+host+"/test");
    conn.onmessage = function(evt) {
		var vResponse;

		try {
			vResponse = JSON.parse(evt.data);	
		} catch (e) {
			log(evt.data);
			return;
		}

		// Parse evt.data and route to appropriate function.
		if (tttcli[vResponse.type]) 
		{	
			tttcli[vResponse.type](vResponse);	
		} else {
			console.log('whoops', vResponse);
		}
		vResponse.msg && log(vResponse.msg);
    };
    
    conn.onerror = function() {
      log("error", arguments);
    };
    
    conn.onclose = function() {
      log("closed");
    };

    conn.onopen = function() {
      log("opened");
    };
  }
};

var tttcli = (function() {
	return {
		_player_id     : null,
		_player_letter : null,

		getPlayerID     : function()  { return this._player_id;         },
		setPlayerID     : function(v) { return this._player_id = v;     },
		getPlayerLetter : function()  { return this._player_letter;     },
		setPlayerLetter : function(v) { return this._player_letter = v; },

		// Set values after successfull connection;
		connection : function(rRespObj)
		{
			var vData = (rRespObj && rRespObj.data);
			if (!vData) return false;

			console.log('tttcli.connection', rRespObj);
			if (vData.player_id && vData.player_letter)
			{
				this.setPlayerID(vData.player_id);
				this.setPlayerLetter(vData.player_letter);
			}
		},

		// Called after successful run of playTurn
		playTurn : function(rRespObj)
		{
			var vData  = rRespObj.data, 
				vBoard = vData && vData.board;
			console.log('playTurn', rRespObj);

			// Check result for true (win)
			if (vData.result === true)
			{
				console.log('WINNER', vData.player);
			}

			if (!vBoard || (vBoard && !vBoard.length)) 
			{
				return false;
			}

			// Update board.
			$.each(vBoard, function(k, v) {
				$('#space_' + k).html(( v === 1 ? 'X' :
										v === 2 ? 'Y' : '&nbsp;'));
			});
		}
	}
})();

$(document).ready(function() {
	connect();
	console.log('ttlcli', tttcli);
	// Store player info returned from server.

	$('#ttt_container').click(function(rEvt) {
		var vSlotIdx, vPlayer, vCmdObj;
		// Get slot # from rEvt.target.id
		vSlotIdx = parseInt(rEvt.target.id.split('_')[1]);

		// Get stored player number/letter
		vPlayer  = tttcli.getPlayerLetter();

		// Pass command
		vCmdObj  = {
			"cmd"  : "playTurn",
			"args" : [vPlayer, vSlotIdx] 
		};
		console.log('click', vSlotIdx, vPlayer, vCmdObj);

		conn.send(JSON.stringify(vCmdObj));

		// Throw error on failure

		// Update UI on success

		// { "cmd" : "playTurn", "args" : ["X", 1]}
	});
});
