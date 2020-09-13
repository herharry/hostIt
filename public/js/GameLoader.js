fetch("/games")
    .then(res => res.json())
    .then(res => this.doGetGame(this.formatResponse(res)))
    .catch(err => err);


//todo action to create cards
function doGetGame(games)
{
    const parent = document.getElementById("cards");
    for(let i=0;i<games.length;i++)
    {
        console.log(games[i].gameImage);
        let card =document.createElement("div");
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