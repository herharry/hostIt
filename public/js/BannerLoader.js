fetch("/banners")
    .then(res => res.json())
    .then(res => this.doGetBanner(this.formatResponse(res)))
    .catch(err => err);

let aci = "apple";
//todo action to create cards
function doAction(banners) {
    // const cauroselParent = document.getElementById("carousel-in");
    for (let i = 0; i < banners.length; i++) {
        
        let itemss = document.createElement("div");
        let img = document.createElement("img");
        img.src = banners[i].imageUrl;
        let att = document.createAttribute("class");
        
        i ? att.value = "carousel-item " : att.value = "carousel-item active" ;
        
        
        itemss.appendChild(img);
        itemss.setAttributeNode(att);
        document.getElementById("bannerList").appendChild(itemss);
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