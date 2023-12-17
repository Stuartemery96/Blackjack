/*----- constants -----*/
const suits = ['s', 'c', 'd', 'h'];
const ranks = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
const MSG_LOOKUP = {
  null: '',
  'T': "It's a Push",
  'P': 'Player Wins!',
  'D': 'Dealer Wins',
  'PBJ': 'Player Has Blackjack 🔥',
  'DBJ': 'Dealer Has Blackjack 😔',
};


const mainDeck = buildMainDeck();

/*----- app's state (variables) -----*/
let deck;  // shuffled deck
let pHand, dHand;  // player/dealer hands (arrays)
let pTotal, dTotal;  // best point value of hand
let bank, bet;  // bankroll how much money we have & bet is the amount of the bet
let outcome;  // result of the hand (see MSG_LOOKUP)

/*----- cached element references -----*/
const msgEl = document.getElementById('msg');
const dealerHandEl = document.getElementById('dealer-hand');
const dealerTotalEl = document.getElementById('dealer-total');
const playerHandEl = document.getElementById('player-hand');
const playerTotalEl = document.getElementById('player-total');
const betEl = document.getElementById('bet');
const bankEl = document.getElementById('bankroll');
const handActiveControlsEl = document.getElementById('hand-active-controls');
const handOverControlsEl = document.getElementById('bet-controls');
const dealBtn = document.getElementById('deal-btn');
const betBtns = document.querySelectorAll('#bet-controls > button');
const playAgnBtn = document.getElementById('replay-Btn');
const doubleBtn = document.getElementById('double-btn');

/*----- event listeners -----*/
dealBtn.addEventListener('click', handleDeal);
document.getElementById('hit-btn').addEventListener('click', handleHit);
document.getElementById('stand-btn').addEventListener('click', handleStand);
document.getElementById('double-btn').addEventListener('click', handleDouble)
document.getElementById('bet-controls').addEventListener('click', handleBet);
playAgnBtn.addEventListener('click', init);

/*----- functions -----*/
init();

function handleStand() {
  dealerPlay(function () {
    if (pTotal === dTotal) {
      outcome = 'T';
    } else if (pTotal > dTotal || dTotal > 21) {
      outcome = 'P';
    } else if (dTotal > pTotal && dTotal <= 21) {
      outcome = 'D';
    }
    settleBet();
    render();
  });
}

function dealerPlay(cb) {
  outcome = 'D';
  renderHands();
  setTimeout(function () {
    if (dTotal < 17) {
      dHand.push(deck.pop());
      dTotal = getHandTotal(dHand);
      dealerPlay(cb);
    } else {
      cb();
    }
  }, 1500);
}

function handleDouble() {
  bankEl.innerHTML = bank -= bet;
  betEl.innerHTML = bet + bet;
  pHand.push(deck.pop());
  pTotal = getHandTotal(pHand);
  if (pTotal > 21) {
    outcome = 'D';
    settleDouble();
    render();
  } else {
    dealerPlay(function () {
      if (pTotal === dTotal) {
        outcome = 'T';
      } else if (pTotal > dTotal || dTotal > 21) {
        outcome = 'P';
      } else if (dTotal > pTotal) {
        outcome = 'D';
      }
      settleDouble();
      render();
    });
  }
}

function handleHit() {
  pHand.push(deck.pop());
  pTotal = getHandTotal(pHand);
  if (pTotal > 21) {
    outcome = 'D';
    settleBet();
  } else if (pTotal === 21) {
    handleStand();
  }
  render();
}

function handleBet(evt) {
  const betBtn = evt.target;
  if (betBtn.tagName !== 'BUTTON') return;
  const betAmt = parseInt(betBtn.innerHTML.replace('$', ''));
  bet += betAmt;
  bank -= betAmt;
  render();
}

function handleDeal() {
  outcome = null;
  deck = getNewShuffledDeck();
  dHand = [deck.pop(), deck.pop()];
  pHand = [deck.pop(), deck.pop()];
  // Check for blackjack
  dTotal = getHandTotal(dHand);
  pTotal = getHandTotal(pHand);
  if (dTotal === 21 && pTotal === 21) {
    outcome = 'T'; // Hand is a push/tie
  } else if (dTotal === 21) {
    outcome = 'DBJ'; // Dealer wins with BJ
  } else if (pTotal === 21) {
    outcome = 'PBJ'; // Player wins with BJ
  }
  if (outcome) settleBet();
  render();
}

function settleBet() {
  if (outcome === 'PBJ') {
    bank += bet + (bet * 1.5);
  } else if (outcome === 'P') {
    bank += bet * 2;
  } else if (outcome === 'T') {
    bank += bet;
  }
  bet = 0;
}

function settleDouble() {
  if (outcome === 'P') {
    bank += bet * 3;
  } else if (outcome === 'D') {
    bank -= bet;
  } else if (outcome === 'T') {
    bank += bet;
  }
  bet = 0;
}

// compute the best score for the hand passed in
function getHandTotal(hand) {
  let total = 0;
  let aces = 0;
  hand.forEach(function (card) {
    total += card.value;
    if (card.value === 11) aces++;
  });
  while (total > 21 && aces) {
    total -= 10;
    aces--;
  }
  return total;
}

// initialize state, then call render()
function init() {
  dHand = [];
  pHand = [];
  pTotal = dTotal = 0;
  bank = 1000;
  bet = 0;
  outcome = null;
  render();
}

// Visualize all state to the DOM
function render() {
  bankEl.innerHTML = bank;
  betEl.innerHTML = bet;
  renderHands();
  renderControls();
  renderBetBtns();
  renderMessage();
}


function renderBetBtns() {
  betBtns.forEach(function (btn) {
    const btnAmt = parseInt(btn.innerHTML.replace('$', ''));
    btn.disabled = btnAmt > bank;
  });
}

function renderControls() {
  handOverControlsEl.style.visibility = handInPlay() ? 'hidden' : 'visible';
  handActiveControlsEl.style.visibility = !handInPlay() ? 'hidden' : 'visible';
  dealBtn.style.visibility = bet >= 10 && !handInPlay() ? 'visible' : 'hidden';
  playAgnBtn.style.visibility = bank >= 10 || bet > 10 ? 'hidden' : 'visible';
  doubleBtn.disabled = bet > bank;
}

function renderMessage() {
  msgEl.style.visibility = handInPlay() || outcome === null ? 'hidden' : 'visible';
  msgEl.innerHTML = MSG_LOOKUP[outcome];
}

function renderHands() {
  playerTotalEl.innerHTML = pTotal;
  dealerTotalEl.innerHTML = outcome ? dTotal : '??';
  playerHandEl.innerHTML = pHand.map(card => `<div class="card ${card.face}"></div>`).join('');
  dealerHandEl.innerHTML = dHand.map((card, idx) => `<div class="card ${idx === 1 && !outcome ? 'back' : card.face}"></div>`).join('');
}

function handInPlay() {
  return pHand.length && !outcome;
}

function getNewShuffledDeck() {
  // Create a copy of the mainDeck (leave mainDeck untouched!)
  const tempDeck = [...mainDeck];
  const newShuffledDeck = [];
  while (tempDeck.length) {
    // Get a random index for a card still in the tempDeck
    const rndIdx = Math.floor(Math.random() * tempDeck.length);
    // Note the [0] after splice - this is because splice always returns an array and we just want the card object in that array
    newShuffledDeck.push(tempDeck.splice(rndIdx, 1)[0]);
  }
  return newShuffledDeck;
}

function buildMainDeck() {
  const deck = [];
  // Use nested forEach to generate card objects
  suits.forEach(function (suit) {
    ranks.forEach(function (rank) {
      deck.push({
        // The 'face' property maps to the library's CSS classes for cards
        face: `${suit}${rank}`,
        // Setting the 'value' property for game of blackjack, not war
        value: Number(rank) || (rank === 'A' ? 11 : 10)
      });
    });
  });
  return deck;
}