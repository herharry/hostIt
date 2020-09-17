let TOURNAMENT;
let url = window.location.href;
let urlParams = getParams(url);
console.log(urlParams);
fetch("/tournament?tid=" + urlParams.tid)
    .then(res => res.json())
    .then(res => this.loadTournamentInHTML(this.formatResponse(res)[0]))
    .catch(err => err);

let sessionDetails = JSON.parse(sessionStorage.getItem("userInfo"))

function getParams(url) {
    var params = {};
    var parser = document.createElement('a');
    parser.href = url;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    }
    return params;
};

function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}

function loadTournamentInHTML(res) {
    TOURNAMENT = res;
    console.log(res)
    document.getElementById("name").innerHTML = res.name;
    if (!res.isFinished) {
        document.getElementById("status").innerHTML = "registration open";
        document.getElementById("status").className = "badge badge-success";

    } else {
        document.getElementById("status").innerHTML = "registration closed";
        document.getElementById("status").className = "badge badge-danger";
    }

    document.getElementById("participants").innerHTML = (res.totalSeats - res.vacantSeats) + "/" + res.totalSeats;
    let timestamp = res.time._seconds * 1000;
    let tournamentDate = new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'

    })
    let tournamentTime = new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById("date").innerHTML = tournamentDate + "<br>" + tournamentTime;
    let total  = 0;
    res.prizePool.forEach(element => {
        total += element;
    });
    document.getElementById("prize").innerHTML = total;

    let percent = (res.totalSeats - res.vacantSeats / res.totalSeats) * 100;
    if (percent == 100) {
        document.getElementById("join").disabled = "true";
        document.getElementById("join").classList.add("btn-danger")
        document.getElementById("join").innerHTML = "Full";
    }

    // console.log(sessionDetails)
    getGame(res);

    document.getElementById("rules").innerHTML = res.rules;

}

getGame = (data) =>{
    fetch("/games")
        .then(res => res.json())
        .then(res => this.loadGameDetails(this.formatResponse(res),data))
        .catch(err => err);
}

loadGameDetails = (data,tournamentData)=>{
    data.forEach(element => {
        if(tournamentData.gameID == element.gameID){
            document.getElementById("tournamentImage").setAttribute("src",element.gameImage)
            if("gameMode" in tournamentData){
                console.log(element.gameModes[tournamentData.gameMode]);
            }
        }
        // console.log(element);
    });
}

function joinConfirm() {
    //todo set all the data here for paytm processing
    document.getElementById("joinEmail").value = sessionDetails.userEmailID;
    document.getElementById("joinNumber").value = sessionDetails.mobileNo;
    document.getElementById("payable_amount").value = TOURNAMENT.amount;
}