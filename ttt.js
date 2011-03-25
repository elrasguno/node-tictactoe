exports.ttt    = ttt;
exports.create = function(){
  return new ttt();
};

/***
 * A basic implementation of tic-tac-toe 
 **/
function ttt() {
	return {
		X      : 1,
		Y      : 2,

		_turnCounter : 1,
		_players     : [],
		_board       : [0, 0, 0, 0, 0, 0, 0, 0, 0],
		_wins        : [123, 147, 159, 258, 357, 369, 456, 789],
		_lastWho     : null,

		/***
		 * Add player to the game
		 *
		 * @param  {int} rID connection id
		 * @return {int} value pushed onto players array.
		 **/
		addPlayer : function(rID)
		{
			return this._players.push(rID);
		},

		/***
		 * Get list of players
		 * 
		 * @return {array} array of players
		 **/
		getPlayers : function()
		{
			return this._players;
		},

		/***
		 * Validate a player's move, then update the game board.
		 * 
		 * @param  {string}  rWho     player making the move
		 * @param  {int}     rSpotIdx slot being played
		 * @return {boolean} result of call to this._isWinner
		 **/
		playTurn : function(rWho, rSpotIdx)
		{
			console.log('_lastWho', this._lastWho);
			// rWho?
			if (rWho !== 'X' && rWho !== 'Y') 
			{
				throw {
					"type"    : "error",
					"cb"      : "error",
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
					"cb"      : "error",
					"success" : false,
					"msg"     : "Invalid slot (" + rSpotIdx + ")"
				}
			}
			
			// Spot is taken
			if (this._board[rSpotIdx])
			{
				throw {
					"type"    : "error",
					"cb"      : "error",
					"success" : false,
					"msg"     : "Invalid slot (" + rSpotIdx + " already used.)"
				}
			}

			// It's not rWho's turn
			if (rWho === this._lastWho) {
				throw {
					"type"    : "error",
					"cb"      : "error",
					"success" : false,
					"msg"     : "It's not " + rWho + "'s turn."
				}
			}

			this._board[rSpotIdx] = this[rWho];
			this._turnCounter++;
			this._lastWho = rWho;

			return this._isWinner(rWho);
		},

		/***
		 * Reset board
		 * 
		 * @return {boolean} true
		 **/
		reset : function()
		{
			this._board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
			return true;
		},

		/***
		 * Return a string representing a player's moves on the board.
		 *
		 * @param  {string} rWho current player making a move.
		 * @return {string} number representing slots a player has played in.
		 **/
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

		/***
		 * Calculate whether a player has won the game.
		 *
		 * @param  {string} rWho current player making a move.
		 * @return {boolean} true|false whether or not player has won the game.
		 **/
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
					return this._wins[i];
				}		
			}
				
			return false;
		}
	}
}
