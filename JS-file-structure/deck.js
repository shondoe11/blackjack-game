/*--------------- Imports --------------*/



/*-------------- Constants -------------*/

const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades']

const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King', 'Ace']

/*---------- Variables (state) ---------*/


/*----- Cached Element References  -----*/


/*-------------- Functions -------------*/

export function createDeck() {
    let deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            let card = {
                suit: suit,
                rank: rank,
                value: getValue(rank)
            };
            deck.push(card);
        });
    });
    return deck;
}
// [step 1 test]
// console.log(createDeck()) 

export function getValue(rank) {
    if (rank === 'Ace') return 11; // initial set to 11, can be 1 later on
    if (['Jack', 'Queen', 'King'].includes(rank)) return 10;
    return Number(rank);
}

export function shuffleDeck(deck) { // Fisher-Yates algo
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // swap elements
    } return deck;
}

// [step 1 test]
// const deck = createDeck();
// console.log('original deck: ', deck);
// console.log('shuffle deck: ', shuffleDeck(deck));

/*----------- Event Listeners ----------*/

