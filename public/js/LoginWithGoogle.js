
function loginWithGoogle(){
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    const googleAuth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(googleAuth).then(function(result) {
        iziToast.warning({
            title: "signing in",
            position: "topCenter"
        })
        sessionLoginHandler(result.user)
        return false;
    }).catch(function(error){
        console.log(error);
    });
}