
function loginWithGoogle(){
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    const googleAuth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(googleAuth).then(function(result) {
        sessionLogin(result)
        return false;
    });
}