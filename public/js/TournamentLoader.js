function fetchTournaments() {
    fetch("/tournament")
        .then(res => res.json())
        .then(res => this.loadTournamentInCards(this.formatResponse(res)))
        .catch(err => err);
}

function loadTournamentInCards(tournaments) {
    const cardParent = document.getElementById("tournamentCards")
    for (let i = 0; i < tournaments.length; i++) {
        let card = document.createElement("div");
            card.className = "card bg-dark";
            card.style.width = "30rem";
        let img = document.createElement("img");
            // img.src = getGameImage(tournaments[i].gameID)
            img.className = "card-img-top";
            img.alt = "";
        let cardBody = document.createElement("div");
            cardBody.className = "card-body container";
        let cardBottom = document.createElement("div");
            cardBottom.className = "row mb-3 border-bottom";
        let tournamentName = document.createElement("div");
            tournamentName.className = "col-3 border-right";
            tournamentName.innerText = tournaments[i].name;
        let amount = document.createElement("div");
            amount.className = "col-3 border-right";
            amount.innerText = tournaments[i].amount;
        let time = document.createElement("div");
            time.className = "col-3 border-right";
            let timestamp = tournaments[i].time._seconds * 1000;
            let tournamentTime = new Date(timestamp).toLocaleTimeString();
            let tournamentDate = new Date(timestamp).toDateString();
            time.innerHTML = tournamentDate + "\n" + tournamentTime;
        let players = document.createElement("div");
            players.className = "col-3 border-right";
            players.innerHTML = tournaments[i].vacantSeats + "/" + tournaments[i].totalSeats;
        let button = document.createElement("a");
            button.className = "btn btn-primary m-1";
            button.text = "Join"

        card.appendChild(img);
        card.appendChild(cardBody);
        cardBody.appendChild(cardBottom)
        cardBottom.appendChild(tournamentName);
        cardBottom.appendChild(amount);
        cardBottom.appendChild(time);
        cardBottom.appendChild(players);
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