fetch("/banners")
    .then(res => res.json())
    .then(data => this.doAction(this.formatResponse(data)))
    .catch(err => err);

let aci = "apple";
//todo action to create cards
function doAction(banners) {

    for (let i = 0; i < banners.length; i++) {

        //     console.log(banners[i].description)
        //     console.log(banners[i].tournamentId)
        //     console.log(banners[i].imageUrl)

    }
}



function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}