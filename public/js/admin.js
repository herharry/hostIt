flatpickr("#requestTournamentTime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

// game section image tag
var loadFile = function (event) {
    var imgid;
    switch (event.target.id) {
        case "bannerImgFile":
            imgid = "bannerimg"
            break;
        case "gameImgFile":
            imgid = "gameimg"
            break;
    }
    var image = document.getElementById(imgid);
    image.src = URL.createObjectURL(event.target.files[0]);
};

// input field validation
(function () {
    'use strict';
    window.addEventListener('load', function () {
        var forms = document.getElementsByClassName('needs-validation');
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();


fetch("/games")
    .then(res => res.json())
    .then(res => setGames(this.formatResponse(res)))
    .catch(err => err);

function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}

function setGames(data) {
    GAMES = data;
    let gameBar = document.getElementById("requestGame");
    for (let i = 0; i < GAMES.length; i++) {
        let newGameOption = document.createElement("option");
        newGameOption.text = GAMES[i].name;
        newGameOption.value = i + '';
        gameBar.appendChild(newGameOption);
    }
}

function gameEditPageAction() {
    clearAllOtherOptions();
    let gameSelector = document.getElementById("requestGame");
    let gameTeamSizeSelector = document.getElementById("requestTeamSize");
    let gameModeSelector = document.getElementById("requestGameMode");
    let gameTagSelector = document.getElementById("requestGameTag");
    for (let i = 0; i < GAMES.length; i++) {
        if (gameSelector.selectedIndex - 1 == i) {
            createOption(GAMES[i].teamSize, gameTeamSizeSelector);
            createOption(GAMES[i].gameModes, gameModeSelector);
            createOption(GAMES[i].tags, gameTagSelector);
            break;
        }
    }
}

function createOption(iterator, appender) {
    for (let j = 0; j < iterator.length; j++) {
        let newGameTag = document.createElement("option");
        newGameTag.text = iterator[j].toString();
        newGameTag.value = j + '';
        appender.appendChild(newGameTag);
    }
}

function clearAllOtherOptions() {
    //todo clear all option every time the game label changes
    removeOptions(document.getElementById("requestTeamSize"));
    removeOptions(document.getElementById("requestGameMode"));
    removeOptions(document.getElementById("requestGameTag"));

}

function removeOptions(selectElement) {
    let i, L = selectElement.options.length - 1;
    for (i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
}