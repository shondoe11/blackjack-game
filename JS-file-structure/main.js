/*-------------- Constants -------------*/

import { loadLeaderboard } from "./leaderboard.js";

/*---------- Variables (state) ---------*/


/*----- Cached Element References  -----*/


/*-------------- Functions -------------*/

// initialize game when DOM fully loads
function startApp() {
    console.log('Blackjack App started');
    //load related game logics and startgame
    loadLeaderboard();
    startGame(1); // start with 1 player for now 
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', startApp);