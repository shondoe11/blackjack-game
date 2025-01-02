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
    if (!players || players.length === 0) {
        console.error('No players available. Cannot start the game.');
        return;
    }
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
    const betAmount = Number(betAmountInput.value);
    if (isNaN(betAmount) || betAmount < MIN_BET) {
        return displayMessage('Bet must be at least $50 and a valid number.', 'error');
    }
    if (betAmount > currentPlayer.money) {
        return displayMessage(`You don't have enough money to place this bet.`, 'error');
    }
    currentPlayer.money -= betAmount;
    currentPlayer.currentBet = betAmount;
    dealInitialCards(currentPlayer);
    const playerScore = calculateScore(currentPlayer.hand);
    displayMessage(`Bet of $${betAmount} placed. ${currentPlayer.name}'s score is ${playerScore}. Good luck!`, 'success');
    updateUI();
    if (checkAndAwardBlackjack(currentPlayer)) {
        console.log(`${currentPlayer.name} has Blackjack!`);
        setTimeout(() => {
            nextPlayerTurn();
        }, 2000);
        return;
    }
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
    if (!card) {
        console.error('no card dealt. deck might be corrupted.');
        return null;
    }
    hand.push(card);
    return card;
}

function dealInitialCards() {
    players.forEach(player => {
        player.hand = [dealCard(deck), dealCard(deck)];
        updateHandUI(player.hand, `playerCards-${player.name}`);
    });

    dealer.hand = [dealCard(deck), dealCard(deck)];
    updateHandUI([dealer.hand[0]], 'dealerCards');
    console.log('Initial cards dealt:', players, dealer);
}

// handle Hit actions
function handleHit() {
    const newCard = dealCard(currentPlayer.hand);
    updateHandUI(currentPlayer.hand, `playerCards-${currentPlayer.name}`);
    const score = calculateScore(currentPlayer.hand);
    if (score > 21) {
        currentPlayer.isBusted = true;
        displayMessage(`${currentPlayer.name} busts with a score of ${score}.`, 'error');
        currentPlayer.currentBet = 0; // deduct bet here if needed
        nextPlayerTurn();
    } else {
        displayMessage(`${currentPlayer.name} hits and their score is now ${score}.`, 'info');
    }
}
window.handleHit = handleHit; 

// handle Stand actions
function handleStand() {
    console.log(`${currentPlayer.name} chooses to stand.`);
    currentPlayer.isStanding = true;
    nextPlayerTurn();
}
window.handleStand = handleStand;

function handleCashOut() {
    const currentPlayer = players[currentPlayerIndex];
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
        nextPlayerTurn();
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
    console.log('Resetting the game...'); // debugging
    players.forEach(player => {
        player.money = initialMoney;
        player.bet = 0;
        player.hand = [];
        player.isStanding = false;
        player.isBusted = false;
    });
    dealer.hand = [];
    deck = shuffleDeck(createDeck());
    updateUI();
    console.log('Game reset successful.'); // debugging
    updateHandUI([], 'playerCards');
    updateHandUI([], 'dealerCards');
    displayMessage('Game reset. Start a new round by placing your bet.', 'info');
    resetGameControls();
    if (nameInputContainer) {
        nameInputContainer.style.display = 'flex';
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
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = true;
    resetButton.disabled = true;
}

function betGameControls() {
    betAmountInput.disabled = true;
    betButton.disabled = true;
    hitButton.disabled = false;
    standButton.disabled = false;
    cashOutButton.disabled = false;
    resetButton.disabled = false;
}

// disable controls are cashing out
function disableGameControls() {
    betAmountInput.disabled = true;
    betButton.disabled = true;
    hitButton.disabled = true;
    standButton.disabled = true;
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

function drawCardAndCalculateScore(hand, elementId) {
    const card = dealCard(hand);
    updateHandUI(hand, elementId);
    return calculateScore(hand);
}

function nextPlayerTurn() {
    console.log('nextPlayerTurn called'); // debugging
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        currentPlayer = players[currentPlayerIndex];
        displayMessage(`${currentPlayer.name}, it's your turn! Place your bet.`, 'info');
        betAmountInput.disabled = false;
        betButton.disabled = false;
        hitButton.disabled = true;
        standButton.disabled = true;
        updateUI();
    } else {
        console.log(`All players have taken their turns. Dealer's turn now.`);
        setTimeout(() => {
            dealerTurn();
        }, 2000);
    }
}

function dealerTurn() {
    console.log('dealerTurn called'); // debugging
    setTimeout(() => {
        displayMessage('Dealer reveals their cards. Calculating winner...', 'info');
        setTimeout(() => {
            while (calculateScore(dealer.hand) < 17) {
                drawCardAndCalculateScore(dealer.hand, 'dealerCards');
            }
            checkWinner();
        }, 2000);
    }, 2000);
}

function resetRound() {
    console.log('resetRound called'); // debugging
    currentPlayerIndex = 0;
    deck = shuffleDeck(createDeck());
    players.forEach(player => {
        player.hand = [];
        player.bet = 0;
        player.isStanding = false;
        player.isBusted = false;
    });
    dealer.hand = [];
    updateHandUI([], 'dealerCards');
    updateHandUI([], 'playerCards');
    updateUI();
    displayMessage('Round reset. Place your bets to start!', 'info');
    betAmountInput.disabled = false;
    betButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
}

function checkAndAwardBlackjack(player) {
    const playerScore = calculateScore(player.hand);
    if (playerScore === 21 && player.hand.length === 2) {
        player.money += player.currentBet * 2.5;
        displayMessage(`${player.name} wins with a Blackjack!`, 'success');
        updateLeaderboard(player);
        updateUI();
        setTimeout(() => {
            nextPlayerTurn();
        }, 3000);
        return true;
    }
    return false;
}

// Check winner of round
function checkWinner() {
    console.log('checkWinner called'); // debugging
    const dealerScore = calculateScore(dealer.hand);
    players.forEach(player => {
        const playerScore = calculateScore(player.hand);
        if (player.isBusted) {
            displayMessage(`${player.name} busts! Dealer wins this round.`, 'error');
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            player.money += player.currentBet * 2;
            displayMessage(`${player.name} wins this round and earns $${player.currentBet * 2}!`, 'success');
        } else if (playerScore === dealerScore) {
            player.money += player.currentBet;
            displayMessage(`It's a tie! ${player.name}'s bet is returned.`, 'info');
        } else {
            displayMessage(`${player.name} loses to the dealer's ${dealerScore}.`, 'error');
        }
        updateLeaderboard(player);
    });
    setTimeout(() => {
        renderLeaderboard(players);
        resetRound();
    }, 3000);
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

export {calculateScore, players, currentPlayerIndex, dealer};