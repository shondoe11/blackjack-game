/*--------------- Imports --------------*/

import { calculateScore } from "./gameLogic.js";

/*-------------- Constants -------------*/

// NA for now

/*---------- Variables (state) ---------*/

// NA for now

/*----- Cached Element References  -----*/

const leaderboardList = document.getElementById('leaderboardList');

/*-------------- Functions -------------*/

// displaying my card images
function updateHandUI(hand, handElementId, revealAll = true) {
    const handElement = document.getElementById(handElementId);
    if (!handElement) {
        console.error(`Element with ID ${handElementId} not found.`);
        return;
    }
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

export {updateHandUI, renderLeaderboard};