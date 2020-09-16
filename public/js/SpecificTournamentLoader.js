    let TOURNAMENT;
    let url = window.location.href;
    let urlParams = getParams(url);
    console.log(urlParams);
    fetch("/tournament?tid=" + urlParams.tid)
        .then(res => res.json())
        .then(res => this.loadTournamentInHTML(this.formatResponse(res)[0]))
        .catch(err => err);


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
            day: '2-digit',
            month: 'short',
            year: 'numeric'
            
        })
        let tournamentTime = new Date(timestamp).toLocaleString(undefined,{
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById("date").innerHTML =tournamentDate+"<br>"+ tournamentTime;
        document.getElementById("prize").innerHTML = res.prizePool[0];
 
        let percent = (res.totalSeats- res.vacantSeats / res.totalSeats)*100;
        if(percent==100){
            document.getElementById("withdraw").disabled = "true";
            document.getElementById("withdraw").classList.add("btn-danger")
            document.getElementById("withdraw").innerHTML = "Full";
        }

        document.getElementById("rules").innerHTML = res.rules;
        //todo res will have the details, just to set it..
    }


function joinConfirm()
{
    //todo set all the data here for paytm processing
    document.getElementById("payable_amount").value = TOURNAMENT.amount;
}
