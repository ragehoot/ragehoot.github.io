document.getElementById("start-button").addEventListener("click", function() {
    localStorage.clear();
    let quizId = 0;
    localStorage.setItem("quizId", quizId);
    window.location.href = "/host";
});

document.getElementById("join-button").addEventListener("click", function() {
    localStorage.clear();
    let gameCode = document.getElementById("game-code").value;
    gameCode = parseInt(gameCode);
    let nickname = document.getElementById("nickname").value;
    localStorage.setItem("roomCode", gameCode);
    localStorage.setItem("nickname", nickname);
    window.location.href = "/game?roomCode=" + gameCode;
});


document.getElementById("singleplayer-button").addEventListener("click", function() {
    window.location.href = "/gamesingle";
});