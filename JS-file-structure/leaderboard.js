/*--------------- Imports --------------*/

/*-------------- Constants -------------*/

// not needed for now [Step 4]

/*---------- Variables (state) ---------*/

// store player rankings
let leaderboard = [];

/*----- Cached Element References  -----*/

// NA

/*-------------- Functions -------------*/

// update leaderboard with player name && money
function updateLeaderboard(player) {
    // check if player name exists in leaderboard
    const existingPlayer = leaderboard.find(entry => entry.name === player.name);
    if (existingPlayer) {
        // update player monies
        existingPlayer.money = player.money;
    } else {
        // add new player to leaderboard
        leaderboard.push({name: player.name, money: player.money});
    }
    // sort leaderboard money.descending
    leaderboard.sort((a,b) => b.money - a.money);
    // keep only top 10
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    saveLeaderboard(); // save wrapping
}

// save leaderboard via localStorage
function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// load from localStorage
function loadLeaderboard() {
    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (storedLeaderboard) {
        leaderboard = JSON.parse(storedLeaderboard);
    }
}
// call function during game start
loadLeaderboard();

/*----------- Event Listeners ----------*/

// NA

/*--------------- Exports --------------*/

// export leaderboard functions
export { leaderboard, updateLeaderboard, loadLeaderboard };