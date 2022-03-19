const globalGameName = "main-game-thread";
const myQuizId = localStorage.getItem("quizId");
const myRoomCode = Math.floor(100000 + Math.random() * 900000);

// CHANGE LATER IF SWITCHING SERVER
const BASE_SERVER_URL = "http://ragehoot.ydns.eu";

let globalChannel;

// connect to Ably
const realtime = Ably.Realtime({
    authUrl: BASE_SERVER_URL + "/auth",
});

realtime.connection.once("connected", () => {
    globalChannel = realtime.channels.get(globalGameName);

    globalChannel.presence.enter({
        quizId: myQuizId,
        roomCode: myRoomCode
    });

    document.getElementById("code").innerText += myRoomCode;
});

