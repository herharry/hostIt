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
        card.className = "card bg-dark mr-2 mb-4";
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
        players.innerHTML = tournaments[i].vacantSeats + "/" + tournaments[i].totalSeats;
        let progress = document.createElement("div");
        progress.className = "progress ";
        let progressBar = document.createElement("div");
        progressBar.className = "progress-bar bg-dark progress-gradient";
        progressBar.setAttribute("role","progressbar");
        let percent = (tournaments[i].vacantSeats / tournaments[i].totalSeats)*100;
        console.log(percent);
        progressBar.setAttribute("style","width :" +percent+"%");
        progressBar.setAttribute("role","progressbar");

        
        let button = document.createElement("a");
        button.className = "btn btn-primary float-right mt-4";
        button.text = "Join"

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