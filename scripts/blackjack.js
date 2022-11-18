// Game setup
import { TimeUtils } from "./utils/time-utils.js";
import { ButtonUtils } from "./utils/button-utils.js";
import { Deck } from "./models/deck.js";
import { Dealer } from "./models/dealer.js";
import { Player } from "./models/player.js";

let betChips = 0;
let preBet = 0;
let bet = 0;
let result = "Place your bet!"

let chips = 1000;

Dealer.drawIdleFrame();
drawCards();
show();

//  Pick up buttons in HTML
const btnChips = document.getElementById("btn_chips");
btnChips.addEventListener ("click", betChipsClick);

const btnBet = document.getElementById("btn_bet");
btnBet.addEventListener ("click", betCheck);

const btnHit = document.getElementById("btn_hit");
btnHit.addEventListener ("click", hit);
ButtonUtils.btnDisable(btnHit);

const btnStand = document.getElementById("btn_stand");
btnStand.addEventListener ("click", stand);
ButtonUtils.btnDisable(btnStand);

const btnDouble = document.getElementById("btn_double");
btnDouble.addEventListener ("click", double);
ButtonUtils.btnDisable(btnDouble);

// Shortcuts keyboard
document.onkeydown = function(e){
    switch(e.keyCode) {
        case 72:
            if (!btnHit.disabled) hit();
            break;
        case 83:
            if (!btnStand.disabled) stand();
            break;
        case 68:
            if (!btnDouble.disabled) double();
            break;
        case 13:
            e.preventDefault()
            if (!btnBet.disabled) betCheck();
            break;
    }
}

// Click bet
function betChipsClick(e){
    betChips = Number(e.target.value);
    
    if (isNaN(betChips)){    //Si on appuye à coté des boutons
        return;
    }

    if (betChips === 0){         //le bouton reset a une valeur 0
        preBet = 0;
        for (let i = 0; i < 4; i++){
            document.getElementById("stack"+i).innerHTML="";
        }
    }
    else{     //Si on appuye sur un bouton autre que reset
        if (preBet === chips){    //Si le joueur à déja la mise maxi
            return
        }
        else if (preBet+betChips > chips){     //Si le joueur veut trop miser
            preBet = chips;
        } 
        else{
            preBet += betChips;
        }

        let i = Math.floor(Math.random()*4)
        let image = document.createElement("img");
        image.src = "./Sprites/"+betChips+" Stack.png";
        image.className = "stack";
        document.getElementById("stack"+i).appendChild(image);
    }

    show();
}


// Blackjacktoo m
function betCheck() {

    if (preBet === 0){
        window.alert("Please put a bet amount");
    }
    else if (preBet > chips){
        window.alert("You don't have enough chips!");
    }
    else{
        bet = preBet;
        startGame();
    }
}


// Start the game
async function startGame(){
    ButtonUtils.btnDisable(btnBet);

    result = "No more bets";
    chips -= bet;

    show();

    drawCards();

    document.getElementById("player_cards").innerHTML = "";
    await drawCardPlayer();
    document.getElementById("dealer_cards").innerHTML = "";
    await drawCardDealer();
    show();
    await drawCardPlayer();

    ButtonUtils.btnEnable(btnStand);
    ButtonUtils.btnEnable(btnHit);
    ButtonUtils.btnEnable(btnDouble)

    document.getElementById("result").style.display = "none";

    if (Player.getTotal() === 21){
        playerBj = true;
        ButtonUtils.btnDisable(btnHit);
        ButtonUtils.btnDisable(btnDouble);
        result = "Blackjack!"
        document.getElementById("result").style.display = "block";
        show();
    }   
}


async function drawCardPlayer() {
    Player.drawCard();
    show();
    await Dealer.playAnimation();
}

async function drawCardDealer() {
    await Dealer.drawCard();
    show();
    await Dealer.playAnimation();
}


async function hit() {
    Player.drawCard();
    show();
    ButtonUtils.btnDisable(btnDouble);
    if (Player.getTotal() > 21){
        result = "Too many";
        ButtonUtils.btnDisable(btnHit);
        ButtonUtils.btnDisable(btnDouble);
        ButtonUtils.btnDisable(btnStand);
        await Dealer.playAnimation();
        document.getElementById("result").style.display = "block";
        show();
        await TimeUtils.sleep(2000);
        reset();
        show();
    } else {
        await Dealer.playAnimation();
    }

}


async function stand(){
    document.getElementById("result").style.display = "none";
    ButtonUtils.btnDisable(btnHit);
    ButtonUtils.btnDisable(btnDouble);
    ButtonUtils.btnDisable(btnStand);

    while (Dealer.getTotal() < 17){
        await drawCardDealer();
    }

    const dealerTotal = Dealer.getTotal();
    const playerTotal = Player.getTotal();

    if (Player.hasBlackJack() && !Dealer.hasBlackJack()){
        chips += (bet*2.5);
        result = "You won! : " + bet * 1.5 + " chips.";

    } else if (dealerTotal > 21 || dealerTotal < playerTotal){
        chips += (bet*2);
        result = "You won! : " + bet + " chips.";

    } else if (dealerTotal > playerTotal){
        result = "You lost : " + bet + " chips.";

    } else {
        result = "Draw";
        chips += bet;
    }
    document.getElementById("result").style.display = "block";
    show();
    await TimeUtils.sleep(2000);
    reset();
    show();
}


async function double() {
    if (chips < bet) {
        window.alert("You don't have enough chips!")
    } else {
        chips -= bet;
        bet = bet * 2;
        ButtonUtils.btnDisable(btnDouble);
        ButtonUtils.btnDisable(btnHit);
        await drawCardPlayer();
        show();

        if (Player.getTotal() > 21) {
            result = "Too many";
            reset();
        }
    }
}


function show() {
    const playerTotal = Player.getTotal();
    document.getElementById("total_player").innerHTML = Player.getAce() > 0 ? playerTotal + " (Soft)" : playerTotal;
    document.getElementById("chips").innerHTML = chips;
    document.getElementById("bet_amount").innerHTML = preBet;
    document.getElementById("total_dealer").innerHTML = Dealer.getTotal();
    document.getElementById("result").innerHTML = result;
}


function reset(){
    ButtonUtils.btnEnable(btnBet);
    ButtonUtils.btnDisable(btnStand);
    ButtonUtils.btnDisable(btnHit);
    ButtonUtils.btnDisable(btnDouble);
    result = "Place your bet!";
    drawCards();
    Deck.reset();
    Dealer.reset();
    Player.reset();
}


// Draw cards
function drawCards(){

    document.getElementById("dealer_cards").innerHTML = "";
    let image = document.createElement("img"); // Cards show
    image.className="cards";
    image.src = Deck.greyCardPath;
    image.value = 0;
    document.getElementById("dealer_cards").appendChild(image);
    
    document.getElementById("player_cards").innerHTML = "";
    image = document.createElement("img"); // Cards show
    image.className="cards";
    image.src = Deck.greyCardPath;
    image.value = 0;
    document.getElementById("player_cards").appendChild(image);
}

//Functions
//Always data
//Import
//Sprite button disable
//stack
    //maximum stack,
//too many, pas de "lost x chips"
