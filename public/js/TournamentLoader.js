// FIREBASE AUTHENTICATION FOR THE CURRENT USER STARTS*****************************************************************************
async function loadTournamentJS() {
    let uid = USER_IN_SESSION.uid;
    await fetch("/user?uid=" + uid)
        .then(res => res.json())
        .then(function (res) {
            if (res.val != "false") {
                userInDB = res.val;
            }
        });

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
                tournamentListener();
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {
            console.log("hey")
            tournamentListener();
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadProfileJS();
        });
    }
}

function tournamentListener() {
    DB.collection("Tournaments").where("isFinished", "==", false)
        .onSnapshot(function (snapshot) {
            snapshot.forEach(function (doc) {
                let tournament = {};
                tournament = doc.data();
                tournament.id = doc.id;
                console.log(tournament.id)
                let flag = document.getElementById("tournamentCards" + "CARD" + tournament.id);
                if (typeof (flag) != 'undefined' && flag != null) {
                    loadTournamentInExistingCard(tournament, "tournamentCards");
                } else {
                    loadTournamentInNewCard(tournament, "tournamentCards")
                }
                let myTournaments = userInDB.tournamentIds;

                for (let i = 0; i < myTournaments.length; i++) {
                    console.log(myTournaments[i])
                    if (tournament.id == myTournaments[i]) {
                        let flag = document.getElementById("myTournamentCards" + "CARD" + tournament.id);
                        if (typeof (flag) != 'undefined' && flag != null) {
                            loadTournamentInExistingCard(tournament, "myTournamentCards");
                        } else {
                            loadTournamentInNewCard(tournament, "myTournamentCards")
                        }

                    }
                }
            })
        });
    console.log("helos")
}
//FIREBASE AUTHENTICATION FOR THE CURRENT USER ENDS *****************************************************************************


function loadTournamentInNewCard(tournament, ids) {
    console.log(tournament)
    const cardParent = document.getElementById(ids)
    let card = document.createElement("div");
    card.className = "card col-12 col-lg-6 p-0 my-2 px-1";
    card.id = ids + "CARD" + tournament.id;
    // let img = document.createElement("img");
    // img.src = getGameImage(tournaments[i].gameID)
    // img.className = "card-img-top";
    // img.alt = "";
    let tournamentNames = document.createElement("h3");
    tournamentNames.id = ids + "NAMES" + tournament.id;
    tournamentNames.className = "card-title text-upper";
    tournamentNames.innerText = tournament.name;
    let cardBody = document.createElement("div");
    cardBody.className = "card-body  bg-dark rounded-lg py-2";
    let cardBottom = document.createElement("div");
    cardBottom.className = "row mb-2 border-bottom";
    let tournamentprize = document.createElement("div");
    tournamentprize.id = ids + "NAME" + tournament.id;
    tournamentprize.className = "col-3 p-1 text-center";
    var total = 0;
    tournament.prizePool.forEach(element => {
        total += element;
    });
    tournamentprize.innerText = "prize pool" + '\n' + total;
    let amount = document.createElement("div");
    amount.id = ids + "AMOUNT " + tournament.id;
    amount.className = "col-3 text-center p-1 border-right";
    amount.innerText = "Amount " + '\n' + tournament.amount;
    let time = document.createElement("div");
    time.id = ids + "TIME" + tournament.id;
    time.className = "col-4 p-1 border-right";
    let timestamp = tournament.time.seconds * 1000;
    let tournamentDate = new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'

    })
    let tournamentTime = new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    time.innerHTML = tournamentDate + "<br>" + tournamentTime;
    let players = document.createElement("div");
    players.id = ids + "PLAYERS" + tournament.id;
    players.className = "col-2 text-center border-right p-1";
    players.innerHTML = "seats <br>" + (tournament.totalSeats - tournament.vacantSeats) + "/" + tournament.totalSeats;
    let progress = document.createElement("div");
    progress.className = "progress mt-4";
    let progressBar = document.createElement("div");
    progressBar.id = ids + "PROGRESS_BAR" + tournament.id;
    progressBar.className = "progress-bar bg-dark progress-gradient";
    progressBar.setAttribute("role", "progressbar");
    let percent = ((tournament.totalSeats - tournament.vacantSeats) / tournament.totalSeats) * 100;
    progressBar.setAttribute("style", "width :" + percent + "%");
    progressBar.setAttribute("role", "progressbar");
    progressBar.innerHTML = percent + "% full";
    let remainig = document.createElement("p");
    remainig.id = ids + "REMAINING" + tournament.id;
    remainig.className = "float-left text-small"
    remainig.innerHTML = tournament.vacantSeats + " remaining";



    // card.appendChild(img);
    card.appendChild(cardBody);
    cardBody.appendChild(tournamentNames);
    cardBody.appendChild(cardBottom);
    cardBottom.appendChild(amount);
    cardBottom.appendChild(time);
    cardBottom.appendChild(players);
    cardBottom.appendChild(tournamentprize);
    progress.appendChild(progressBar);

    cardBody.appendChild(progress);
    cardBody.appendChild(remainig);

    if (ids != "myTournamentCards") {
        let button = document.createElement("a");
        button.className = "btn btn-sm btn-primary px-4 py-1 mt-3 mx-3 float-right";
        (percent==100)? button.classList.add("active"):button.classList.add("btn-primary") 
        button.text = "Join"
        button.id = tournament.id;
        button.setAttribute("onClick", "loadSpecificTournament(this.id)");
        cardBody.appendChild(button);
    }
    cardParent.appendChild(card);
    $("#overlay").fadeOut('slow');

}


function loadTournamentInExistingCard(tournament, ids) {

    let tournamentNames = document.getElementById(ids + "NAMES" + tournament.id);
    tournamentNames.innerText = tournament.name;
    let tournamentprize = document.getElementById(ids + "NAME" + tournament.id);
    var total = 0;
    tournament.prizePool.forEach(element => {
        total += element;
    });
    tournamentprize.innerText = "prize pool" + '\n' + total;
    let amount = document.getElementById(ids + "AMOUNT" + tournament.id);
    amount.innerText = tournament.amount;
    let time = document.getElementById(ids + "TIME" + tournament.id);
    let timestamp = tournament.time.seconds * 1000;
    let tournamentDate = new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'

    })
    let tournamentTime = new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    time.innerHTML = tournamentDate + "<br>" + tournamentTime;
    let players = document.getElementById(ids + "PLAYERS" + tournament.id);
    players.innerHTML = (tournament.totalSeats - tournament.vacantSeats) + "/" + tournament.totalSeats;
    let progressBar = document.getElementById(ids + "PROGRESS_BAR" + tournament.id);
    let percent = ((tournament.totalSeats - tournament.vacantSeats) / tournament.totalSeats) * 100;
    progressBar.setAttribute("style", "width :" + percent + "%");
    progressBar.innerHTML = percent + "% full";
    let remainig = document.getElementById(ids + "REMAINING" + tournament.id);
    remainig.innerHTML = tournament.vacantSeats + " remaining";
}


function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}

function loadSpecificTournament(tid) {
    console.log(tid)
    window.location.assign("/tournaments?tid=" + tid);
}

//todo show only unregistered tournaments
//todo in the live tournament tab rename it as registered tournament and click to view it...

var observer = new IntersectionObserver(function(entries) {
	// isIntersecting is true when element and viewport are overlapping
	// isIntersecting is false when element and viewport don't overlap
	if(entries[0].isIntersecting === true)
		console.log('Element has just become visible in screen');
}, { threshold: [0] });

observer.observe(document.querySelector("#footer"));