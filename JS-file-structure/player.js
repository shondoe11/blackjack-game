/*-------------- Constants -------------*/

// no const needed for player class

/*---------- Variables (state) ---------*/

// player class will always change its state (name, money, currentBet)

/*----- Cached Element References  -----*/

// NA

/*-------------- Functions -------------*/

// require player input to act
class Player {
    constructor(name, money = 5000) {
        this.name = name;
        this.money = money;
        this.currentBet = 0; // bet tracking current round
    }
    // placing bet
    placeBet(betAmount) {
        if (betAmount < 50) {
        return {success: false, message:'Bet must be at least $50.'};
        }
        if (betAmount > this.money) {
            return {success: false, message: `You don't have enough money to place this bet.`};
        }
        this.money -= betAmount;
        this.currentBet = betAmount;
        return {success: true, message: `Bet of $${betAmount} placed.`};
    }
}

/*----------- Event Listeners ----------*/
// NA

export default Player;
