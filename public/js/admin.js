let GAMES;
let TOURNAMENTS;
let userAuthHolder = [];
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
                userAuthRequestListener();
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {
            userAuthRequestListener();
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadAdminJS();
        });
    }
}


function userAuthRequestListener() {
    DB.collection("UserAuthRequest").where("status", "==", false)
        .onSnapshot(function (snapshot) {
            if (snapshot.empty) {
                // $("#tournamentLoader").hide()
                // if ($("#noData").length == 0)
                //     $("#tournamentCards").append("<p class=\"mx-auto my-5\" id=\"noData\">No data found</p>")
                //todo hide all the cards and say no data available
            }
            deleteAllCards();
            userAuthHolder = [];
            snapshot.forEach(function (doc) {
                let request = {};
                request = doc.data();
                request.id = doc.id;
                userAuthHolder.push(request)
            });
            let userAuthIds = [];
            userAuthHolder.forEach(function (auth)
            {
                DB.collection("Users").doc(auth.id).get().then(function (res)
                {
                    let user = res.data();
                    loadRequestInCard(auth,user.userEmailID,user.mobileNo);
                });

            })
        });
}

function loadRequestInCard(request,email,phone)
{
    const cardParent = document.getElementById("userRequestTab")
    let card = document.createElement("div");
    card.className = "col-12 col-md-6 my-2 px-1";
    let cardBody = document.createElement("div");
    cardBody.className = "bg-dark rounded-lg p-2";
    let cardParaRowHolder = document.createElement("div");
    cardParaRowHolder.className = "row";
    let cardParaRow = document.createElement("div");
    cardParaRow.className = "col-7 d-flex flex-column justify-content-center";

    let namePara = document.createElement("p");
    namePara.innerHTML = request.userName;
    let emailPara = document.createElement("p");
    let emailSmall = document.createElement("small");
    emailSmall.innerHTML = email;
    let phonePara = document.createElement("p");
    let phoneSmall = document.createElement("small");
    phoneSmall.innerHTML = phone;

    let detailToggleButton = document.createElement("p");
    detailToggleButton.setAttribute("type","button");
    detailToggleButton.setAttribute("data-toggle","collapse");
    detailToggleButton.setAttribute("data-target","#collapse"+request.id);
    detailToggleButton.setAttribute("aria-expanded","false");
    detailToggleButton.setAttribute("aria-controls","collapseExample");
    detailToggleButton.setAttribute("aria-expanded","false");
    let detailSmall = document.createElement("small");
    detailSmall.innerText = "details  ";

    let detailSpan  = document.createElement("span");
    detailSpan.className="fas fa-chevron-circle-down";

    let detailBodyHolder = document.createElement("div");
    detailBodyHolder.className = "collapse fade";
    detailBodyHolder.id = "collapse"+request.id;
    let detailBody = document.createElement("div");
    detailBody.className = "mt-3";

    let addressPara = document.createElement("p");
    addressPara.innerHTML = "ADDRESS";
    let addressSmall = document.createElement("small");
    addressSmall.innerText = "  "+ request.address;
    let socialUrlPara = document.createElement("p");
    socialUrlPara.innerHTML = "URL";
    let socialSmall = document.createElement("small");
    socialSmall.innerText = "  "+ request.socialUrl;
    let q1Para = document.createElement("p");
    q1Para.innerHTML = "Q1";
    let q1Small = document.createElement("small");
    q1Small.innerText = "  "+ request.q1;
    let q2Para = document.createElement("p");
    q2Para.innerHTML = "Q2";
    let q2Small = document.createElement("small");
    q2Small.innerText = "  "+ request.q2;

    let resultButtonHolder = document.createElement("div");
    resultButtonHolder.className = "col-5 d-flex flex-column justify-content-end";
    let resultButton = document.createElement("div");
    resultButton.className = "d-flex flex-column justify-content-end";
    let reject = document.createElement("button");
    reject.className = "btn btn-danger btn-sm px-2 m-1";
    reject.innerText = "Reject";
    let accept = document.createElement("button");
    accept.className = "btn btn-success btn-sm px-2 m-1";
    accept.id = "accept"+request.id;
    accept.innerText = "Accept";
    accept.setAttribute("onclick" , "userAccept(this)");

    cardParent.appendChild(card);
    card.appendChild(cardBody);
    cardBody.appendChild(cardParaRowHolder);
    cardParaRowHolder.appendChild(cardParaRow);
    cardParaRow.appendChild(namePara);
    cardParaRow.appendChild(emailPara);
    emailPara.appendChild(emailSmall);
    cardParaRow.appendChild(phonePara);
    phonePara.appendChild(phoneSmall);
    cardParaRow.appendChild(detailToggleButton);
    detailToggleButton.appendChild(detailSmall);
    detailSmall.appendChild(detailSpan);
    cardParaRow.appendChild(detailBodyHolder);
    detailBodyHolder.appendChild(detailBody);
    detailBody.appendChild(addressPara);
    addressPara.appendChild(addressSmall);
    detailBody.appendChild(socialUrlPara);
    socialUrlPara.appendChild(socialSmall);
    detailBody.appendChild(q1Para);
    q1Para.appendChild(q1Small);
    detailBody.appendChild(q2Para);
    q2Para.appendChild(q2Small);
    cardParaRowHolder.appendChild(resultButtonHolder);
    resultButtonHolder.appendChild(resultButton);
    resultButton.appendChild(reject);
    resultButton.appendChild(accept);
}

flatpickr("#requestTournamentTime", {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
});

// image tag
let bannerImg = "undefined";
let gameImg = "undefined"

function deleteAllCards() {
    document.getElementById("userRequestTab").remove();
    let newParent = document.createElement("div");
    newParent.className = "d-flex justify-content-between col-12"
    newParent.id = "userRequestTab";
    document.getElementById("userReq").appendChild(newParent);
}
function userAccept(input)
{
    let id = input.id.split("accept")[1];
    fetch("/admin/acceptAuthRequest", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            id
        }),
    }).then(res => res.text()).then(function (res)
    {
        console.log(res)
        if(res != "success")
        {
            console.log("some error please try again later")
        }
    });
}

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

    fetch("/admin/banner", {
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
    let gameMode = document.getElementById("gameMode").value.split(" ");
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

    fetch("/admin/games", {
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
    newTournament.prizePool = document.getElementById("requestPrizePool").value.split(" ").map(x=>+x);
    let registeredUserDetails = [];
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
    newTournament.timer = toTimestamp(document.getElementById("requestTournamentTime").value);
    console.log(newTournament)

    fetch("/admin/tournament", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            newTournament
        }),
    });
    //TODO call create tournament api
}

function toTimestamp(strDate) {
    var datum = Date.parse(strDate);
    return datum / 1000;
}