const {
  Worker,
  isMainThread,
  parentPort,
  threadId,
  workerData,
} = require("worker_threads");
const envConfig = require("dotenv").config();
const Ably = require("ably");

const ABLY_API_KEY = process.env.ABLY_API_KEY;

const TICK_MS = 500;

let players = {};
let totalPlayers = 0;
let gameRoomChannel;
let gameCode = workerData.roomCode;
let gameInterval;
let tickCounter = 0;

// instantiate to Ably
const realtime = Ably.Realtime({
    key: ABLY_API_KEY,
    echoMessages: false,
});
// wait until connection with Ably is established
realtime.connection.once("connected", () => {
    gameRoomChannel = realtime.channels.get(gameCode + ":primary");
  
    // subscribe to new players entering the game
    gameRoomChannel.presence.subscribe("enter", (player) => {
        console.log(gameCode + ": new player");
        let newPlayerId = player.clientId;
        totalPlayers++;
        // MAKE SURE TO UPDATE THIS WITH NECESSARY DATA
        players[newPlayerId] = {
            id: newPlayerId,
            x: 0,
            y: 0,
            score: 0,
            iframes: 0,
            nickname: player.data.nickname,
        };
    });
  
    // subscribe to players leaving the game
    gameRoomChannel.presence.subscribe("leave", (player) => {
        delete players[player.clientId];
    });

    gameRoomChannel.subscribe("player-data", (player) => {
        players[player.clientId].x = player.data.x;
        players[player.clientId].y = player.data.y;
        players[player.clientId].score = player.data.score;
        players[player.clientId].iframes = player.data.iframes;
    });

    // wait for game to start
    gameRoomChannel.subscribe("start", (msg) => {
        console.log("starting game, code: " + gameCode);
        sendAttack();
    });
});


// starts the game
function gameTick() {
    gameRoomChannel.publish("game-state", {
        playerList: players
    });
    tickCounter++;
}

gameInterval = setInterval(gameTick, TICK_MS);

function sendAttack() {
    let randArr = [];
    for (let i = 0; i < 53; i++) {
        randArr.push(Math.random());
    }
    gameRoomChannel.publish("random-arr", {
        randomArr: randArr,
    });
}

function gameEnd() {
    clearInterval(gameInterval);
}