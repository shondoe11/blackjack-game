/*--------------- Imports --------------*/

import Player from './player.js';

import { createDeck, shuffleDeck } from './deck.js';

import  { leaderboard, loadLeaderboard, updateLeaderboard, saveLeaderboard } from './leaderboard.js';

import { updateCurrentPlayerUI, updateHandUI, updateUI, renderLeaderboard, formatMoney } from './uiController.js';

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

const startGameButton = document.getElementById('startGameButton');

const playerArea = document.getElementById('playerArea');

const bettingControls = document.querySelector('.bettingControls')

const gameControls = document.querySelector('.gameControls')

const betAmountInput = document.getElementById('betAmount');

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

// deal card to player
function dealCard(hand) {
    if (!deck || deck.length === 0) {
        console.error('deck empty! cannot deal card');
        return null;
    }
    const card = deck.pop();
    console.log('dealt card:', card); // debugging
    console.log('deck after dealing:', deck); // debugging
    if (!card) {
        console.error('no card dealt. deck might be corrupted.');
        return null;
    }
    hand.push({ ... card }); // spread operator
    return card;
}

function dealInitialCards(player) {
    player.hand = [];
    dealCard(player.hand);
    dealCard(player.hand);
    console.log('initial cards dealt:', 
        player.name, 
        player.hand.map(c =>`${c.rank} of ${c.suit}`)
    );
    if (player === currentPlayer) {
        updateHandUI(player.hand, 'playerCards');
        updateCurrentPlayerUI();
    }
}

// start player setup
function startSetup() {
    const numPlayersDropdown = document.getElementById('numPlayers');
    numPlayers = Number(numPlayersDropdown.value); // grab numPlayers from player select dropdown
    const nameInputContainer = document.getElementById('nameInputContainer');
    nameInputContainer.innerHTML = ''; // clear previous inputs
    // create name input fields for the selected number of players
    for (let i = 0; i < numPlayers; i++) {
        const nameInput = document.createElement('div');
        nameInput.innerHTML = `
            <label for="playerName${i + 1}" style="color: yellow;">Player ${i + 1} Name: </label>
            <input type="text" id="playerName${i + 1}" placeholder="Player ${i + 1}">
        `;
        nameInputContainer.appendChild(nameInput);
    }
    displayMessage('Enter player names and click "Start Game" when ready!', 'info');
    startGameButton.style.display = '';
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
    console.log('players: ', players); // debugging
    if (players.length === 0) {
        console.error('no players created. game cant start');
        displayMessage('No players created. Cannot start game.', 'error');
        return;
    }
    startGame();
}

// start game with preset conditions
function startGame() {
    console.log('Starting the game...');
    currentPlayerIndex = 0; // reset to the player 1
    players = []; // clear previous players
    // fill players array from nameInput
    for (let i = 0; i < numPlayers; i++) {
        const playerName = document.getElementById(`playerName${i + 1}`).value.trim();
        players.push({
            name: playerName || `Player ${i + 1}`, // default name if not entered
            money: initialMoney,
            hand: [],
            bet: 0,
            isStanding: false,
            isBusted: false
        });
    }
    if (players.length === 0) {
        displayMessage('No players found. Please set up players to start the game.', 'error');
        return;
    }
    deck = shuffleDeck(createDeck());
    dealer.hand = [];
    currentPlayer = players[0]; // set first player as the current player
    updateCurrentPlayerUI(); // update UI for the first player
    console.log('Deck shuffled:', deck); // debugging
    displayMessage(`${currentPlayer.name}, it's your turn! Place your bet.`, 'info');
    startGameControls();
}
window.startGame = startGame; // step 5 test gameStart

// placing bet
function handleBet() {
    const betAmount = Number(betAmountInput.value);
    if (isNaN(betAmount) || betAmount < MIN_BET) {
        return displayMessage('Bet must be at least $50 and a valid number.', 'error');
    }
    if (betAmount > currentPlayer.money) {
        return displayMessage(`You don't have enough money to bet ${formatMoney(betAmount)}.`, 'error');
    }
    currentPlayer.money -= betAmount;
    currentPlayer.currentBet = betAmount;
    currentPlayer.isBusted = false;
    currentPlayer.isStanding = false;
    dealInitialCards(currentPlayer);
    updateCurrentPlayerUI();
    enableHitStand();
    const playerScore = calculateScore(currentPlayer.hand);
    displayMessage(`Bet of ${formatMoney(betAmount)} placed. ${currentPlayer.name}'s score is ${playerScore}. Good luck!`, 'success');
    if (checkAndAwardBlackjack(currentPlayer)) {
    setTimeout(() => nextPlayerTurn(), 2000);
    return;
    }
    betGameControls();
}
window.handleBet = handleBet; // step 5 test betting mechanics

// handle Hit actions
function handleHit() {
    const newCard = dealCard(currentPlayer.hand);
    updateHandUI(currentPlayer.hand, 'playerCards');
    const score = calculateScore(currentPlayer.hand);
    if (score > 21) {
        currentPlayer.isBusted = true;
        displayMessage(`${currentPlayer.name} busts with a score of ${score}.`, 'error');
        disableHitStand();
        currentPlayer.currentBet = 0; // deduct bet here if needed
        setTimeout(() => nextPlayerTurn(), 1500);
  } else {
    displayMessage(`${currentPlayer.name} hits! Score is now ${score}.`, 'info');
  }
}
window.handleHit = handleHit; 

// handle Stand actions
function handleStand() {
    console.log(`${currentPlayer.name} chose to stand.`);
    currentPlayer.isStanding = true;
    displayMessage(`${currentPlayer.name} stands with a score of ${calculateScore(currentPlayer.hand)}.`, 'info');
    disableHitStand();
    setTimeout(() => nextPlayerTurn(), 2000);
}
window.handleStand = handleStand;

function nextPlayerTurn(skipIncrease = false) {
    if (!skipIncrease) {
        currentPlayerIndex++;
    }
    if (players.length === 0) { // check players array
        displayMessage('No players left. Please reset game to set up new players.', 'error');
        currentPlayer = null;
        return;
    }
    if (currentPlayerIndex >= players.length) {
        dealer.hand = [];
        dealCard(dealer.hand);
        dealCard(dealer.hand);
        updateHandUI(dealer.hand, 'dealerCards', false); // hide first card
        dealerTurn();
        return;
    }
    currentPlayer = players[currentPlayerIndex];
    updateCurrentPlayerUI(); // update UI for new current player
    betAmountInput.disabled = false;
    betButton.disabled = false;
    disableHitStand();
    cashOutButton.disabled = false;
    displayMessage(`${currentPlayer.name}, it's your turn! Place bet.`, 'info');
}

function dealerTurn() {
    console.log('dealerTurn called'); // debugging
    displayMessage('Dealer reveals their cards...', 'info');
    cashOutButton.disabled = true;
    // wait 2 second, reveal hidden card
    setTimeout(() => {
        updateHandUI(dealer.hand, 'dealerCards', true); // show hidden card
        setTimeout(() => {
            while (calculateScore(dealer.hand) < 17) {
                dealCard(dealer.hand);
                updateHandUI(dealer.hand, 'dealerCards', true);
            }
            checkWinner();
        }, 1500);
    }, 2000);
}

function checkAndAwardBlackjack(player) {
    const playerScore = calculateScore(player.hand);
    if (playerScore === 21 && player.hand.length === 2) {
        player.money += player.currentBet * 2.5;
        displayMessage(`${player.name} wins instantly with a Blackjack!`, 'success');
        updateLeaderboard(player);
        updateUI();
        return true;
    }
    return false;
}

function checkWinner() {
    const dealerScore = calculateScore(dealer.hand);
    console.log('checkWinner called. dealer have:', dealerScore); // debugging
    let roundResults = [];
    if (dealerScore > 21) {
        roundResults.push({
            isDealer: true,
            name: 'Dealer',
            score: dealerScore,
            outcomeMsg: `Dealer busts with ${dealerScore}`,
            messageType: 'success'
        });
    } else {
        roundResults.push({
            isDealer: true,
            name: 'Dealer',
            score: dealerScore,
            outcomeMsg: `Dealer stands with ${dealerScore}`
        });
    }
    players.forEach(player => {
        const playerScore = calculateScore(player.hand);
        let outcomeMsg = '';
        let messageType = 'info';
        if (player.isBusted) {
            outcomeMsg = `${player.name} busts! Dealer wins this round.`;
            messageType = 'error';
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            player.money += player.currentBet * 2;
            outcomeMsg = `${player.name} beats the dealer and earns ${formatMoney(player.currentBet * 2)}!`;
            messageType = 'success';
        } else if (playerScore === dealerScore) {
            player.money += player.currentBet;
            outcomeMsg = `It's a tie! ${player.name}'s bet is returned.`;
        } else {
            outcomeMsg = `${player.name} loses to the dealer's ${dealerScore}.`;
            messageType = 'error';
        }
        updateLeaderboard(player);
        roundResults.push({
            isDealer: false,
            player,
            score: playerScore,
            outcomeMsg,
            messageType
        });
        player.currentBet = 0; // clear currentBet, round over
        // auto-remove logic
        if (player.money <= 0) {
            player.autoRemove = true;
        }
    });
    renderLeaderboard(players);
    showRoundResults(roundResults);
}

function showRoundResults(roundResults) {
    let i = 0; // result array index
    function showNext() {
        if (i >= roundResults.length) {
            removeBrokePlayers(); // all msgs done, now then remove $0 players before reset
            setTimeout(() => { // set to resetRound, so removeBrokePlayers message can run for 2s
            resetRound(); // reset once all player results already displayed
            }, 1500);
            return;
        }
        const result = roundResults[i];
        if (result.isDealer) {
            updateHandUI(dealer.hand, 'dealerCards', true);
            displayMessage(result.outcomeMsg, 'info');
        } else {
            currentPlayer = result.player; // temp
            displayMessage(result.outcomeMsg, result.messageType);
            updateCurrentPlayerUI(); // dynamically updates as messages cycle each player
        }
        i++;
        setTimeout(showNext, 2000); // wait 2s each cycle
    }
    showNext(); // start sequence
}

function removeBrokePlayers() {
    for (let i = players.length - 1; i >= 0; i--) { // scan backwards so splice(i,1) dont break iteration
        if (players[i].autoRemove) {
            displayMessage(`${players[i].name} is out of money and removed from the game.`, 'error');
            players.splice(i, 1);
            if (i === currentPlayerIndex) { // if currentPlayer removed = true
                currentPlayerIndex--;
                if (currentPlayerIndex < 0) currentPlayerIndex = 0;
            }
        }
    }
    // players array check
    if (players.length === 0) {
        displayMessage('No players left. Please reset game to set up new players.', 'error');
        currentPlayer = null;
    }
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
    if (players.length === 0) { // check players array
        displayMessage('No players left. Please reset game to set up new players.', 'error');
        currentPlayer = null;
        return;
    }
    updateUI();
    displayMessage('Round reset. Place your bets to start!', 'info');
    betAmountInput.disabled = false;
    betButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = false;
    currentPlayer = players[0];
    updateCurrentPlayerUI();
}

function handleReset() {
    console.log('resetting entire game...'); // debugging
    // final leaderboard state
    players.forEach(player => updateLeaderboard(player));
    saveLeaderboard();
    renderLeaderboard(leaderboard);
    // clear state
    players = [];
    currentPlayerIndex = 0;
    dealer.hand = [];
    deck = shuffleDeck(createDeck());
    updateHandUI([], 'playerCards');
    updateHandUI([], 'dealerCards');
    updateUI();
    displayMessage('Game fully reset. Set up players to start a new game.', 'info');
    resetGameControls();
    nameInputContainer.innerHTML = '';
    startGameButton.style.display = 'none';
}

function handleCashOut() {
    if (!currentPlayer) return; // safeguard for cashingout midround
    if (currentPlayer.money <= 0) {
        return displayMessage('Cannot cash out with $0. Reset the game to play again', 'error');
    }
    updateLeaderboard(currentPlayer); // save currentPlayer to leaderboard
    renderLeaderboard(leaderboard);
    saveLeaderboard();
    displayMessage(`${currentPlayer.name} has cashed out!`, 'success');
    players.splice(currentPlayerIndex, 1); // remove currentPlayer from array so wont be included in future turns
    if (players.length === 0) { // additional check players array
        displayMessage('No players left. Please reset game to set up new players.', 'error');
        currentPlayer = null;
        return;
    }
    setTimeout(() => {
        nextPlayerTurn(true);
    }, 2000);
}

/*----------- UI Control Flow ----------*/

function startGameControls() {
    playerSetupSection.style.display = 'none';
    bettingControls.style.display = '';
    gameControls.style.display = '';
    betAmountInput.disabled = false;
    betButton.disabled = false;
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = false;
    resetButton.disabled = false;
}

// after currentPlayer places bet
function betGameControls() {
    betAmountInput.disabled = true;
    betButton.disabled = true;
    hitButton.disabled = false;
    standButton.disabled = false;
    cashOutButton.disabled = true;
    resetButton.disabled = false;
}

function disableHitStand() {
    hitButton.disabled = true;
    standButton.disabled = true;
}

function enableHitStand() {
    hitButton.disabled = false;
    standButton.disabled = false;
}

// show setup section, hide other controls
function resetGameControls() {
    playerSetupSection.style.display = '';
    bettingControls.style.display = 'none';
    gameControls.style.display = 'none';
    startGameButton.disabled = false;
    betAmountInput.disabled = true;
    betButton.disabled = true;
    hitButton.disabled = true;
    standButton.disabled = true;
    cashOutButton.disabled = true;
    resetButton.disabled = true;
    displayMessage('Game fully reset. Set up players to start a new game.', 'info');
}

/*----------- Event Listeners ----------*/

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded started'); // debugging
    loadLeaderboard(); // load from localStorage
    bettingControls.style.display = 'none';
    gameControls.style.display = 'none';
    displayMessage('Welcome to Blackjack! Select # players and click "Setup Players" to begin.', 'info');
});

startSetupButton.addEventListener('click', startSetup);

startGameButton.addEventListener('click', handleNameInput);

betButton.addEventListener('click', handleBet);

hitButton.addEventListener('click', handleHit);

standButton.addEventListener('click', handleStand);

cashOutButton.addEventListener('click', handleCashOut);

resetButton.addEventListener('click', handleReset);

/*--------------- Exports --------------*/

export {calculateScore, players, currentPlayer, currentPlayerIndex, dealer};