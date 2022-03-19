document.getElementById("start-button").addEventListener("click", function() {
    localStorage.clear();
    window.location.href = "/host";
});

document.getElementById("join-button").addEventListener("click", function() {
    localStorage.clear();
    let gameCode = document.getElementById("game-code").value;
    let nickname = document.getElementById("nickname").value;
    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("nickname", nickname);
    window.location.href = "/game?roomCode=" + gameCode;
});