/*-------------- Constants -------------*/

const initialMoney = 5000;

/*---------- Variables (state) ---------*/

let players = [];
let deck = [];

/*----- Cached Element References  -----*/


/*-------------- Functions -------------*/

import {createDeck, shuffleDeck} from './deck.js'; // ES6 modules


function initializeGame(numPlayers) {
    deck = shuffleDeck(createDeck());
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            name: `Player ${i + 1}`,
            money: initialMoney,
            hand: [],
            bet: 0,
            isStanding: false,
            isBusted: false
        });
    }
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    initializeGame(1); // start with 1 player for demo first
})
