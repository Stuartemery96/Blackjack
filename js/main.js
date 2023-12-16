/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];

const originalDeck = buildOriginalDeck();
renderDeckInContainer(originalDeck, document.getElementById('original-deck-container'));

/*----- app's state (variables) -----*/
let bank;
let hands;
let outcome;
let count;
let playerHand;
let dealerHand;
let bet;
let shuffledDeck;
/*----- cached element references -----*/
const shuffledContainer = document.getElementById('shuffled-deck-container');
/*----- event listeners -----*/
document.querySelector('button').addEventListener('click', renderNewShuffledDeck);
/*----- functions -----*/
init();

function init() {
  bank = 500;


}