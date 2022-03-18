document.getElementById("start-button").addEventListener("click", function() {
    window.location.href = "/host";
});

document.getElementById("join-button").addEventListener("click", function() {
    let gameCode = document.getElementById("game-code").innerText;
    window.location.href = "/game";
});