/*--------------- Imports --------------*/

import { calculateScore, players, currentPlayerIndex } from './gameLogic.js';

/*-------------- Constants -------------*/

// NA for now

/*---------- Variables (state) ---------*/

// NA for now

/*----- Cached Element References  -----*/

const leaderboardList = document.getElementById('leaderboardList');

/*-------------- Functions -------------*/

// displaying card images
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
            // dealer face down card
            cardImg.src = `./IMG-assets/cards/back_of_card.png`; // face down card src
            cardImg.alt = 'Face Down Card';
            hasFaceDownCard = true;
        } else {
            // show card when revealAll = true
            cardImg.src = `./IMG-assets/cards/${card.rank.toLowerCase()}_of_${card.suit.toLowerCase()}.png`;
            cardImg.alt = `${card.rank} of ${card.suit}`;
            totalScore += card.value;
        }
        cardImg.classList.add('card'); // styling application
        handElement.appendChild(cardImg);
    });
    // update score display
    if (handElementId === 'dealerCards') {
        const dealerScoreElement = document.getElementById('dealerScore');
        if (hasFaceDownCard) {
            dealerScoreElement.textContent = 'Total: ??'; // Hide total score if face down card avail
        } else {
            totalScore = calculateScore(hand); // calculate score with aces logic
            dealerScoreElement.textContent = `Total: ${totalScore}`;
        }
    } else {
        // update player hands directly
        const playerScoreElement = document.getElementById('playerScore');
        totalScore = calculateScore(hand); // aces logic
        playerScoreElement.textContent = `Total: ${totalScore}`;
    }
}

function updateUI() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById('playerHandHeading').textContent = `${currentPlayer.name}'s Hand:`;
    document.getElementById('playerMoney').textContent = `Money: $${currentPlayer.money}`;
    document.getElementById('playerScore').textContent = `Bet: $${currentPlayer.bet}`;
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

export { updateHandUI, updateUI, renderLeaderboard };