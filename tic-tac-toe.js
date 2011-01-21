(function() {
	this.ttt = {
		X      : 1,
		Y      : 2,

		_turnCounter : 1,
		_board : [0, 0, 0, 0, 0, 0, 0, 0, 0],
		_wins  : [123, 147, 159, 258, 357, 369, 456, 789],

		playTurn : function(rWho, rSpotIdx)
		{
			// rWho?
			if (rWho !== 'X' || rWho !== 'Y') return false;

			// Bad value, bad.
			if (isNaN(rSpotIdx) || rSpotIdx < 0 || rSpotIdx > 8) return false;
			
			// Spot is taken
			if (this._board[rSpotIdx]) return false;

			// It's not rWho's turn
			if ((this._turnCounter % 2 + 1) & this[rWho]) {
				console.log('not ' + rWho + ' turn');
				return false;
			}

			this._board[rSpotIdx] = this[rWho];
			this._turnCounter++;

			return this._isWinner(rWho);
		},

		_getMoves : function(rWho)
		{
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
				// Easy peasy
				if (this._wins[i] == vMoves) return true;
				
				// Less easy
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

