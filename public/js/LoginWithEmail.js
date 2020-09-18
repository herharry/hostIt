function loginWithEmail(){
    console.log("login")
    let email = document.getElementById("sign-in-email").value;
    let password = document.getElementById("sign-in-pass").value;
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    firebase.auth().signInWithEmailAndPassword(email,password).then(function(result) {
        let user = result.user;
        console.log(user)
        isEmailVerified(result)
        return false;
    });
}

function signupWithEmail()
{
    console.log("singup")
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    let uname = document.getElementById("sign-up-username").value;
    let email = document.getElementById("sign-up-email").value;
    let password = document.getElementById("sign-up-pass").value;
    console.log(email)
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function (result){
       console.log(result.user)
        let user = result.user;
       return user.updateProfile({
           displayName: uname.toString()
       }).then(function (){
           console.log("uname updated")
           return user.sendEmailVerification().then(function() {
               console.log("email verified")
               isEmailVerified(result)
           }).catch(function(error) {
               //todo yet to handle errors and exceptions
               // An error happened.
           });
       })
    }).catch(function(error) {
        //todo yet to handle errors and exceptions
    });
}
function isEmailVerified(result)
{
    if (!firebase.auth().currentUser.emailVerified) {
        alert("verify your email for further processing")
    }

   var timer = setInterval(function() {
        firebase.auth().currentUser.reload();
        if (firebase.auth().currentUser.emailVerified) {
            console.log("Email Verified!",firebase.auth().currentUser.emailVerified);
            clearInterval(timer);
            sessionLoginHandler(result.user)
        }
    }, 1000);
}