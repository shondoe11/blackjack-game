/*--------------- Imports --------------*/

import Player from './player.js';

import { createDeck, shuffleDeck } from './deck.js'; // ES6 modules

import  { leaderboard, loadLeaderboard, updateLeaderboard } from './leaderboard.js';

import { updateHandUI, renderLeaderboard } from './uiController.js';

/*-------------- Constants -------------*/

const initialMoney = 5000;

const MIN_BET = 50;

/*---------- Variables (state) ---------*/

let players = [];

let deck = [];

let currentPlayer = null; // tracks current player in game

let dealer = {
    name: 'Dealer',
    hand: [],
};

/*----- Cached Element References  -----*/

const betAmountInput = document.getElementById('betAmount');
window.betAmountInput = betAmountInput; // step 5 test betting mechanics

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const hitButton = document.getElementById('hitButton');

const standButton = document.getElementById('standButton');

const textPromptArea = document.getElementById('textPromptArea');

/*-------------- Functions -------------*/

// start game with preset conditions
function startGame(numPlayers) {
    // console.log('startGame called'); // step 5 test gameStart
    players = [];
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
    currentPlayer = players[0]; // assume 1 player first
    dealer.hand = [];
    window.currentPlayer = players[0]; 
    // console.log('Players:', players); // step 5 test gameStart
    // console.log('Dealer:', dealer); // step 5 test gameStart
    // console.log('Deck:', deck); // step 5 test gameStart
    updateUI();
    displayMessage('Welcome to Blackjack! Place your bet to begin.')
}
window.startGame = startGame; // step 5 test gameStart

// message display in textPromptArea
function displayMessage(message, type ='info') {
    textPromptArea.textContent = message;
    if (type === 'error') {
        textPromptArea.style.color = 'red';
    } else if (type === 'success') {
        textPromptArea.style.color = 'green';
    } else {
        textPromptArea.style.color = 'black'; //default for info msgs
    }
}

// placing bet
function handleBet() {
    const betAmount = Number(betAmountInput.value);
    if (isNaN(betAmount) || betAmount < MIN_BET) {
        displayMessage('Bet must be a valid number and at least $50.', 'error');
        return;
    }
    if (betAmount > currentPlayer.money) {
        displayMessage('Insufficient monies to place this bet.', 'error');
        return;
    }
    currentPlayer.money -= betAmount;
    currentPlayer.bet = betAmount;
    displayMessage(`Bet of $${betAmount} placed. Good luck!`, 'success');
    updateUI();
}

window.handleBet = handleBet; // step 5 test betting mechanics

// update UI
function updateUI() {
    playerMoneyDisplay.textContent = `Money: $${currentPlayer.money}`;
    playerScoreDisplay.textContent = `Bet: $${currentPlayer.bet}`;
}

// deal card to player
function dealCard(hand) {
    const card = deck.pop();
    hand.push(card);
    return card;
}

// handle Hit actions
function handleHit() {
    const newCard = dealCard(currentPlayer.hand);
    console.log('Player drew a card:', newCard); //step 5 debug
    updateHandUI(currentPlayer.hand, 'playerCards');
    const playerScore = calculateScore(currentPlayer.hand);
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins this round.', 'error');
        currentPlayer.isBusted = true;
        endRound();
    } else {
        displayMessage(`You drew a card. Your current score is ${playerScore}.`, 'info');
    }
}
window.handleHit = handleHit; 

// handle Stand actions
function handleStand() {
    currentPlayer.isStanding = true;
    displayMessage(`You chose to stand. Dealer's turn.`, 'info');
    updateHandUI(dealer.hand, 'dealerCards', false);
    while (calculateScore(dealer.hand) < 17){
        const newCard = dealCard(dealer.hand);
        console.log('Dealer drew a card:', newCard); //step 5 debug
        updateHandUI(dealer.hand, 'dealerCards', false);
    }
    updateHandUI(dealer.hand, 'dealerCards', true);
    checkWinner();
}
window.handleStand = handleStand;

// Calculate hand scores
function calculateScore(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach (card => {
        total += card.value;
        if (card.rank === 'Ace') aces++;
    });
    while (total > 21 && aces > 0) {
        total -= 10; // conversion for Ace (11 || 1)
        aces--;
    }
    return total;
}

// Check winner of round
function checkWinner() {
    const playerScore = calculateScore(currentPlayer.hand);
    const dealerScore = calculateScore(dealer.hand);
    // player BJ
    if (playerScore === 21 && currentPlayer.hand.length === 2) {
        currentPlayer.money += currentPlayer.bet * 2.5; // 3:2 payout
        displayMessage('Blackjack! Player wins with a 3:2 payout', 'success');
        endRound();
        return;
    }
    // dealer BJ
    if (dealerScore === 21 && dealer.hand.length === 2) {
        displayMessage('Dealer has Blackjack! Dealer wins this round.', 'error');
        endRound();
        return;
    }
    // player bust
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins this round.', 'error');
        endRound();
        return;
    }
    // dealer bust
    if (dealerScore > 21) {
        currentPlayer.money += currentPlayer.bet * 2; // Double payout for player win
        displayMessage('Dealer busts! Player wins this round!', 'success');
        endRound();
        return;
    }
    // tie
    if (playerScore === dealerScore) {
        currentPlayer.money += currentPlayer.bet; // Bet returned to player
        displayMessage(`It's a tie! Bet returned.`, 'info');
        endRound();
        return;
    }
    // normal win/loss
    if (playerScore > dealerScore) {
        currentPlayer.money += currentPlayer.bet * 2; // Double payout for player win
        displayMessage('Player wins this round!', 'success');
    } else {
        displayMessage('Dealer wins this round!', 'error');
    }

    endRound(); 
}

// end round && reset for the next round
function endRound() {
    // reset first
    currentPlayer.bet = 0;
    currentPlayer.hand = [];
    dealer.hand = [];
    updateLeaderboard(currentPlayer);
    console.log('Leaderboard before rendering:', leaderboard); // Debugging
    renderLeaderboard(leaderboard);
    updateUI();
    // don't override winner message
    if (!textPromptArea.textContent.includes('wins') && !textPromptArea.textContent.includes('tie')) {
        displayMessage('Round ended. Place your bet to start the next round!', 'info');
    }
}
window.endRound = endRound // step 5 test bet mechanics

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard(); // load from localStorage 
    startGame(1); // start with 1 player for demo first
});

betAmountInput.addEventListener('change', handleBet);

hitButton.addEventListener('click', handleHit);

standButton.addEventListener('click', handleStand);

/*--------------- Exports --------------*/
