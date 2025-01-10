/*--------------- Imports --------------*/

import { calculateScore, players, currentPlayer, currentPlayerIndex, dealer } from "./gameLogic.js";

/*-------------- Constants -------------*/

// NA for now

/*---------- Variables (state) ---------*/

// NA for now

/*----- Cached Element References  -----*/

const leaderboardList = document.getElementById('leaderboardList');

const playerHand = document.getElementById('playerHand');

const playerMoney = document.getElementById('playerMoney');

const playerBet = document.getElementById('playerBet');

const playerScore = document.getElementById('playerScore');

const dealerScore = document.getElementById('dealerScore');

const aboutLink = document.querySelector('#about');

const aboutPopup = document.querySelector('#aboutPopup');

const closeAbout = document.querySelector('#closeAbout');

const rulesLink = document.querySelector('#rules');

const rulesPopup = document.querySelector('#rulesPopup');

const closeRules = document.querySelector('#closeRules');

/*-------------- Functions -------------*/

function updateCurrentPlayerUI() {
    const { name, hand, money, currentBet } = currentPlayer;
    playerHand.textContent = `${name}'s Hand:`;
    playerMoney.textContent = `Money: ${formatMoney(money)}`;
    playerBet.textContent = `Bet: ${formatMoney(currentBet)}`;
    playerScore.textContent = `Score: ${calculateScore(hand)}`;
    updateHandUI(hand, 'playerCards');
    console.log(`updated UI for ${name}`);
}

// displaying my card images
function updateHandUI(hand, handElementId, revealAll = true) {
    const handElement = document.getElementById(handElementId);
    if (!handElement) {
        console.error(`element with ID ${handElementId} not found.`);
        return;
    }
    console.log(`updating hand UI for ${handElementId} with hand:`, hand);
    handElement.innerHTML = '';
    hand.forEach((card, index) => {
        const cardImg = document.createElement('img');
        if (!revealAll && index === 0) {
            // dealer first card face down
            cardImg.src = `./IMG-assets/cards/back_of_card.png`;
        } else {
            // dealer second card face up
            cardImg.src = `./IMG-assets/cards/${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
        }
        cardImg.alt = `${card.rank} of ${card.suit}`;
        cardImg.classList.add('card');
        handElement.appendChild(cardImg);
    });
    console.log(`updated hand for ${handElementId}:`, hand);
}

function updateUI() {
    if (!currentPlayer) { // safeguard, resetgame bugfix after all players cashed out from players array
        return;
    }
    if (playerHand) {
        playerHand.textContent = `${currentPlayer.name}'s Hand:`;
    }
    playerMoney.textContent = `Money: ${formatMoney(currentPlayer.money)}`;
    playerBet.textContent = `Bet: ${formatMoney(currentPlayer.bet)}`;
    playerScore.textContent = `Score: ${calculateScore(currentPlayer.hand)}`;
}

// render dynamic leaderboard
function renderLeaderboard(leaderboard = []) {
    console.log('Rendering leaderboard:', leaderboard); // step 5 debug
    leaderboardList.innerHTML = ''; // clear current leaderboard state first
    leaderboard.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name}: ${formatMoney(player.money)}`;
        leaderboardList.appendChild(listItem);
    });
    console.log('Rendered leaderboard:', leaderboard); // step 5 debugging
}

function formatMoney(value) {
    const amount = Number(value) || 0;
    return '$' + amount.toLocaleString('en-US');
}

/*----------- Event Listeners ----------*/

document.querySelector('.menu-toggle').addEventListener('click', () => {
    const dropdown = document.querySelector('.nav-dropdown');
    dropdown.classList.toggle('show');
});

aboutLink.addEventListener('click', (event) => {
    event.preventDefault(); // if the event does not get explicitly handled, its default action should not be taken as it normally would be.
    aboutPopup.style.display = 'flex'; // show popup
});

closeAbout.addEventListener('click', () => {
    aboutPopup.style.display = 'none';
});

rulesLink.addEventListener('click', (event) => {
    event.preventDefault();
    rulesPopup.style.display = 'flex';
});

closeRules.addEventListener('click', () => {
    rulesPopup.style.display = 'none';
});

/*--------------- Exports --------------*/

export {updateCurrentPlayerUI, updateHandUI, updateUI, playerHand, renderLeaderboard, formatMoney};