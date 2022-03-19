const globalGameName = "main-game-thread";
const myQuizId = localStorage.getItem("quizId");
const myRoomCode = Math.floor(100000 + Math.random() * 900000);

// CHANGE LATER IF SWITCHING SERVER
//const BASE_SERVER_URL = "http://ragehoot.ydns.eu";

let globalChannel;
let gameRoomChannel;
let global_player_arr;
let totalPlayers;

const socket = io();

// connect to Ably
// const realtime = Ably.Realtime({
//     authUrl: BASE_SERVER_URL + "/auth",
// });

// realtime.connection.once("connected", () => {
//     globalChannel = realtime.channels.get(globalGameName);
//     gameRoomChannel = realtime.channels.get(myRoomCode + ":primary");

//     globalChannel.presence.enter({
//         quizId: myQuizId,
//         roomCode: myRoomCode
//     });

//     // load new game state
//     gameRoomChannel.subscribe("game-state", (msg) => {
//         global_player_arr = msg.data.playerList;
//         totalPlayers = msg.data.playerCount;
//     });

//     // load new question
//     // gameRoomChannel.subscribe("question", (msg) => {

//     // });

//     // game end
//     gameRoomChannel.subscribe("game-end", (msg) => {

//     });

//     document.getElementById("code").innerText += " " + myRoomCode;
// });

let gameInterval;
let startButton = document.getElementById("start-button");

socket.emit("new-room", {
    gameCode: myRoomCode
});

document.getElementById("code").innerText += " " + myRoomCode;

socket.on("game-state:" + myRoomCode, (data) => {
    global_player_arr = data.players;
    totalPlayers = data.playerCount;
});

startButton.addEventListener("click", function() {
    // gameRoomChannel.publish("start", {
    //     start: true
    // });
    socket.emit("start", {
        gameCode: myRoomCode
    });
    startButton.remove();
    gameInterval = setInterval(scoreboardUpdate, 1000);
});

// scoreboard update
function scoreboardUpdate() {
    let scores = [];
    for (const p_id in global_player_arr) {
        scores.push([global_player_arr[p_id].score, global_player_arr[p_id].nickname]);
    }
    scores.sort(function comp(a, b) {
        let ai = parseInt(a);
        let bi = parseInt(b);
        if (ai == bi) return 0;
        else if (ai < bi) return -1;
        else return 1;
    });
    console.log(scores);
    for (let i = 1; i <= 5; i++) {
        if (i > totalPlayers) break;
        let listItem = document.getElementById("li-" + i);
        listItem.innerText = scores[totalPlayers-i][1] + ": " + scores[totalPlayers-i][0];
    }
}


function gameEnd() {
    clearInterval(gameInterval);
}

// TODO: draw game