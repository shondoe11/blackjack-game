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
    console.log('updating leaderboard with:', player); // step 5 test 
    // check if player name exists in leaderboard
    const existingPlayer = leaderboard.find(entry => entry.name === player.name);
    if (existingPlayer) {
        console.log('updating existing player:', existingPlayer); // step 5 test
        // update player monies
        if (player.money > existingPlayer.money) {
            existingPlayer.money = player.money;
            console.log(`player ${player.name} score updated to: ${player.money}`); // debugging
        } else {
            console.log(`player ${player.name} has a lower score. no update needed.`)
        }
    } else {
        console.log('adding new player to leaderboard:', player); // step 5 test
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
    console.log('updated leaderboard:', leaderboard); // step 5 debugging
}
// console.log('Loaded leaderboard:', leaderboard); //step 5 debugging

// save leaderboard via localStorage
function saveLeaderboard() {
    if (localStorage && Array.isArray(leaderboard)) {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        console.log('leaderboard saved to localStorage'); // debugging
    } else {
        console.log('could not save leaderboard. ensure localStorage is avail && leaderboard is arrayed');
    }
 }

// load from localStorage
function loadLeaderboard() {
    const storedLeaderboard = localStorage.getItem('leaderboard');
    leaderboard = JSON.parse(storedLeaderboard || '[]'); // parse OR fallback
    leaderboard = Array.isArray(leaderboard)?leaderboard: []; // make sure isArray
    console.log('Loaded leaderboard:', leaderboard); // step 5 test
}
// call function during game start
loadLeaderboard();

/*----------- Event Listeners ----------*/

// NA

/*--------------- Exports --------------*/

// export leaderboard functions
export { leaderboard, updateLeaderboard, loadLeaderboard, saveLeaderboard };