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

// instantiate to Ably
const realtime = Ably.Realtime({
    key: ABLY_API_KEY,
    echoMessages: false,
});

// wait until connection with Ably is established
realtime.connection.once("connected", () => {
    gameRoom = realtime.channels.get(gameCode);
  
    // subscribe to new players entering the game
    gameRoom.presence.subscribe("enter", (player) => {
        console.log(workerData.roomCode + ": new player");
        let newPlayerId;
        totalPlayers++;
        parentPort.postMessage({
            roomCode: roomCode,
            totalPlayers: totalPlayers,
        });
        newPlayerId = player.clientId;
        playerChannels[newPlayerId] = realtime.channels.get(
            workerData.hostRoomCode + ":clientChannel-" + player.clientId
        );
        newPlayerObject = {
            id: newPlayerId,
            x: 0,
            y: 0,
            score: 0,
            nickname: player.data,
        };
        players[newPlayerId] = newPlayerObject;
        subscribeToPlayerInput(playerChannels[newPlayerId], newPlayerId);
    });
  
    // subscribe to players leaving the game
    gameRoom.presence.subscribe("leave", (player) => {
        let leavingPlayer = player.clientId;
        totalPlayers--;
        parentPort.postMessage({
            roomCode: roomCode,
            totalPlayers: totalPlayers,
        });
        delete players[leavingPlayer];
        if (totalPlayers <= 0) {
            killWorkerThread();
        }
    });

    gameRoom.presence.subscribe("start", {
        startGame();
    });
});

// starts the game
function startGame() {
    let tickInterval = setInterval(() => {
        // TODO: Differentiate between active game and scoreboard
        gameRoom.publish("game-state", {
            players: players,
            playerCount: totalPlayers,
        });
    }, TICK_MS);
}