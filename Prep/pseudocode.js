/* Initialize Game */

// Initialize game setup
// CREATE deck
// SHUFFLE deck
// SET dealer's money as unlimited
// INITIALIZE each player with $5000
// SET minimum bet at $50
// DISPLAY all player's money
// INITIALIZE leaderboard with caching indefinitely and not resetting

/* Create and Shuffle Deck */

// FUNCTION to create and shuffle deck
// CREATE list of 52 cards
// SHUFFLE deck

/* Game Controls */

// FUNCTION for starting a new game
// ASK each player to input their name (HTML form element?)
// RESET game state for all players
// DEAL initial cards to player(s) and dealer
// SET each player bet, ensure between minimum and their total money (allow 'All-In')
// COLLECT bets from each player
// DEAL initial cards to all players, then the dealer

// FUNCTION to reset game to initial state (at start new game)
// UPDATE leaderboard with current scores before reset
// CLEAR all players and dealer hands
// RESET deck
// RESET all player stakes and bets to initial amounts
// RESET player names, maintaining leaderboard position
// DISPLAY updated money for each player

// FUNCTION for cashing out to leaderboard
// ADD each player's current money and name to the leaderboard
// SORT leaderboard to keep top 10 players, discard others
// DISPLAY leaderboard
// REMOVE player from active game, allowing remaining players to continue

// FUNCTION to handle reset button click (user-triggered)
// UPDATE leaderboard with current scores before reset
// RESET current game for all players, restoring settings to the start of a new game session
// RESET player names, maintaining leaderboard position
// RESET money to initial amounts for all players
// DISPLAY updated money for each player

/* Betting Rules Evaluation */

// FUNCTION to apply betting rules
// IF dealer does not bust
    // PAY players with a higher total than dealer
    // COLLECT bets from players with a lower total than dealer
// IF both player and dealer bust
    // PLAYER loses their bet
// IF player does not bust and dealer busts
    // PLAYER wins and bet is paid accordingly
// IF tie between player and dealer (standoff)
    // RETURN bet to player
// IF player has a Blackjack
    // PAY player 1.5 times their bet
// IF dealer has a Blackjack
    // DEALER collects 1.5 times the bet from all players

/* Game Rounds */

// FUNCTION to deal initial cards
// DEAL two cards to each player, starting from the left of the dealer
// DEAL two cards to the dealer, with one card face down

// FUNCTION for players hitting a card
// FOR each player still active
    // IF player chose to hit
        // DEAL another card to player
        // UPDATE display
        // IF player busts
            // END round for that player and adjust money

// FUNCTION for player choosing to stand
// FOR each player still active
    // SET player's stand status to true
    // IF all players have stood
        // START dealer play sequence

// FUNCTION for dealer's actions
// REVEAL dealer's hidden card
// WHILE dealer's score is less than 17 OR isSoftSeventeen(dealer.hand)
    // DEAL card to dealer
// IF dealer's score is 17 and not a soft 17 OR dealer's score is higher than 17
    // DEALER stands

/* Utility Functions */

// FUNCTION to update and maintain the leaderboard
    // ADD scores and names to the leaderboard
    // SORT leaderboard by score in descending order
    // TRIM leaderboard to top 10 entries
    // ENSURE leaderboard maintains history and doesn't reset

// FUNCTION to deal a card to a given hand
    // REMOVE 1 card from deck
    // ADD this card to the specified hand with optional face-up status

// FUNCTION to update the game display
    // DISPLAY score for each player
    // DISPLAY dealer's cards
    // DISPLAY money for each active player

// FUNCTION to check if a hand is bust
    // CALCULATE score of hand
    // RETURN if score is over 21

// FUNCTION to calculate the score of a hand
    // SET score to 0
    // FOR each card in hand
        // ADD card value to score
    // ADJUST score for Aces if score is over 21

// FUNCTION to determine if dealer should hit
    // RETURN true if dealer's score is less than 17

// FUNCTION to determine and display the winners
    // FOR each active player
        // COMPARE scores of player and dealer
        // DISPLAY appropriate message based on comparison

// FUNCTION to display the leaderboard
    // SHOW leaderboard in UI, displaying top 10 rankings
