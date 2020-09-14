function loginWithEmail(){
    console.log("login")
    let email = document.getElementById("sign-in-email").value;
    let password = document.getElementById("sign-in-pass").value;
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    firebase.auth().signInWithEmailAndPassword(email,password).then(function(result) {
        let user = result.user;
        isEmailVerified(result)
        return false;
    });
}

function signupWithEmail()
{
    console.log("singup")
    let uname = document.getElementById("sign-up-username").value;
    let email = document.getElementById("sign-up-email").value;
    let password = document.getElementById("sign-up-pass").value;
    console.log(email)
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result){
       console.log(result.user)
        let user = result.user;
        user.sendEmailVerification().then(function() {
            console.log("email verified")
            isEmailVerified(result)
        }).catch(function(error) {
            alert("verify email to continue")
            // An error happened.
        });
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(error)
    });
}

function sessionLogin(result){
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
    })
        .then(() => {
            return firebase.auth().signOut();
        })
        .then(() => {
            console.log("logged in")
            window.location.assign("/profile");
        });
}

function isEmailVerified(result)
{
    setInterval(function() {
        firebase.auth().currentUser.reload();
        if (firebase.auth().currentUser.emailVerified) {
            console.log("Email Verified!");
            sessionLogin(result)
        }
    }, 1000);
}