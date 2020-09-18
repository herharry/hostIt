// FIREBASE AUTHENTICATION FOR THE CURRENT USER STARTS*****************************************************************************

async function loadTournamentJS()
{
    let uid = USER_IN_SESSION.uid;
    if(getCookie("SU_SY") == "")
    {
        await fetch("/createToken", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({uid}),
        }).then(res => res.text()).then(function(res){
            firebase.auth().signInWithCustomToken(res.toString()).then(function (user)
            {
                setCookie("SU_SY",res.toString(),1);
                tournamentListener();
            })
        });
    }
    else
    {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user)
        {
            console.log("hey")
            tournamentListener();
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadProfileJS();
        });
    }
}

function tournamentListener()
{
    DB.collection("Tournaments").where("isFinished","==",false)
        .onSnapshot(function(snapshot) {
            snapshot.forEach(function (doc)
            {
                let tournament={};
                tournament = doc.data();
                tournament.id = doc.id;
                let flag = document.getElementById("CARD"+tournament.id);
                if(typeof(flag) != 'undefined' && flag!=null)
                {
                    loadTournamentInExistingCard(tournament)
                }
                else {
                    loadTournamentInNewCard(tournament)

                }
            })
        });
    console.log("helos")
}
//FIREBASE AUTHENTICATION FOR THE CURRENT USER ENDS *****************************************************************************


function loadTournamentInNewCard(tournament) {
    console.log(tournament)

    const cardParent = document.getElementById("tournamentCards")
        let card = document.createElement("div");
        card.className = "card p-0 bg-dark my-2 mx-2 col-12 col-lg-6";
        card.id="CARD"+tournament.id;
        // let img = document.createElement("img");
        // img.src = getGameImage(tournaments[i].gameID)
        // img.className = "card-img-top";
        // img.alt = "";
        let tournamentNames = document.createElement("h3");
        tournamentNames.id = "NAMES"+tournament.id;
        tournamentNames.className = "card-title text-upper";
        tournamentNames.innerText = tournament.name;
        let cardBody = document.createElement("div");
        cardBody.className = "card-body container-fluid py-2";
        let cardBottom = document.createElement("div");
        cardBottom.className = "row mb-2 border-bottom";
        let tournamentName = document.createElement("div");
        tournamentName.id = "NAME"+tournament.id;
        tournamentName.className = "col-3 p-1 border-right";
        tournamentName.innerText = tournament.name;
        let amount = document.createElement("div");
        amount.id = "AMOUNT"+tournament.id;
        amount.className = "col-2 text-center p-1 border-right";
        amount.innerText = tournament.amount;
        let time = document.createElement("div");
        time.id = "TIME"+tournament.id;
        time.className = "col-5 p-1 border-right";
        let timestamp = tournament.time._seconds * 1000;
        let tournamentTime = new Date(timestamp).toLocaleTimeString();
        let tournamentDate = new Date(timestamp).toDateString();
        time.innerHTML = tournamentDate + "\n" + tournamentTime;
        let players = document.createElement("div");
        players.id = "PLAYERS"+tournament.id;
        players.className = "col-2 text-center p-1";
        players.innerHTML = (tournament.totalSeats - tournament.vacantSeats) + "/" + tournament.totalSeats;
        let progress = document.createElement("div");
        progress.className = "progress mt-4";
        let progressBar = document.createElement("div");
        progressBar.id = "PROGRESS_BAR"+tournament.id;
        progressBar.className = "progress-bar bg-dark progress-gradient";
        progressBar.setAttribute("role","progressbar");
        let percent = ((tournament.totalSeats-tournament.vacantSeats) / tournament.totalSeats)*100;
        progressBar.setAttribute("style","width :" +percent+"%");
        progressBar.setAttribute("role","progressbar");
        progressBar.innerHTML = percent+"% full";
        let remainig = document.createElement("p");
        remainig.id = "REMAINING"+tournament.id;
        remainig.className ="float-left text-small"
        remainig.innerHTML = tournament.vacantSeats+" remaining";


        let button = document.createElement("a");
        button.className = "btn btn-primary px-4 py-1 mt-3 mx-3 float-right";
        button.text = "Join"
        button.id = tournament.tid;
        button.setAttribute("onClick","loadSpecificTournament(this.id)");


        // card.appendChild(img);
        card.appendChild(cardBody);
        cardBody.appendChild(tournamentNames);
        cardBody.appendChild(cardBottom);
        cardBottom.appendChild(tournamentName);
        cardBottom.appendChild(amount);
        cardBottom.appendChild(time);
        cardBottom.appendChild(players);
        progress.appendChild(progressBar);

        cardBody.appendChild(progress);
        cardBody.appendChild(remainig)
        cardBody.appendChild(button);
        cardParent.appendChild(card);
}


function loadTournamentInExistingCard(tournament) {

    let tournamentNames = document.getElementById("NAMES"+tournament.id);
    tournamentNames.innerText = tournament.name;
    let tournamentName = document.getElementById("NAME"+tournament.id);
    tournamentName.innerText = tournament.name;
    let amount = document.getElementById("AMOUNT"+tournament.id);
    amount.innerText = tournament.amount;
    let time = document.getElementById("TIME"+tournament.id);
    let timestamp = tournament.time._seconds * 1000;
    let tournamentTime = new Date(timestamp).toLocaleTimeString();
    let tournamentDate = new Date(timestamp).toDateString();
    time.innerHTML = tournamentDate + "\n" + tournamentTime;
    let players = document.getElementById("PLAYERS"+tournament.id);
    players.innerHTML = (tournament.totalSeats - tournament.vacantSeats) + "/" + tournament.totalSeats;
    let progressBar = document.getElementById("PROGRESS_BAR"+tournament.id);
    let percent = ((tournament.totalSeats-tournament.vacantSeats) / tournament.totalSeats)*100;
    progressBar.setAttribute("style","width :" +percent+"%");
    progressBar.innerHTML = percent+"% full";
    let remainig = document.getElementById("REMAINING"+tournament.id);
    remainig.innerHTML = tournament.vacantSeats+" remaining";
}


function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}

function loadSpecificTournament(tid)
{
    console.log(tid)
    window.location.assign("/tournaments?tid="+tid);
}

//todo show only unregistered tournaments
//todo in the live tournament tab rename it as registered tournament and click to view it...