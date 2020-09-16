function fetchTournaments() {
    fetch("/tournament")
        .then(res => res.json())
        .then(res => this.loadTournamentInCards(this.formatResponse(res)))
        .catch(err => err);
}


function loadTournamentInCards(tournaments) {
    console.log(tournaments)

    const cardParent = document.getElementById("tournamentCards")
    for (let i = 0; i < tournaments.length; i++) {
        let card = document.createElement("div");
        card.className = "card p-0 bg-dark my-2 mx-2 col-12 col-lg-6";
        // let img = document.createElement("img");
        // img.src = getGameImage(tournaments[i].gameID)
        // img.className = "card-img-top";
        // img.alt = "";
        let tournamentNames = document.createElement("h3");
        tournamentNames.className = "card-title text-upper";
        tournamentNames.innerText = tournaments[i].name;
        let cardBody = document.createElement("div");
        cardBody.className = "card-body container-fluid py-2";
        let cardBottom = document.createElement("div");
        cardBottom.className = "row mb-2 border-bottom";
        let tournamentName = document.createElement("div");
        tournamentName.className = "col-3 p-1 border-right";
        tournamentName.innerText = tournaments[i].name;
        let amount = document.createElement("div");
        amount.className = "col-2 text-center p-1 border-right";
        amount.innerText = tournaments[i].amount;
        let time = document.createElement("div");
        time.className = "col-5 p-1 border-right";
        let timestamp = tournaments[i].time._seconds * 1000;
        let tournamentTime = new Date(timestamp).toLocaleTimeString();
        let tournamentDate = new Date(timestamp).toDateString();
        time.innerHTML = tournamentDate + "\n" + tournamentTime;
        let players = document.createElement("div");
        players.className = "col-2 text-center p-1";
        players.innerHTML = (tournaments[i].totalSeats - tournaments[i].vacantSeats) + "/" + tournaments[i].totalSeats;
        let progress = document.createElement("div");
        progress.className = "progress mt-4";
        let progressBar = document.createElement("div");
        progressBar.className = "progress-bar bg-dark progress-gradient";
        progressBar.setAttribute("role","progressbar");
        let percent = ((tournaments[i].totalSeats-tournaments[i].vacantSeats) / tournaments[i].totalSeats)*100;
        progressBar.setAttribute("style","width :" +percent+"%");
        progressBar.setAttribute("role","progressbar");
        progressBar.innerHTML = percent+"% full";
        let remainig = document.createElement("p");
        remainig.className ="float-left text-small"
        remainig.innerHTML = tournaments[i].vacantSeats+" remaining";

        
        let button = document.createElement("a");
        button.className = "btn btn-primary px-4 py-1 mt-3 mx-3 float-right";
        button.text = "Join"
        button.id = tournaments[i].tid;
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