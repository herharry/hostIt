var text = '{"employees":[' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc"},' +
    '{"src":"https://www.youtube.com/embed/wTcNtgA6gHs?enablejsapi=1&version=3&playerapiid=ytplayer","title":"abc" }]}';

obj = JSON.parse(text);



loadVideos = (data, id) => {

    var column = document.createElement("div");
    column.className = "col-lg-3 col-md-4 p-0 p-md-3"
    var modalBody = document.createElement("div");
    modalBody.className = "modal fade"
    modalBody.id = "modal" + id;
    modalBody.setAttribute("tabindex", "-1");
    modalBody.setAttribute("role", "dialog");
    modalBody.setAttribute("aria-labelledby", "myModalLabel");
    modalBody.setAttribute("aria-hidden", "true");
    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog modal-lg"
    modalDialog.setAttribute("role", "document");
    var modalContent = document.createElement("div");
    modalContent.className = "modal-content"
    var modelinBody = document.createElement("div");
    modelinBody.className = "modal-body mb-0 p-0"
    var frameBody = document.createElement("div");
    frameBody.className = "embed-responsive embed-responsive-16by9 z-depth-1-half"
    var frame = document.createElement("iframe");
    frame.className = "embed-responsive-item"
    frame.id = 'frame'+id
    frame.setAttribute("src", data.src);
    frame.setAttribute('allowFullScreen', '')
    frameBody.appendChild(frame)
    modelinBody.appendChild(frameBody)

    var footer = document.createElement("div");
    footer.className = "modal-footer float-right"
    var btn = document.createElement("button");
    btn.className = "btn clse btn-outline-primary btn-rounded btn-md ml-4"
    btn.id = id;
    btn.setAttribute("data-dismiss", "modal");
    btn.setAttribute("type", "button");
    btn.innerHTML = "close"
    footer.appendChild(btn);

    modalContent.appendChild(modelinBody)
    modalContent.appendChild(footer)
    modalDialog.appendChild(modalContent)
    modalBody.appendChild(modalDialog)

    var anchor = document.createElement("a");
    var img = document.createElement("img");
    img.className = "img-fluid z-depth-1"
    img.src = "https://mdbootstrap.com/img/screens/yt/screen-video-2.jpg"
    img.setAttribute("alt", "youtube");
    img.setAttribute("data-toggle", "modal");
    img.setAttribute("data-target", "#modal" + id)
    anchor.appendChild(img);

    var p = document.createElement("p");
    p.className = "p-2"
    p.innerText = data.title;

    id++;

    column.appendChild(modalBody)
    column.appendChild(anchor)
    column.appendChild(p)
    document.getElementById("video").appendChild(column);
}
idd = 0;
obj.employees.forEach(element => {
    console.log(element);
    idd = idd + 1;
    loadVideos(element, idd);
});



$('.clse').on('click', function (event) {
    console.log($(this).attr('id'));
    var i=$(this).attr('id');
    $('#frame'+i).attr('src', '');
   
    console.log(obj.employees[i].src);
    $('#frame'+i).attr('src', obj.employees[i].src);
});