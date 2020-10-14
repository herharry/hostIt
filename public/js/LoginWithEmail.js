document.getElementById("signinlog").addEventListener("click", function loginWithEmail(event) {
    event.preventDefault()
    let email = document.getElementById("sign-in-email").value;
    let password = document.getElementById("sign-in-pass").value;
    if ((email != "") && (password != "")) {
        if (validateEmail(email)) {

            // console.log(validateEmail(email));

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
            firebase.auth().signInWithEmailAndPassword(email, password).then(function (result) {
                iziToast.info({
                    title: "signing in",
                    position: "topRight"
                })
                let user = result.user;
                console.log(user)
                isEmailVerified(result)
                return false;
            }).catch(function (error) {
                iziToast.error({
                    message: error.message,
                    position: "topRight"
                })
            });
        } else {
            iziToast.error({
                message: "Enter valid email",
                position: "topRight"
            })
        }
    } else {
        var msg = "";
        if (email == "")
            msg += "Email "
        if (password == "")
            (msg == "") ? msg += "password " : msg += "& password "
        iziToast.error({
            message: msg + " field empty",
            position: "topRight"
        })
    }
})

document.getElementById("signuplog").addEventListener("click", function signupWithEmail(event) {
    event.preventDefault()
    console.log("singup")
    let uname = document.getElementById("sign-up-username").value;
    let email = document.getElementById("sign-up-email").value;
    let password = document.getElementById("sign-up-pass").value;
    if ((email != "") && (password != "") && (uname != "")) {
        if (validateEmail(email)) {

            firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

            console.log(email)
            firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result) {
                iziToast.info({
                    title: "signing up",
                    position: "bottomLeft"
                })
                console.log(result.user)
                let user = result.user;
                return user.updateProfile({
                    displayName: uname.toString()
                }).then(function () {
                    console.log("uname updated")
                    return user.sendEmailVerification().then(function () {
                        console.log("email verified")
                        isEmailVerified(result)
                    }).catch(function (error) {
                        //todo yet to handle errors and exceptions
                        // An error happened.
                    });
                }).catch(function (error) {});
            }).catch(function (error) {
                iziToast.error({
                    message: error.message,
                    position: "bottomLeft"
                })
                //todo yet to handle errors and exceptions
            });
        } else {
            iziToast.error({
                message: "Enter valid email",
                position: "bottomLeft"
            })
        }
    } else {
        var msg = "";
        if (uname == "")
            msg += "username "
        if (email == "")
            (msg == "") ? msg += "Email " : msg += "& E-Mail "
        if (password == "")
            (msg == "") ? msg += "password " : msg += "& password "
        iziToast.error({
            message: msg + " field empty",
            position: "bottomLeft"
        })
    }
});

function isEmailVerified(result) {
    console.log(firebase.auth().currentUser.emailVerified);
    if (!firebase.auth().currentUser.emailVerified) {
        // alert("verify your email for further processing")
        iziToast.success({
            title: "Verification mail sent, confirm to continue",
            position: "topCenter"
        })
    }
    var timer = setInterval(function () {
        console.log("ddd")
        firebase.auth().currentUser.reload();
        if (firebase.auth().currentUser.emailVerified) {
            console.log("Email Verified!", firebase.auth().currentUser.emailVerified);
            // iziToast.success({
            //     message: "Email verified!!!!",
            //     position: "topCenter"
            // })
            clearInterval(timer);
            sessionLoginHandler(result.user)
        }
    }, 1000);

}


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}