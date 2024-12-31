/*--------------- Imports --------------*/

import Player from './player.js';

import { createDeck, shuffleDeck } from './deck.js';

import  { leaderboard, loadLeaderboard, updateLeaderboard, saveLeaderboard } from './leaderboard.js';

import { updateHandUI, updateUI, renderLeaderboard } from './uiController.js';

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

let numPlayers = 1; //default

let currentPlayerIndex = 0; // current player turn tracking

/*----- Cached Element References  -----*/

const playerSetupSection = document.getElementById('playerSetupSection');

const textPromptArea = document.getElementById('textPromptArea');

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const nameInputContainer = document.querySelector('.nameInput');

const playerNameInput = document.getElementById('playerName');

const startGameButton = document.getElementById('startGameButton');

const bettingControls = document.querySelector('.bettingControls')

const gameControls = document.querySelector('.gameControls')

const betAmountInput = document.getElementById('betAmount');
window.betAmountInput = betAmountInput; // step 5 test betting mechanics

const betButton = document.getElementById('betButton');

const hitButton = document.getElementById('hitButton');

const standButton = document.getElementById('standButton');

const cashOutButton = document.getElementById('cashOutButton');

const resetButton = document.getElementById('resetButton');

/*-------------- Functions -------------*/

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

// start player setup
function startSetup() {
    const numPlayersInput = document.getElementById('numPlayers').value;
    numPlayers = Math.max(1, Math.min(6, Number(numPlayersInput)));
    nameInputContainer.innerHTML = '';
    // inputs for player names
    for (let i = 0; i <numPlayers; i++) {
        const nameInput = document.createElement('div');
        nameInput.innerHTML = `
        <label for='playerName ${i + 1}'>Player ${i + 1} Name: </label>
        <input type='text' id='playerName${i + 1}' placeholder='Player ${i + 1}'>
        `;
        nameInputContainer.appendChild(nameInput);
    }
    // show start game button
    startGameButton.style.display = '';
    displayMessage('Next, enter your name(s) and click "Start Game" when ready!', 'info')
}

function handleNameInput() {
    players = []; // reset players for multiplayer
    for (let i = 0; i < numPlayers; i++) {
        const playerName = document.getElementById(`playerName${i + 1}`).value.trim();
        players.push({
            name: playerName || `Player ${i + 1}`, //default name if NA
            money: initialMoney,
            hand: [],
            bet: 0,
            isStanding: false,
            isBusted: false
        });
    }
    console.log('players: ', players); //debugging
    if (players.length > 0) {
        console.log('starting the game..');
        startGame();
    } else {
        console.error('no players created. game cant start');
    }
}

// start game with preset conditions
function startGame() {
    console.log('startGame called'); // step 5 test gameStart
    currentPlayerIndex = 0; // reset to first player turn
    currentPlayer = players[currentPlayerIndex];
    deck = shuffleDeck(createDeck());
    window.deck = deck; // debugging
    console.log('confirm deck initialized & shuffled: ', deck); // debugging
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
        player.isStanding = false;
        player.isBusted = false;
    });
    dealer.hand = [];
    updateUI();
    startGameControls();
    displayMessage(`${players[currentPlayerIndex].name}, it's your turn! Place bet.`);
}
window.startGame = startGame; // step 5 test gameStart


// placing bet
function handleBet() {
    console.log('handleBet called'); // debugging
    if (betButton.disabled) {
            console.log('bet button disabled'); // debugging
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
        cashOutButton.disabled = false;
        resetButton.disabled = false;
        endRound();
        return;
    }
    if (dealerScore === 21 && dealer.hand.length === 2) {
            currentPlayer.money -= currentPlayer.bet
            displayMessage(`Dealer has Blackjack! ${player.name} loses this round.`, 'error');
            endRound();
            return;
        }
    displayMessage(`Bet of $${betAmount} placed. Good luck! You drew your first 2 cards. Current score: ${playerScore}.`, 'info');
    betGameControls();
}
window.handleBet = handleBet; // step 5 test betting mechanics

// deal card to player
function dealCard(hand) {
    if (!deck || deck.length === 0) {
        console.error('The deck is empty! Cannot deal a card');
        return null;
    }
    const card = deck.pop();
    console.log('dealt card:', card); // debugging
    console.log('deck after dealing:', deck); // debugging
    hand.push(card);
    return card;
}

function dealInitialCards() {
    players.forEach(player => {
        const card1 = dealCard(player.hand);
        const card2 = dealCard(player.hand);
        console.log(`player drew: ${card1.rank} of ${card1.suit}, ${card2.rank} of ${card2.suit}`); // debugging
        player.hand.push(card1, card2);
    });
    const dealerCard1 = dealCard(dealer.hand);
    const dealerCard2 = dealCard(dealer.hand);
    console.log(`dealer drew: ${dealerCard1.rank} of ${dealerCard1.suit}, ${dealerCard2.rank} of ${dealerCard2.suit}`); // debugging
    dealer.hand.push(dealerCard1, dealerCard2);
    updateHandUI(dealer.hand, 'dealerCards', false); //dealer second card hide
    updateHandUI(players[currentPlayerIndex].hand, 'playerCards');
}

// handle Hit actions
function handleHit() {
    const currentPlayer = players[currentPlayerIndex];
    const newCard = dealCard(deck);
    currentPlayer.hand.push(newCard);
    updateHandUI(currentPlayer.hand, 'playerCards');
    const playerScore = calculateScore(currentPlayer.hand);
    if (playerScore > 21) {
        displayMessage(`${currentPlayer.name} busts!`, 'error');
        currentPlayer.isBusted = true;
        nextPlayerTurn();
    } else {
        displayMessage(`${currentPlayer.name}, your score is ${playerScore}.`, 'info');
    }
}
window.handleHit = handleHit; 

// handle Stand actions
function handleStand() {
    const currentPlayer = players[currentPlayerIndex];
    currentPlayer.isStanding = true;
    console.log('${currentPlayer.name} chose to stand'); // debugging
    const allPlayersDone = players.every(player => player.isStanding || player.isBusted);
    if (allPlayersDone) {
        console.log('all player done. move to dealer turn') // debugging
        dealerTurn();
    } else {
        nextPlayerTurn();
    }
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
    // show name input container fields after reset clicked
    if (nameInputContainer) {
        nameInputContainer.style.display = 'flex'; //reappear as flexbox
    }
    currentMessage = '';
    updateUI();
}

function presetControls() {
    console.log('presetControls executed'); // debugging
    bettingControls.style.display = 'none';
    gameControls.style.display = 'none';
    displayMessage('Enter your name and click "Start Game" to begin.', 'info');
}

function startGameControls() {
    playerSetupSection.style.display ='none';
    bettingControls.style.display = '';
    gameControls.style.display = '';
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
    playerNameInput.disabled = false;
    playerNameInput.value = '';
    startGameButton.disabled = false;
    betAmountInput.disabled = true;
    betButton.disabled = true;
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = true;
    resetButton.disabled = true;
    displayMessage('Enter your name and click "Start Game" to begin.', 'info');
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

function nextPlayerTurn() {
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        displayMessage(`${players[currentPlayerIndex].name}, it's your turn!`);
        updateHandUI(players[currentPlayerIndex].hand, 'playerCards');
    } else {
        dealerTurn();
    }
}

function dealerTurn() {
    displayMessage(`Dealer's turn...`);
    updateHandUI(dealer.hand, 'dealerCards', false); // reveal dealer cards
    while (calculateScore(dealer.hand) < 17) {
        dealer.hand.push(dealCard(deck));
    }
    checkWinner();
}

function resetRound() {
    currentPlayerIndex = 0;
    deck = shuffleDeck(createDeck());
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
        player.isStanding = false;
        player.isBusted = false;
    });
    dealer.hand = [];
    updateUI();
    displayMessage('Round reset. Place your bets to start!');
}

// Check winner of round
function checkWinner() {
    const dealerScore = calculateScore(dealer.hand);
    players.forEach(player => {
        const playerScore = calculateScore(player.hand);
        // dealer && player BJ
        if (playerScore === 21 && player.hand.length === 2 && dealerScore === 21 && dealer.hand.length === 2) {
            // currentPlayer.money += currentPlayer.bet;
            displayMessage(`Both ${player.name} and dealer have Blackjack! It's a tie.`, 'info');
            player.money += player.bet;
            return;
        }
        // player BJ
        if (playerScore === 21 && player.hand.length === 2) {
            player.money += player.bet * 2.5; // 3:2 payout
            displayMessage(`${player.name} wins with a Blackjackand receives a 3:2 payout!`, 'success');
            return;
        }
        // dealer BJ
        if (dealerScore === 21 && dealer.hand.length === 2) {
            displayMessage(`Dealer has Blackjack! ${player.name} loses this round.`, 'error');
            return;
        }
        // player bust
        if (playerScore > 21) {
            displayMessage(`${player.name} busts. Dealer wins!`, 'error');
        } 
        // dealer bust
        if (dealerScore > 21) {
            player.money += player.bet * 2;
            displayMessage(`${player.name} wins! Dealer busts.`, 'success');
            return;
        }
        // normal win/loss
        if (playerScore > dealerScore) {
            player.money += player.bet * 2;
            displayMessage(`${player.name} wins with a higher score than the dealer!`, 'success');
        }
        // tie
        else if (playerScore === dealerScore) {
            player.money += player.bet; // bet return to player
            displayMessage(`${player.name} ties with the dealer! Bet returned.`, 'info');
            return;
        } 
        // dealer win
        else {
            displayMessage(`Dealer wins against ${player.name}.`, 'error');
        }
    });
    renderLeaderboard(leaderboard); // update dynamically with new scores
    resetRound(); // prep for next round
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded started'); // debugging
    loadLeaderboard(); // load from localStorage 
    // startGame(1); // start with 1 player for demo first
    presetControls();
    displayMessage('Welcome to Blackjack! Enter # players and click "Setup Players" to begin.', 'info');
});

startSetupButton.addEventListener('click', startSetup);

startGameButton.addEventListener('click', handleNameInput);

betAmountInput.addEventListener('change', handleBet);

document.getElementById('betButton').addEventListener('click', handleBet);

hitButton.addEventListener('click', handleHit);

standButton.addEventListener('click', handleStand);

cashOutButton.addEventListener('click', handleCashOut);

resetButton.addEventListener('click', handleReset);

/*--------------- Exports --------------*/

export {calculateScore, players, currentPlayerIndex};