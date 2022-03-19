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

const TICK_MS = 100;

let players = {};
let totalPlayers = 0;
let gameRoom;
let gameCode = workerData.roomCode;

// instantiate to Ably
const realtime = Ably.Realtime({
    key: ABLY_API_KEY,
    echoMessages: false,
});
// wait until connection with Ably is established
realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get(gameCode + ":primary");
  
    // subscribe to new players entering the game
    gameRoom.presence.subscribe("enter", (player) => {
        console.log(gameCode + ": new player");
    });
  
    // subscribe to players leaving the game
    gameRoom.presence.subscribe("leave", (player) => {
        
    });
});


// starts the game
const startGame = function() {
    let tickInterval = setInterval(() => {
        // TODO: Differentiate between active game and scoreboard
        gameRoom.publish("game-state", {
            players: players,
            playerCount: totalPlayers,
        });
    }, TICK_MS);
}
