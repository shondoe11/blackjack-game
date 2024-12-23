# Blackjack User Stories


## Game Specific

* As a dealer,  I want to ensure the game uses a standard deck of 52 cards, so that the game is fair and follows traditional blackjack rules.

* As a dealer, I want to have an unlimited amount  of money, so that players can play as long as they want.

* As a dealer, I am controlled by the game and not a human player.

* As a player, I want to start with $5000, with a minimum bet of $50. I should be able to All-In if i wish to, or bet any amount between the minimum bet and all my current money. There is no option to 'Double Down' or 'Split'.

* As a dealer, I want to set some bet rules:
1. If dealer doesn't bust, dealer will pay the bet of any player with a higher total and collects the bet of any player having a lower total
2. If a player and dealer busts, this player loses. However, if there are other players that do not bust, they win and their bets paid out accordingly.
3. If there is a tie between a player and the dealer. This is called a "standoff", and the bet is returned to the player without adjustment.
4. If the player has a Blackjack (a hand with a face value of 10 and an ace on the first dealt hand), the dealer pays the player 3 to 2 (essentially, 1.5x the player's bet amount)
5. If the dealer has a Blackjack, it is an automatic win for the dealer and no cards will be drawn. All players pay 1.5x to the dealer.

* As a player, I want to start a new game, so that I can play Blackjack without previous game interference.

* As a player, I want to have a reset button at any point in the game.

* As a player, I want to be able to 'cash out' my total money to the top players leaderboard, once i have decided to stop playing the game entirely.

* As a player, I want to be able to see my total money throughout the entire game.

* The leaderboard will NOT reset at any point at all, and data cached indefinitely.

* As a player, I want to be able to play with up to 7 players in total, INCLUDING the dealer.

* As a player, I want to be able to input my name to identify myself within the game, as well as my name displayed on leaderboard. Only if the RESET button is pressed, then my name will be reset as well, but remain on whatever position it attains on leaderboard.

* As a player, I want to be able to see the leaderboard in the top 10 ranking format. Anything after rank 10 can be discarded.

* As a player, I want to be able to continue playing with the dealer even if other players have chosen to cash out and save their names to leaderboard.


## Round/Hand Specific

* As a dealer, my hand will be dealt last, after all the players have been dealt

* As a player, I want to be able to 'hit' to receive another card, in order to increase my total score.

* As a player, I want to be able to 'stand' to stop receiving card, so that I can finalize my score for the round.

* As a player, I want to see my current total score during the entire round, so I can make informed decisions on whether to hit or stand.

* As a player, I want to see the dealer's cards, with one card hidden, so that I can play the game with a sense of uncertainty and strategy.

* As a player, I want to be informed who wins at the end of each round, so that I know if I have gained or lost money.