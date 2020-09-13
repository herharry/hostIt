fetch("/games")
    .then(res => res.json())
    .then(res => this.loadGameInCard(this.formatResponse(res)))
    .catch(err => err);


//todo action to create cards
function loadGameInCard(games)
{
    const parent = document.getElementById("cards");
    for(let i=0;i<games.length;i++)
    {
        console.log(games[i].gameImage);
        let card =document.createElement("div");
        card.addEventListener("click", function() {fetchTournamentGames(games[i].gameID)},true);
        let img = document.createElement("img");
        img.src = games[i].gameImage;
        img.style.width = "100%";
        img.style.height = "15vw";
        img.style.objectFit = "cover";
        let att = document.createAttribute("class");
        att.value = "col-3 mr-4 py-5 bg-dark card";
        card.setAttributeNode(att);
        card.appendChild(img);
        parent.appendChild(card);
    }
}


function formatResponse(res)
{
    const ta =  Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}

function fetchTournamentGames(gameID)
{
    fetch("/tournament?gameID="+gameID)
        .then(res => res.json())
        .then(res => this.doGetGam(this.formatResponse(res)))
        .catch(err => err);
}

function doGetGam(res)
{
    console.log(res)
    //todo create a new TournamentLoader.js, create a function called loadTournamentInCards and send this json to dat method.
    //todo pass the div id so dat it can create card wherever the div is.... (used to render tournament card in diff places)
}
