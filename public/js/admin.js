let GAMES;
let TOURNAMENTS;

// $(":reset").click(()=>{$(".img-responsive").each(()=>{$(this).attr("src","")})})

async function loadAdminJS() {
    let uid = USER_IN_SESSION.uid;
    fetch("/games")
        .then(res => res.json())
        .then(res => setGames(this.formatResponse(res)))
        .catch(err => err);

    fetch("/tournament")
        .then(res => res.json())
        .then(res => setTournaments(this.formatResponse(res)))
        .catch(err => err);

    if (getCookie("SU_SY") == "") {
        await fetch("/createToken", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid
            }),
        }).then(res => res.text()).then(function (res) {
            firebase.auth().signInWithCustomToken(res.toString()).then(function (user) {
                setCookie("SU_SY", res.toString(), 1);
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {}).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadAdminJS();
        });
    }
}



flatpickr("#requestTournamentTime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

// image tag
let bannerImg = "undefined";
let gameImg = "undefined"

function readURL(input) {
    if (input.files[0]) {
        var imgid;
        let reader = new FileReader();

        reader.onload = function (e) {};
        // reader.readAsDataURL(input.files[0]);
        if (input.id == "bannerImgFile") {
            imgid = "bannerimg"
            bannerImg = input.files[0];
        } else if (input.id == "gameImgFile") {
            imgid = "gameimg"
            gameImg = input.files[0];
        }
        var image = document.getElementById(imgid);
        image.src = URL.createObjectURL(input.files[0]);
    }
}

function addBanner() {
    let tournament = document.getElementById("bannerTournamentList").value;
    let desc = document.getElementById("bannerDesc").value;

    if (bannerImg != "undefined" && tournament && desc) {
        storeImage(bannerImg, "Banners/", tournament)
    }
}

function callBannerApi(downloadUrl) {
    let desc = document.getElementById("bannerDesc").value;
    let tournament = document.getElementById("bannerTournamentList").value;
    console.log(progbarh);
    $(progbarh).addClass("d-none")
    $(progbar)
        .css("width", 0 + "%")
        .attr("aria-valuenow", 0)
        .text(0 + "% Complete");
    console.log(desc, tournament)

    let payLoad = {};
    payLoad.description = desc;
    payLoad.tid = tournament;
    payLoad.url = downloadUrl;

    fetch("/addBanner", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            payLoad
        }),
    });

}

function addGame() {
    let gameTitle = document.getElementById("gameTitle").value;
    let gameMode = document.getElementById("gameMode").value;
    let gameTeamSize = document.getElementById("gameTeamSize").value.split(" ");
    let gameTags = document.getElementById("gameTags").value.split(" ");
    if (gameImg != "undefined" && gameTitle && gameMode && gameTeamSize && gameTags) {
        storeImage(gameImg, "Games/", gameTitle)
    }
}

function callGameApi(downloadUrl) {
    let gameTitle = document.getElementById("gameTitle").value;
    let gameMode = document.getElementById("gameMode").value;
    let gameTeamSize = document.getElementById("gameTeamSize").value.split(" ");
    let gameTags = document.getElementById("gameTags").value.split(" ");

    let payLoad = {};
    payLoad.gameTitle = gameTitle;
    payLoad.gameMode = gameMode;
    payLoad.gameTeamSize = gameTeamSize;
    payLoad.gameTags = gameTags;
    payLoad.gameImage = downloadUrl;

    $(progbarh).addClass("d-none")
    $(progbar)
        .css("width", 0 + "%")
        .attr("aria-valuenow", 0)
        .text(0 + "% Complete");

    fetch("/addGames", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            payLoad
        }),
    });

}
let progbar;
let progbarh;

function storeImage(img, ref, imgName) {
    if (typeof (img) != "undefined") {

        if (ref == "Banners/") {
            progbarh = "#uploadProgress-1"
        } else if (ref == "Games/") {
            progbarh = "#uploadProgress-2"
        }
        $(progbarh).removeClass("d-none")
        let uploadTask = firebase.app().storage("gs://hostitgaming-36a6b.appspot.com")
            .ref(ref).child(imgName + ".jpg").put(img);
        uploadTask.on('state_changed', function (snapshot) {
            //todo check this part and make it visibile in front end.. NOTE I changed that part in html added a div
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (ref == "Banners/") {
                progbar = "#dynamic-1"
            } else if (ref == "Games/") {
                progbar = "#dynamic-2"
            }
            $(progbar)
                .css("width", progress + "%")
                .attr("aria-valuenow", progress)
                .text(Math.floor(progress) + "% Complete");
            console.log(snapshot.bytesTransferred);
        }, function (error) {
            // iziToast.error({
            //     message: "we are little depressed for the time being, try again later!",
            //     position: 'topRight'
            // });
        }, function () {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                if (ref == "Banners/") {
                    callBannerApi(downloadURL);
                } else if (ref == "Games/") {
                    callGameApi(downloadURL)
                }
            }).catch(reason => {
                // alert(reason)
                // iziToast.error({
                //     message: "Something went wrong",
                //     position: 'topRight'
                // });
            });
        });
    }
}



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
                event.preventDefault();
                event.stopPropagation();
            }, false);
        });
    }, false);
})();


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

function setTournaments(data) {
    console.log(data)
    TOURNAMENTS = data;
    let tournamentBar = document.getElementById("bannerTournamentList");
    for (let i = 0; i < TOURNAMENTS.length; i++) {
        let newTournamentOption = document.createElement("option");
        newTournamentOption.text = TOURNAMENTS[i].name;
        newTournamentOption.value = TOURNAMENTS[i].tid;
        tournamentBar.appendChild(newTournamentOption);
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

function getGameID(selector) {
    for (let i = 0; i < GAMES.length; i++) {
        if (i == selector - 1) {
            return GAMES[i].gameID;
        }
    }
}

function requestTournament() {
    let newTournament = {};
    newTournament.amount = parseInt(document.getElementById("requestEntryFee").value);
    newTournament.createdBy = firebase.auth().currentUser.uid;
    newTournament.gameID = getGameID(document.getElementById("requestGame").selectedIndex);
    newTournament.gameMode = parseInt(document.getElementById("requestGameMode").value);
    newTournament.isFinished = false;
    newTournament.name = document.getElementById("requestTournamentName").value;
    newTournament.prizePool = document.getElementById("requestPrizePool").value.split(" ");
    let registeredUserDetails = {};
    registeredUserDetails.inGameID = '';
    registeredUserDetails.inGameName = '';
    let registeredUsers = [];
    newTournament.registeredUsers = registeredUsers;
    newTournament.registeredUserDetails = registeredUserDetails;
    newTournament.rules = document.getElementById("requestRules").value;
    newTournament.tags = parseInt(document.getElementById("requestGameTag").value);
    newTournament.requestStatus = 1;
    newTournament.teamSize = parseInt(document.getElementById("requestTeamSize").value);
    newTournament.totalSeats = parseInt(document.getElementById("requestTotalseats").value);
    newTournament.vacantSeats = parseInt(document.getElementById("requestTotalseats").value);
    newTournament.winnerID = '';
    newTournament.time = toTimestamp(document.getElementById("requestTournamentTime").value);
    console.log(newTournament)

    //TODO call create tournament api
}

function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
}