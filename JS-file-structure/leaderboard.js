/*--------------- Imports --------------*/

/*-------------- Constants -------------*/

// not needed for now [Step 4]

/*---------- Variables (state) ---------*/

// store player rankings
let leaderboard = [];
window.leaderboard = leaderboard; //step 5 testing

/*----- Cached Element References  -----*/

// NA

/*-------------- Functions -------------*/

// update leaderboard with player name && money
function updateLeaderboard(player) {
    console.log('Updating leaderboard with:', player); // step 5 test 
    // check if player name exists in leaderboard
    const existingPlayer = leaderboard.find(entry => entry.name === player.name);
    if (existingPlayer) {
        console.log('Updating existing player:', existingPlayer); // step 5 test
        // update player monies
        existingPlayer.money = player.money;
    } else {
        console.log('Adding new player to leaderboard:', player); // step 5 test
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
    console.log('Updated leaderboard:', leaderboard); // step 5 debugging
}
// console.log('Loaded leaderboard:', leaderboard); //step 5 debugging

// save leaderboard via localStorage
function saveLeaderboard() {
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// load from localStorage
function loadLeaderboard() {
    const storedLeaderboard = localStorage.getItem('leaderboard');
    if (storedLeaderboard) {
        leaderboard = JSON.parse(storedLeaderboard);
        window.leaderboard = leaderboard; //step 5 test
    } else {
        leaderboard = []; // Initialize empty array if nothing exists
        window.leaderboard = leaderboard; // step 5 test
    }
    console.log('Loaded leaderboard:', leaderboard); // step 5 test
}
// call function during game start
loadLeaderboard();

/*----------- Event Listeners ----------*/

// NA

/*--------------- Exports --------------*/

// export leaderboard functions
export { leaderboard, updateLeaderboard, loadLeaderboard, saveLeaderboard };