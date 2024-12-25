/*-------------- Constants -------------*/

import Player from './player.js'

import {createDeck, shuffleDeck} from './deck.js'; // ES6 modules

const initialMoney = 5000;

const MIN_BET = 50;

/*---------- Variables (state) ---------*/

let players = [];

let deck = [];

let currentPlayer = null; // tracks current player in game

/*----- Cached Element References  -----*/

const betAmountInput = document.getElementById('betAmount');

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const hitButton = document.getElementById('hitButton')

const standButton = document.getElementById('standButton')

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
    //! add dealer logic if needed later
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
    //! Placeholder logic for dealer, implement later
    const dealerScore = 17; // assume static dealer score for now
    if (playerScore > 21) {
        displayMessage('Player busts! Dealer wins.', 'error');
    } else if (dealerScore > 21 || playerScore > dealerScore) {
        displayMessage('Player wins this round!', 'success');
    } else if (playerScore === dealerScore) {
        displayMessage(`It's a tie!`, 'info');
    } else {
        displayMessage('Dealer wins this round!', 'error');
    }
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    initializeGame(1); // start with 1 player for demo first
});

betAmountInput.addEventListener('change', handleBet);
hitButton.addEventListener('click', handleHit);
standButton.addEventListener('click', handleStand);
