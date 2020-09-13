const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const firebase = require("firebase")
const path = require("path");

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

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://hostitgaming-36a6b.firebaseio.com"
});

const csrfMiddleware = csrf({cookie: true});
const db = admin.firestore();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.static('static'));


app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(express.static(__dirname + '/public'));

// app.all("*", (req, res, next) => {
//     res.cookie("XSRF-TOKEN", req.csrfToken());
//     next();
// });


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    //5 day window
    console.log(idToken)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin
        .auth()
        .createSessionCookie(idToken, {expiresIn})
        .then(
            (sessionCookie) => {
                const options = {maxAge: expiresIn, httpOnly: true};
                res.cookie("session", sessionCookie, options);
                console.log("cookie set")
                res.end(JSON.stringify({status: "success"}));
            },
            (error) => {
                console.log(error)
                res.status(401).send("UNAUTHORIZED REQUEST!");
            }
        );
});


app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    // res.redirect("/login");
    res.end(JSON.stringify({status: "success"}));

});


//*************************************************************************************************************************//
//******************************************** GET API STARTS **************************************************************//
//*************************************************************************************************************************//


// ############# GET ALL TOURNAMENT AND LIVE TOURNAMENT DETAILS
app.get('/tournament', (req, res) => {
            (async () => {
                let response = [];
                let gameFetchQuery = req.param('gameId', false)
                try {
                    let tournaments = db.collection('Tournaments')
                    if (gameFetchQuery!=false) {
                        tournaments = tournaments.where('gameID', '==', gameFetchQuery);
                    }
                    const snapshot = await tournaments.get();
                    snapshot.forEach(doc => {
                        response.push(doc.data());
                    });
                } catch
                    (error) {
                    return res.status(500).send(error);
                }
                return res.status(200).send(response);
            })();
});

// ############# GET ALL GAMES
app.get('/games', (req, res) => {
            (async () => {
                let response = [];
                try {
                    let games = db.collection('Games');
                    const snapshot = await games.get();
                    snapshot.forEach(doc => {
                        var docJson = doc.data();
                        docJson.gameID = doc.id;
                        response.push(docJson)
                    });
                } catch
                    (error) {
                    return res.status(500).send(error);
                }
                return res.status(200).json(response);
            })();
});

// ############# GET ALL BANNERS
app.get('/banners', (req, res) => {
            (async () => {
                let response = [];
                try {
                    let games = db.collection('Banners');
                    const snapshot = await games.get();
                    snapshot.forEach(doc => {
                        response.push(doc.data())
                    });
                } catch
                    (error) {
                    return res.status(500).send(error);
                }
                return res.status(200).json(response);
            })();
});


//*************************************************************************************************************************//
//********************************************* GET API ENDS **************************************************************//
//*************************************************************************************************************************//

//*************************************************************************************************************************//
//********************************************* IMP METHODS **************************************************************//
//*************************************************************************************************************************//

function checkIfValidUser(req,callback) {
    const sessionCookie = req.cookies.session || "";
    console.log(sessionCookie)
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(() => {
            console.log("session verified")
            return callback(true);
        })
        .catch((error) => {
            return callback(false);
        });
}

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
