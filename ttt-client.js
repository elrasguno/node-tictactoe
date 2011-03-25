var conn, recvd, connections = 0;
var connect = function() {
  if (window["WebSocket"]) {
    recvd = 0;
    //host = (document.location.host != "" ? document.location.host : "localhost:8000");
    host = "localhost:8000";
    conn = new WebSocket("ws://"+host+"/test");

	/***
	 * Code responsible for processing server messages
	 * and routing them to the right game client methods.
	 * Throws an error if game client method doesn't exist.
	 **/
    conn.onmessage = function(evt) {
		var vResponse;

		try {
			vResponse = JSON.parse(evt.data);	
		} catch (e) {
			log(evt.data);
			return;
		}

		// Parse evt.data and route to appropriate function.
		if (tttcli[vResponse.cb]) 
		{	
			tttcli[vResponse.cb](vResponse);	
		} else {
			console.log('Warning', 'The function ' + vResponse.cb + ' has not been implemented.', vResponse);
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
		onConnection : function(rRespObj)
		{
			var vData = (rRespObj && rRespObj.data);
			if (!vData) return false;

			console.log('tttcli.onConnection', rRespObj);
			if (vData.player_id && vData.player_letter)
			{
				this.setPlayerID(vData.player_id);
				this.setPlayerLetter(vData.player_letter);
			}
		},

		// Called after successful run of playTurn
		onPlayTurn : function(rRespObj)
		{
			var vData  = rRespObj.data, 
				vBoard = vData && vData.board;
			console.log('onPlayTurn', rRespObj);

			// Check result for true (win)
			if (vData.result)
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

				// Highlight space letter if there's a winner.
				if (vData.result &&
				 	vData.result.toString().indexOf(k+1) !== -1) {
					$('#space_' + k).css('color', '#090');
				}
			});
		},

		// Clear the board
		onReset : function()
		{
			console.log('tttcli.onReset');
			$('#ttt_container > ul > li').html('&nbsp;').css('color', '#000');
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

		// Stop if something other than a slot in the container was clicked.
		if(isNaN(vSlotIdx)) return false;

		// Get stored player number/letter
		vPlayer  = tttcli.getPlayerLetter();

		// Pass command
		vCmdObj  = {
			"cmd"  : "playTurn",
			"args" : [vPlayer, vSlotIdx],
			"cb"   : "onPlayTurn"
		};
		console.log('click', vSlotIdx, vPlayer, vCmdObj);

		conn.send(JSON.stringify(vCmdObj));
	});

	$('#reset_button').click(function(rEvt) {
		// Pass command
		vCmdObj  = {
			"cmd"  : "reset",
			"cb"   : "onReset"
		};
		conn.send(JSON.stringify(vCmdObj));
	});
});
