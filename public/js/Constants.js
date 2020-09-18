const firebaseConfig = {
    apiKey: "AIzaSyBl_PAX0VGLEvIiFWdjWAEazUM7MJEV-1Y",
    authDomain: "hostitgaming-36a6b.firebaseapp.com",
    databaseURL: "https://hostitgaming-36a6b.firebaseio.com",
    projectId: "hostitgaming-36a6b",
    storageBucket: "hostitgaming-36a6b.appspot.com",
    messagingSenderId: "916041965514",
    appId: "1:916041965514:web:88009790aa188d22947933",
    measurementId: "G-LQMV0QYN8B"
};
firebase.initializeApp(firebaseConfig);
const DB= firebase.firestore();
const USER_IN_SESSION = JSON.parse(sessionStorage.getItem("userInfo"));


function sessionLogin(result){
    console.log("inside")
    return result.user.getIdToken().then((idToken) => {
        return fetch("/sessionLogin", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
            },
            body: JSON.stringify({idToken}),
        });
    }).then(() => {
        let user = result.user;
        sessionStorage.setItem("userInfo", JSON.stringify(user))
        window.location.assign("/profile");
    });
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function setCookie(cname, cvalue, exhours) {
    let d = new Date();
    d.setTime(d.getTime() + (exhours*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function delete_cookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}