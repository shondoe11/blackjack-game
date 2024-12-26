/*--------------- Imports --------------*/

import Player from './player.js';

import { createDeck, shuffleDeck } from './deck.js'; // ES6 modules

import  { updateLeaderboard } from './leaderboard.js';

import { renderLeaderboard } from './uiController.js';

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

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const hitButton = document.getElementById('hitButton');

const standButton = document.getElementById('standButton');

const textPromptArea = document.getElementById('textPromptArea');

/*-------------- Functions -------------*/

// start game
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
    currentPlayer = players[0]; // assume 1 player first
    updateUI();
    displayMessage('Welcome to Blackjack! Place your bet to begin.')
}

//message display in textPromptArea
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
    updateHandUI(currentPlayer.hand, 'playerCards'); //! add this function later
    const playerScore = calculateScore(currentPlayer.hand);
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins this round.', 'error');
        currentPlayer.isBusted = true;
        endRound();
    } else {
        displayMessage(`You drew a card. Your current score is ${playerScore}.`, 'info');
    }
}

// handle Stand actions
function handleStand() {
    currentPlayer.isStanding = true;
    while (calculateScore(dealer.hand) < 17){
        const newCard = dealCard(dealer.hand);
        updateHandUI(dealer.hand, 'dealerCards');
    }
    displayMessage(`You chose to stand. Dealer's turn.`, 'info');
    checkWinner();
}

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
    // player blackjack
    if (playerScore === 21 && currentPlayer.hand.length === 2) {
        currentPlayer.money += currentPlayer.bet * 2.5; // 3:2 payout
        displayMessage('Blackjack! Player wins with a 3:2 payout', 'success');
        endRound();
        return;
    } // dealer blackjack
    if (dealerScore === 21 && dealer.hand.length === 2) {
        displayMessage('Dealer has Blackjack! Dealer wins this round.', 'error');
        endRound();
        return;
    } // normal win/loss logic
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins.', 'error');
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        currentPlayer.money += currentPlayer.bet * 2; // player win, their bet double
        displayMessage('Player wins this round!', 'success');
    } else if (playerScore === dealerScore) {
        currentPlayer.money += currentPlayer.bet; // tie, bet return
        displayMessage(`It's a tie! Bet returned.`, 'info');
    } else {
        displayMessage('Dealer wins this round!', 'error');
    }
    endRound();
}

// end round && reset for the next round
function endRound() {
    updateLeaderboard(currentPlayer);
    currentPlayer.bet = 0; // reset bet && hands
    currentPlayer.hand = [];
    dealer.hand = [];
    renderLeaderboard();
    updateUI();
    displayMessage('Round ended. Place your bet to start the next round!', 'info') ;
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    initializeGame(1); // start with 1 player for demo first
});

betAmountInput.addEventListener('change', handleBet);

hitButton.addEventListener('click', handleHit);

standButton.addEventListener('click', handleStand);

/*--------------- Exports --------------*/
