var videosData = DB.collection("Videos").doc("HostItGaming").get()
    .then(function (doc) {
        if (doc.exists) {
            var texts = '['
            doc.data().urls.forEach(element => {
                texts += '{"src":"' + element.replace("watch?v=", "embed/") + '","title":"title","thumbnail":""},'
            });
            texts = texts.slice(0, -1)
            texts += ']'
            obj = JSON.parse(texts)
            idd = 0;
            renderProducts(obj, idd);

            $(".modal").on('hide.bs.modal', function () {
                // alert($(this).attr('id').replace("modal",""))

                var i = $(this).attr('id').replace("modal", "");
                $('#frame' + i).attr('src', '');

                console.log(obj[0].src);
                $('#frame' + i).attr('src', obj[i].src);
            });

        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).then(() => {
        for (var i = 0; i < obj.length; i++) {
            getYouTubeInfo(obj[i].src, i)
        }
    })
    .catch(function (error) {
        console.log("Error getting documents: ", error);
    });




//  getYouTubeInfo("https://www.youtube.com/embed/Jqk9R9D3SD8")

function createTemplate(data, id) {
    // console.log(id);
    return `
    <div class="col-lg-3 col-md-4 p-0 p-md-3">
                <div class="modal fade" id="modal${id}" tabindex="-1" role="dialog" aria-labelledby="myModalLabel"
                    aria-hidden="true" style="display: none;">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">
                            <div class="modal-body mb-0 p-0">
                                <div class="embed-responsive embed-responsive-16by9 z-depth-1-half"><iframe
                                        class="embed-responsive-item" id="frame${id}"
                                        src="${data.src}"
                                        allowfullscreen=""></iframe></div>
                            </div>
                            <div class="modal-footer float-right"><button
                                    class="btn clse btn-outline-primary btn-rounded btn-md ml-4" id="${id}"
                                    data-dismiss="modal" type="button">close</button></div>
                        </div>
                    </div>
                </div><a><img class="img-fluid z-depth-1"
                        src="${data.thumbnail}" alt="youtube"
                        data-toggle="modal" data-target="#modal${id}"></a>
                <h6 class="p-2">${data.title}</h6>
            </div>
            `
}

function renderProducts(products, id) {
    const template =
        products.length === 0 ? `
    <p class="mx-auto">No matching results found.</p>
    ` : products.map((product) => createTemplate(product, id++)).join("\n");
    $("#video").html(template);
}




async function getYouTubeInfo(url, i) {
    var r, rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
    r = url.match(rx);
    var title = "bsjdvfjh";
    var thumbnail = "";
    let response = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + r[1] + "&fields=items(id%2Csnippet)&key=AIzaSyA-44DH4O2qCoKY2-jMZsHfxpw2ZSnC6kc");
    let data = await response.json();
    console.log(data.items[0].snippet.thumbnails)

    thumbnail = data.items[0].snippet.thumbnails.maxres.url
    // console.log(thumbnail)
    title = data.items[0].snippet.title;
    // console.log(data.items[0].snippet.thumbnails)

    // console.log(obj[i].title)
    obj[i].title = title
    obj[i].thumbnail = thumbnail
    // console.log(obj[i].title)
    renderProducts(obj, 0)
}