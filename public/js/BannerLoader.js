function fetchBanners()
{
    fetch("/banners")
        .then(res => res.json())
        .then(res => this.loadBannerInCarousel(this.formatResponse(res)))
        .catch(err => err);
}

//todo action to create cards
function loadBannerInCarousel(banners) {
    for (let i = 0; i < banners.length; i++) {
        
        let itemss = document.createElement("div");
        let img = document.createElement("img");
        img.src = banners[i].imageUrl;
        img.className = "img-ban"
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