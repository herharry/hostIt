var text = '[' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc" }]';

obj = JSON.parse(text);

idd = 0;
renderProducts(obj, idd);


$('.clse').on('click', function (event) {
    console.log($(this).attr('id'));
    var i = $(this).attr('id');
    $('#frame' + i).attr('src', '');

    console.log(obj[0].src);
    $('#frame' + i).attr('src', obj[0].src);
});

function createTemplate(data, id) {
    console.log(id);
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
                        src="https://mdbootstrap.com/img/screens/yt/screen-video-2.jpg" alt="youtube"
                        data-toggle="modal" data-target="#modal${id}"></a>
                <p class="p-2">${data.title}</p>
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