const globalGameName = "main-game-thread";
const myQuizId = localStorage.getItem("quizId");
const myRoomCode = Math.floor(100000 + Math.random() * 900000);

// CHANGE LATER IF SWITCHING SERVER
const BASE_SERVER_URL = "http://ragehoot.ydns.eu";

let globalChannel;
let gameRoomChannel;

// connect to Ably
const realtime = Ably.Realtime({
    authUrl: BASE_SERVER_URL + "/auth",
});

realtime.connection.once("connected", () => {
    globalChannel = realtime.channels.get(globalGameName);
    gameRoomChannel = realtime.channels.get(myRoomCode + ":primary");

    globalChannel.presence.enter({
        quizId: myQuizId,
        roomCode: myRoomCode
    });

    // load new game state
    gameRoomChannel.subscribe("game-state", (msg) => {

    });

    // load new question
    gameRoomChannel.subscribe("question", (msg) => {

    });

    // game end
    gameRoomChannel.subscribe("game-end", (msg) => {

    });

    document.getElementById("code").innerText += myRoomCode;
});

let startButton = document.getElementById("start-button");

startButton.addEventListener("click", function() {
    gameRoomChannel.publish("start", {
        start: true
    });
    startButton.remove();
});


// TODO: draw game