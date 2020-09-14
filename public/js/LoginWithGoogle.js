
function loginWithGoogle(){
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    let user;
    const googleAuth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(googleAuth).then(function(result) {
        console.log(result.credential.accessToken)
        user = result.user;
        return result.user.getIdToken().then((idToken) => {
            return fetch("/sessionLogin", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({ idToken }),
            });
        });
    })
        .then(() => {
            return firebase.auth().signOut();
        })
        .then(() => {
            console.log("logged in")
            window.location.assign("/profile");

        });
    return false;
}