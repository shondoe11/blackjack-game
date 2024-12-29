/*--------------- Imports --------------*/

import Player from './player.js';

import { createDeck, shuffleDeck } from './deck.js';

import  { leaderboard, loadLeaderboard, updateLeaderboard, saveLeaderboard } from './leaderboard.js';

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

const textPromptArea = document.getElementById('textPromptArea');

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const betAmountInput = document.getElementById('betAmount');
window.betAmountInput = betAmountInput; // step 5 test betting mechanics

const betButton = document.getElementById('betButton');

const hitButton = document.getElementById('hitButton');

const standButton = document.getElementById('standButton');

const cashOutButton = document.getElementById('cashOutButton');

const resetButton = document.getElementById('resetButton');

/*-------------- Functions -------------*/

// start game with preset conditions
function startGame(numPlayers) {
    // console.log('startGame called'); // step 5 test gameStart
    players = [];
    deck = shuffleDeck(createDeck());
    window.deck = deck; // debugging
    console.log('confirm deck initialized: ', deck); // debugging
    for (let i = 0; i < numPlayers; i++) {
        players.push({
            name: `Player ${i + 1}`,
            money: initialMoney,
            hand: [],
            bet: 0,
            isStanding: false,
            isBusted: false,
        });
    }
    currentPlayer = players[0]; // assume 1 player first
    dealer.hand = [];
    console.log('Players:', players); // debugging
    console.log('Dealer:', dealer); // debugging
    window.currentPlayer = players[0]; 
    // console.log('Players:', players); // step 5 test gameStart
    // console.log('Dealer:', dealer); // step 5 test gameStart
    // console.log('Deck:', deck); // step 5 test gameStart
    displayMessage('Welcome to Blackjack! Place your bet to begin.')
    updateUI();
    resetGameControls();
}
window.startGame = startGame; // step 5 test gameStart

let currentMessage = ''; // track current msg
// message display in textPromptArea
function displayMessage(message, type ='info') {
    if (currentMessage === message) {
        // wont override same msg
        return;
    }
    currentMessage = message; // update current msg
    console.log('displayMessage called with: ', message, type); // debugging
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
    console.log('handleBet called'); // debugging
    if (betButton.disabled) {
            console.log('Bet Button disabled. Showing message.'); // debugging
            displayMessage('You have already placed your bet. Please continue with the other options!', 'info');
             return;
        }
    console.log('Bet Button Disabled:', betButton.disabled); // debugging
    betButton.disabled = true;
    currentMessage = '';
    const betAmount = Number(betAmountInput.value || MIN_BET);
    console.log('Bet Amount Input Value:', betAmount); // debugging
    if (isNaN(betAmount) || betAmount < MIN_BET) {
        console.log('Invalid bet amount:', betAmount); // debugging
        displayMessage('Bet must be a valid number and at least $50.', 'error');
        betButton.disabled = false;
        return;
    }
    if (betAmount > currentPlayer.money) {
        console.log('bet exceeds current money:', currentPlayer.money); // debugging
        displayMessage('Insufficient monies to place this bet.', 'error');
        betButton.disabled = false;
        return;
    }
    currentPlayer.money -= betAmount;
    currentPlayer.bet = betAmount;
    console.log('current player money:', currentPlayer.money); // debugging
    console.log('current player bet:', currentPlayer.bet); // debugging
    displayMessage(`Bet of $${betAmount} placed. Good luck!`, 'success');
    const firstCard = dealCard(currentPlayer.hand);
    const secondCard = dealCard(currentPlayer.hand);
    console.log(`player drew initial cards: `, firstCard, secondCard);
    updateHandUI(currentPlayer.hand, 'playerCards');
    const dealerFirstCard = dealCard(dealer.hand);
    const dealerSecondCard = dealCard(dealer.hand);
    console.log('dealer drew (face-up): ', dealerFirstCard);
    console.log('dealer drew (face-down): ', dealerSecondCard);
    updateHandUI(dealer.hand, 'dealerCards', false);
    updateUI();
    // auto deal first card upon clicking 'bet'
    const playerScore = calculateScore(currentPlayer.hand);
    console.log('player score after first card:', playerScore); // debugging
    if (playerScore === 21 && currentPlayer.hand.length === 2) {
        currentPlayer.money += currentPlayer.bet * 2.5; // 3:2 auto payout
        displayMessage('Blackjack! Player wins with a 3:2 payout.', 'success');
        endRound();
        return;
    }
    displayMessage(`You drew your first 2 cards. Current score: ${playerScore}.`, 'info');
    betGameControls();
}
window.handleBet = handleBet; // step 5 test betting mechanics

// update UI
function updateUI() {
    playerMoneyDisplay.textContent = `Money: $${currentPlayer.money}`;
    playerScoreDisplay.textContent = `Bet: $${currentPlayer.bet}`;
}

// deal card to player
function dealCard(hand) {
    if (deck.length === 0) {
        console.error('The deck is empty! Cannot deal a card');
        return null;
    }
    const card = deck.pop();
    hand.push(card);
    return card;
}

// handle Hit actions
function handleHit() {
    const newCard = dealCard(currentPlayer.hand);
    console.log('player drew a card:', newCard); //step 5 debug
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
    // dealCard(dealer.hand);
    // dealCard(dealer.hand);
    updateHandUI(dealer.hand, 'dealerCards', true);
    let dealerScore = calculateScore(dealer.hand);
    console.log('dealer score after initial cards:', dealerScore); // debugging
    if (dealerScore === 21 && dealer.hand.length === 2) {
        displayMessage('Dealer has Blackjack! Dealer wins this round.', 'error');
        endRound();
        return;
    }
    console.log('Dealer total before drawing:', calculateScore(dealer.hand)); // debugging
    if (dealerScore >= 17) {
        console.log('dealer dont need to draw more cards.');
        updateHandUI(dealer.hand, 'dealerCards', true);
        checkWinner();
        return;
    }
    while (dealerScore < 17){
        const newCard = dealCard(dealer.hand);
        console.log('Dealer drew a card:', newCard); // debugging
        updateHandUI(dealer.hand, 'dealerCards', false);
        // recalculation after subsequent draws
        dealerScore = calculateScore(dealer.hand);
        console.log('dealer score after drawing card: ', dealerScore); // debugging
    }
    updateHandUI(dealer.hand, 'dealerCards', true);
    console.log('final dealer score: ', dealerScore); // debugging
    checkWinner();
}
window.handleStand = handleStand;

function handleCashOut() {
    if (currentPlayer.money > 0) {
        // update leaderboard
        updateLeaderboard(currentPlayer);
        console.log('cashing out player: ', currentPlayer); // debugging
        renderLeaderboard(leaderboard);
        // display success msg
        displayMessage('You have cashed out! Your score is saved to the leaderboard.', 'success');
        // disable cash out button to prevent subsequent clicks, which doesnt do anything anyway
        cashOutButton.disabled = true;
        cashOutButton.classList.add('disabled');
        console.log('Cash-out button disabled.');
        // disable further actions of currentPlayer
        disableGameControls();
        //re-enabled reset button as only option for currentPlayer
        resetButton.disabled = false;
        resetButton.classList.remove('disabled');
        // save leaderboard data to localStorage
        saveLeaderboard();
    } else {
        displayMessage('Cannot cash out with $0. Reset the game to play again', 'error');
    }
}

// end round && reset for the next round
function endRound() {
    // reset first
    betButton.disabled = false;
    currentPlayer.bet = 0;
    currentPlayer.hand = [];
    dealer.hand = [];
    deck = shuffleDeck(createDeck());
    updateLeaderboard(currentPlayer);
    console.log('Leaderboard before rendering:', leaderboard); // Debugging
    renderLeaderboard(leaderboard);
    updateUI();
    // UI prompt
    if (!textPromptArea.textContent.includes('wins') && !textPromptArea.textContent.includes('tie')) {
        displayMessage('Round ended. Place your bet to start the next round!', 'info');
    }
    currentMessage = '';
    hitButton.disabled = true;
    standButton.disabled = true;
    betAmountInput.disabled = false;
}
window.endRound = endRound // step 5 test bet mechanics

function handleReset() {
    console.log('resetting the game...'); // debugging
    // reset player
    currentPlayer.money = initialMoney;
    currentPlayer.bet = 0;
    currentPlayer.hand = [];
    currentPlayer.isStanding = false;
    currentPlayer.isBusted = false;
    // reset dealer
    dealer.hand = [];
    // reset deck
    deck = shuffleDeck(createDeck());
    // clear UI
    updateUI();
    console.log('game reset success'); // debugging
    updateHandUI([], 'playerCards');
    updateHandUI([], 'dealerCards');
    displayMessage('Game reset. Start a new round by placing your bet.', 'info');
    resetGameControls();
    currentMessage = '';
}

function betGameControls() {
    hitButton.disabled = false;
    standButton.disabled = false;
    betAmountInput.disabled = true;
    betButton.disabled = true;
    cashOutButton.disabled = false;
    resetButton.disabled = false;
}

// disable controls are cashing out
function disableGameControls() {
    hitButton.disabled = true;
    standButton.disabled = true;
    betAmountInput.disabled = true;
    betButton.disabled = true;
}

// enable game controls after reset activates
function resetGameControls() {
    betAmountInput.disabled = false;
    betButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = true;
    resetButton.disabled = true;
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
    // dealer && player BJ
    if (playerScore === 21 && currentPlayer.hand.length === 2 && dealerScore === 21 && dealer.hand.length === 2) {
        currentPlayer.money += currentPlayer.bet;
        displayMessage(`Both player and dealer have Blackjack! It's a tie.`, 'info');
        endRound();
        return;
    }
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

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    loadLeaderboard(); // load from localStorage 
    startGame(1); // start with 1 player for demo first
});

betAmountInput.addEventListener('change', handleBet);

document.getElementById('betButton').addEventListener('click', handleBet);

hitButton.addEventListener('click', handleHit);

standButton.addEventListener('click', handleStand);

cashOutButton.addEventListener('click', handleCashOut);

resetButton.addEventListener('click', handleReset);

/*--------------- Exports --------------*/

export {calculateScore};