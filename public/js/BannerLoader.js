fetch("/games")
    .then(res => res.json())
    .then(res => this.loadBannerInCarousel(this.formatResponse(res)))
    .catch(err => err);

let aci = "apple";
//todo action to create cards
function loadBannerInCarousel(banners)
{
    const carouselParent = document.getElementById("bannerCarousel");
    const indicatorParent = document.getElementById("carouselIndicator");

    for(let i=0;i<banners.length;i++)
    {
        let li = document.createElement("li");
        li.setAttribute("data-target","#myCarousel")
        li.setAttribute("data-slide-to",i.toString());
        indicatorParent.appendChild(li);
    }
    for(let i = 0; i < banners.length; i++)
    {
        //todo add event listener to give details about the specific tournament in the banner
        let carousel =document.createElement("div");
        let img = document.createElement("img");
        img.src = banners[i].gameImage; //imageUrl
        img.style.width = "100%";
        img.style.height = "15vw";
        img.alt = banners[i].name; //description
        let att = document.createAttribute("class");
        if(i == 0)
        {
            att.value = "carousel-item active";
        }
        else{
            att.value = "carousel-item";
        }
        carousel.setAttributeNode(att);
        carousel.appendChild(img);
        carouselParent.appendChild(carousel);
    }
}



function formatResponse(res) {
    const ta = Object.keys(res).map(key => ({
        ...res[key],
        tournamentID: key
    }));
    return ta;
}