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
let USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
let userInDB;
let tournamentHolder = [];

function checkUser(user)
{
    return fetch("/user?uid="+user.uid)
        .then(res => res.json()).catch(reason => {});
}

function sessionLoginHandler(firebaseUser)
{
    localStorage.setItem("userInfo", JSON.stringify(firebaseUser))
    checkUser(firebaseUser).then(function (response)
    {
        console.log(response.val)
        if(response.val != "false")
        {
            console.log("existing user")
            sessionLogin(firebaseUser).then(function (res)
            {
                window.location.assign("/dashboard");
            })
        }
        else
        {
            //todo try to hide the url param
            window.location.assign("/profile?new=true");
        }
    })
}

function sessionLogin(user){
    return user.getIdToken().then((idToken) => {
        return fetch("/sessionLogin", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({idToken}),
        });
    }).catch(reason => {
        alert(reason)
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

function logout()
{
    localStorage.clear();
    window.location.assign("/sessionLogout");
}