
    let url = window.location.href;
    let urlParams= getParams(url);
    console.log(urlParams);
    fetch("/tournament?tid="+urlParams.tid)
        .then(res => res.json())
        .then(res => this.loadTournamentInHTML(this.formatResponse(res)[0]))
        .catch(err => err);


function getParams (url) {
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

function loadTournamentInHTML(res)
{
    console.log(res)
    //todo res will have the details, just to set it..
}

function joinConfirm()
{
    //todo paytm integ
    console.log("paytm call")
}