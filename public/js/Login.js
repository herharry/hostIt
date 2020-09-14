
function login(){
    var firebaseConfig = {
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
            window.location.assign("/dashboard");

        });
    return false;
}