/*-------------- Constants -------------*/

// NA for now

/*---------- Variables (state) ---------*/

// NA for now

/*----- Cached Element References  -----*/

const leaderboardList = document.getElementById('leaderboardList');

/*-------------- Functions -------------*/

// render dynamic leaderboard
function renderLeaderboard(leaderboard) {
    leaderboardList.innerHTML = ''; // clear current leaderboard state first
    leaderboard.forEach(player => {
        const listItem = document.createElement('li');
        listItem.textContent = `${player.name}: $${player.money}`;
        leaderboardList.appendChild(listItem);
    });
}

/*----------- Event Listeners ----------*/

// NA for now

/*--------------- Exports --------------*/

export {renderLeaderboard};