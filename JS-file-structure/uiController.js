/*--------------- Imports --------------*/

import { calculateScore, players, currentPlayerIndex, dealer } from "./gameLogic.js";

/*-------------- Constants -------------*/

// NA for now

/*---------- Variables (state) ---------*/

// NA for now

/*----- Cached Element References  -----*/

const leaderboardList = document.getElementById('leaderboardList');

const playerHandHeading = document.getElementById('playerHandHeading');

const playerMoneyDisplay = document.getElementById('playerMoney');

const playerScoreDisplay = document.getElementById('playerScore');

const dealerScoreDisplay = document.getElementById('dealerScore');

/*-------------- Functions -------------*/

// displaying my card images
function updateHandUI(hand, handElementId, revealAll = true) {
    const handElement = document.getElementById(handElementId);
    if (!handElement) {
        console.error(`Element with ID ${handElementId} not found.`);
        return;
    }
    console.log(`updating hand UI for ${handElementId} with hand:`, hand);
    handElement.innerHTML = ''; // clear previous cards
    let totalScore = 0;
    let hasFaceDownCard = false;
    hand.forEach((card, index) => {
        const cardImg = document.createElement('img');
        if (!revealAll && index === 0) {
            // face-down card, dealer's first card
            cardImg.src = `./IMG-assets/cards/back_of_card.png`;
            hasFaceDownCard = true;
        } else {
            // show actual card
            cardImg.src = `./IMG-assets/cards/${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
            totalScore += card.value;
        }
        cardImg.alt = `${card.rank} of ${card.suit}`;
        cardImg.classList.add('card');
        handElement.appendChild(cardImg);
    });
    if (handElementId === 'dealerCards') {
        const dealerScoreElement = document.getElementById('dealerScore');
        if (hasFaceDownCard) {
            dealerScoreElement.textContent = 'Total: ??';
        } else {
            // account for aces
            totalScore = calculateScore(hand);
            dealerScoreElement.textContent = `Total: ${totalScore}`
        }
    }
    console.log(`updated hand for ${handElementId}:`, hand);
}

function updateUI() {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer) {
        updateHandUI(currentPlayer.hand, 'playerCards');
        playerMoneyDisplay.textContent = `Money: $${currentPlayer.money}`;
        playerScoreDisplay.textContent = `Score: ${calculateScore(currentPlayer.hand)}`;
    }
    if (dealer.hand) {
        updateHandUI(dealer.hand, 'dealerCards', dealer.hand.length > 1);
        dealerScoreDisplay.textContent = dealer.hand.length > 1
            ? `Total: ${calculateScore(dealer.hand)}`
            : 'Total: ??';
    }
    renderLeaderboard(players);
}

// render dynamic leaderboard
function renderLeaderboard(leaderboard = []) {
    console.log('Rendering leaderboard:', leaderboard); // step 5 debug
    leaderboardList.innerHTML = ''; // clear current leaderboard state first
    leaderboard.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name}: $${player.money}`;
        leaderboardList.appendChild(listItem);
    });
    console.log('Rendered leaderboard:', leaderboard); // step 5 debugging
}

/*----------- Event Listeners ----------*/

// NA for now

/*--------------- Exports --------------*/

export {updateHandUI, updateUI, renderLeaderboard};