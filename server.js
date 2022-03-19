// WORKER DEPRECATED AFTER SWITCHING FROM ABLY
// const {
//     Worker,
//     isMainThread,
//     parentPort,
//     workerData,
//     threadId,
//     MessageChannel,
// } = require("worker_threads");

const envConfig = require("dotenv").config();
const express = require("express");
//const Ably = require("ably");
const http = require("http");
const { SocketAddress } = require("net");
const path = require("path");
const socketIO = require("socket.io");
const { isObject } = require("util");
const TICK_MS = 1000/30;

const app = express();
const {PORT} = process.env;
const server = http.createServer(app);
const io = socketIO(server);

//const globalGameName = "main-game-thread";
//let globalChannel;

let rooms = {};
let tickCounter = {};
let gameIntervals = {};


app.use(express.static(__dirname));

// app.get("/auth", (request, response) => {
//     const tokenParams = { clientId: uniqueId() };
//     realtime.auth.createTokenRequest(tokenParams, function (err, tokenRequest) {
//         if (err) {
//             response
//                 .status(500)
//                 .send("Error requesting token: " + JSON.stringify(err));
//         } else {
//             response.setHeader("Content-Type", "application/json");
//             response.send(JSON.stringify(tokenRequest));
//         }
//     });
// });

app.get("/", (request, response) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    response.sendFile(__dirname + "/index.html");
});

app.get("/gamesingle", (request, response) => {
    response.sendFile(__dirname + "/gamesingle.html");
});

app.get("/quizselect", (request, response) => {
    response.sendFile(__dirname + "/quizselect.html");
});

app.get("/game", (request, response) => {
    let requestedRoom = request.query.roomCode;
    console.log(requestedRoom);
    if (rooms[requestedRoom]) {
        response.sendFile(__dirname + "/game.html");
    } else {
        response.sendFile(__dirname + "/index.html");
    }
});

app.get("/host", (request, response) => {
    //generateNewGameThread(request.query.quizId);
    response.sendFile(__dirname + "/host.html");
});

// const listener = app.listen(PORT, () => {
//     console.log("Listening on port " + listener.address().port);
// });

server.listen(PORT);
console.log("Listening on port " + server.address().port);

// can change uniqueId func later if necessary
// const uniqueId = function() {
//     return "id-" + Math.random().toString(36).substr(2, 16);
// }

// instantiate to Ably
// const realtime = Ably.Realtime({
//     key: ABLY_API_KEY,
//     echoMessages: false,
// });
// console.log("connected to Ably");

// // wait until connection with Ably is established
// realtime.connection.once("connected", () => {
//     globalChannel = realtime.channels.get(globalGameName);
//     // subscribe to new rooms being created
//     globalChannel.presence.subscribe("enter", (roomInfo) => {
//         console.log(roomInfo);
//         generateNewGameThread(roomInfo.data.quizId, roomInfo.data.roomCode);
//     });
// });

// listen for connection on socket
io.on("connection", function (socket) {
    // when a host creates a new room
    socket.on("new-room", function (roomData) {
        let newCode = roomData.gameCode;
        console.log("creating new room!");
        rooms[newCode] = {
            roomCode: newCode,
            players: {},
            playerCount: 0,
            started: false
        };
        socket.on("player-state:" + newCode, (data) => {
            let newCode = data.gameCode;
            let playerId = data.clientId;
            rooms[newCode].players[playerId] = data.player;
        });
        socket.on("new-player:"+newCode, (data) => {
            //rooms[data.gameCode].players[data.player.playerID] = data.player;
            rooms[data.gameCode].playerCount++;
        })
        socket.on("start:" + newCode, (data) => {
            let newCode = data.gameCode;
            let arr = [];
            for (let i = 0; i < 53; i++) {
                arr.push(Math.random());
            }
            io.sockets.emit("random-arr:" + newCode, {
                randArr: arr
            });
        });
        gameIntervals[newCode] = setInterval(gameTick(newCode), TICK_MS);
    });

    // when a host disconnects
    socket.on("disconnect", () => {
        // TODO: Complete this
    });
});

function gameTick(gameCode) {
    io.sockets.emit("game-state:" + gameCode, {
        players: rooms[gameCode].players,
        playerCount: rooms[gameCode].playerCount
    });
    tickCounter[gameCode]++;
}

// DEPRECATED AFTER SWITCHING FROM ABLY
// create new game threads for each room
// function generateNewGameThread(quizId, newRoomCode) {
//     if (isMainThread) {
//         const worker = new Worker("./worker.js", {
//             workerData: {
//                 roomCode: newRoomCode,
//                 quizId: quizId
//             },
//         });
//         console.log(`CREATING NEW THREAD WITH ID ${threadId}`);
//         worker.on("error", (error) => {
//             console.log(`WORKER EXITED DUE TO AN ERROR ${error}`);
//         });
//         rooms[newRoomCode] = {
//             roomCode: newRoomCode,
//             started: false
//         };
//         console.log("new room created with code: " + newRoomCode);
//         //console.log(rooms);
//         worker.on("message", (msg) => {
//             // if (msg.roomCode && !msg.resetEntry) {
//             //     rooms[msg.roomCode] = {
//             //         roomCode: msg.roomCode,
//             //         totalPlayers: msg.totalPlayers,
//             //         gameOn: msg.gameOn
//             //     };
//             // } else if (msg.roomCode && msg.resetEntry) {
//             //     delete rooms[msg.roomCode];
//             // }
//         });
//         worker.on("exit", (code) => {
//             delete rooms[newRoomCode];
//             console.log("deleted room: " + newRoomCode);
//             console.log(`WORKER EXITED WITH THREAD ID ${threadId}`);
//             if (code !== 0) {
//                 console.log(`WORKER EXITED DUE TO AN ERROR WITH CODE ${code}`);
//             }
//         });
//     }
// }