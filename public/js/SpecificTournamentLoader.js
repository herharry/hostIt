let TOURNAMENT;
let url = window.location.href;
let urlParams = getParams(url);
console.log(urlParams);

// FIREBASE AUTHENTICATION FOR THE CURRENT USER STARTS*****************************************************************************

async function loadSpecificTournamentJS() {
    let uid = USER_IN_SESSION.uid;
    if (getCookie("SU_SY") == "") {
        await fetch("/createToken", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid
            }),
        }).then(res => res.text()).then(function (res) {
            firebase.auth().signInWithCustomToken(res.toString()).then(function (user) {
                setCookie("SU_SY", res.toString(), 1);
                specificTournamentListener();
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {
            console.log("hey")
            specificTournamentListener();
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadSpecificTournamentJS();
        });
    }
}

function specificTournamentListener() {
    localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
    USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
    let doc = DB.collection("Users").doc(USER_IN_SESSION.uid);
    doc.get().then(function (DOC) {
        userInDB = DOC.data();
    });

    DB.collection("Tournaments").doc(urlParams.tid).onSnapshot(function (doc) {
        // console.log(doc.data())
        loadTournamentInHTML(doc.data())
    });
}
//FIREBASE AUTHENTICATION FOR THE CURRENT USER ENDS *****************************************************************************


function getParams(url) {
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

function loadTournamentInHTML(res) {
    TOURNAMENT = res;
    // console.log(res)
    document.getElementById("name").innerHTML = res.name;
    if (!res.isFinished) {
        document.getElementById("status").innerHTML = "registration open";
        document.getElementById("status").className = "badge badge-success";

    } else {
        document.getElementById("status").innerHTML = "registration closed";
        document.getElementById("status").className = "badge badge-danger";
    }

    document.getElementById("participants").innerHTML = (res.totalSeats - res.vacantSeats) + "/" + res.totalSeats;
    let timestamp = res.time.seconds * 1000;
    let tournamentDate = new Date(timestamp).toLocaleString(undefined, {
        month: 'short',
        day: '2-digit',
        year: 'numeric'

    })
    let tournamentTime = new Date(timestamp).toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById("date").innerHTML = tournamentDate + "<br>" + tournamentTime;
    let total = 0;
    
    for(i=0;i<res.prizePool.length;i++){
        total += res.prizePool[i];

    }
    renderProducts(res.prizePool,1)
    res.prizePool.forEach(element => {
        
        // total += element;
    });
    document.getElementById("prize").innerHTML = total;

    let percent = ((res.totalSeats - res.vacantSeats) / res.totalSeats) * 100;
    if (percent == 100) {
        document.getElementById("join").disabled = "true";
        document.getElementById("join").classList.add("btn-danger")
        document.getElementById("join").innerHTML = "Full";
    }

    getGame(res);

    document.getElementById("overlay").classList.add("d-none")
    document.getElementById("rules").innerHTML = res.rules;

}

function createTemplate(data, id) {
    return `<tr>
    <th class="text-center" scope="row"><small>${id}</small></th>
    <th class="text-center"><small>${data}</small></th>
  </tr>`
}

function renderProducts(products, id) {
    const template =
        products.length === 0 ? `
    <p class="mx-auto">No Data Found.</p>
    ` : products.map((product) => createTemplate(product, id++)).join("\n");
    $("#prizeTable").html(template);
}

getGame = (data) => {
    fetch("/games")
        .then(res => res.json())
        .then(res => this.loadGameDetails(this.formatResponse(res), data))
        .catch(err => err);
}

loadGameDetails = (data, tournamentData) => {
    data.forEach(element => {
        // console.log(element);    

        if (tournamentData.gameID == element.gameID) {

            document.getElementById("tournamentImage").setAttribute("src", element.gameImage)
            if ("gameMode" in tournamentData) {
                // console.log(element.gameModes[tournamentData.gameMode]);
                // tournamentData.gameMode.forEach(hahe = ()=>{
                // })
                let span = document.createElement("span");
                span.className = "badge badge-pill px-3 mx-1 badge-danger";
                span.innerHTML = element.gameModes[tournamentData.gameMode];
                document.getElementById("gameTags").appendChild(span);
            }
            if ("teamSize" in tournamentData) {
                let span = document.createElement("span");
                span.className = "badge badge-pill px-3 badge-danger";
                span.innerHTML = element.teamSize[tournamentData.teamSize];
                document.getElementById("gameTags").appendChild(span);            
            }
            if ("tags" in tournamentData) {
                let span = document.createElement("span");
                span.className = "badge badge-pill px-3 mx-1 badge-danger";
                span.innerHTML = element.tags[tournamentData.tags[0]];
                document.getElementById("gameTags").appendChild(span);            
            }
            
        }
    });
}

function joinConfirm() {
    console.log(userInDB.tournamentIds)
    let registeredTournament = userInDB.tournamentIds;
    console.log(registeredTournament)
    let flag = 1;
    for (let i = 0; i < registeredTournament.length; i++) {
        console.log(registeredTournament[i])
        if (registeredTournament[i] == urlParams.tid) {
            //todo create a new modal for displaying already registered and copy line 113 and 114 to set the attribute of the modal
            iziToast.warning({
                message: "already registered",
                position: "topCenter"
            });
            flag = 0;
            // alert("already")
        }
    }
    if (flag) {
        document.getElementById("join").setAttribute("data-toggle", "modal");
        document.getElementById("join").setAttribute("data-target", "#joinTournamentModel");
        document.getElementById("joinEmail").value = USER_IN_SESSION.email;
        let number = USER_IN_SESSION.phoneNumber.toString().split("+91").pop();
        document.getElementById("joinNumber").value = number;
        document.getElementById("tournament_id").value = urlParams.tid;
        document.getElementById("user_id").value = USER_IN_SESSION.uid;
        document.getElementById("payable_amount").value = TOURNAMENT.amount;
    }
}

(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();