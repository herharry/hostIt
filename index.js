const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const firebase = require("firebase")
const qs = require('querystring')
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
const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.json({ extended: false })
const config = require('./Paytm/config');
const checksum_lib = require('./Paytm/checksum');


app.use(express.static('static'));


app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);
app.use(express.static(__dirname + '/public'));

app.all("*", (req, res, next) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
});


app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname+'/views/index.html'));
});


app.get('/register', function (req, res) {
    checkIfValidUser(req,function (callback)
    {
        if (callback == true)
        {
            res.redirect("/dashboard");
        }
        else
        {
            res.sendFile(path.join(__dirname+'/views/register.html'));
        }
    });
})

app.get('/dashboard', function (req, res) {
    checkIfValidUser(req,function (callback)
    {
        if (callback == true)
        {
            res.sendFile(path.join(__dirname+'/views/dashboard.html'));
        }
        else
        {
            res.redirect("/register");
        }
    });
})

app.get('/profile', function (req, res) {
    checkIfValidUser(req,function (callback)
    {
        if (callback == true)
        {
            res.sendFile(path.join(__dirname+'/views/profile.html'));
        }
        else
        {
            console.log("unauth")
            res.redirect("/register");
        }
    });
})


app.get("/tournaments", function (req, res) {
    console.log("AFDADf")
    res.sendFile(path.join(__dirname+'/views/tournament.html'));
});

app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    //5 day window
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    admin
        .auth()
        .createSessionCookie(idToken, {expiresIn})
        .then(
            (sessionCookie) => {
                const options = {maxAge: expiresIn, httpOnly: true};
                res.cookie("session", sessionCookie, options);
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
                console.log("inside")
                let tid = req.param("tid",false)
                let gameFetchQuery = req.param('gameID', false)
                try {
                    let tournaments = db.collection('Tournaments')
                    if(tid!=false)
                    {
                        let docData = await tournaments.doc(tid).get();
                        console.log(docData.data())
                        response.push(docData.data());
                    }
                    else
                    {
                        tournaments = tournaments.where('isFinished', '==', false);
                        if (gameFetchQuery!=false) {
                            tournaments = tournaments.where('gameID', '==', gameFetchQuery);
                        }
                        const snapshot = await tournaments.get();
                        snapshot.forEach(doc => {
                            var docJson = doc.data();
                            docJson.tid = doc.id;
                            response.push(docJson)
                        });
                    }

                } catch
                    (error) {
                    return res.status(500).send(error);
                }
                return res.status(200).json(response);
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
    admin
        .auth()
        .verifySessionCookie(sessionCookie, true /** checkRevoked */)
        .then(() => {
            return callback(true);
        })
        .catch((error) => {
            return callback(false);
        });
}

//*************************************************************************************************************************//
//********************************************* IMP METHODS ENDS **************************************************************//
//*************************************************************************************************************************//


//*************************************************************************************************************************//
//********************************************* PAYTM API STARTS **************************************************************//
//*************************************************************************************************************************//

app.post('/paynow', [parseUrl, parseJson], (req, res) => {
    if (!req.body.amount || !req.body.email || !req.body.phone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_' + new Date().getTime();
        params['CUST_ID'] = 'customer_001';
        params['TXN_AMOUNT'] = req.body.amount.toString();
        params['CALLBACK_URL'] = 'http://localhost:3000/callback';
        params['EMAIL'] = req.body.email;
        params['MOBILE_NO'] = req.body.phone.toString();


        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
            var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
            res.end();
        });
    }
});

app.post('/callback', (req, res) => {
    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        var html = "";
        var post_data = qs.parse(body);

        // received params in callback
        console.log('Callback Response: ', post_data, "\n");

        // verify the checksum
        var checksumhash = post_data.CHECKSUMHASH;
        // delete post_data.CHECKSUMHASH;
        var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
        console.log("Checksum Result => ", result, "\n");

        //todo post_data has all the transaction details use it to send a resposne

        // Send Server-to-Server request to verify Order Status
        // var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };
        //
        // checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
        //
        //     params.CHECKSUMHASH = checksum;
        //     post_data = 'JsonData=' + JSON.stringify(params);
        //
        //     var options = {
        //         hostname: 'securegw.paytm.in', // for production
        //         port: 443,
        //         path: '/merchant-status/getTxnStatus',
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded',
        //             'Content-Length': post_data.length
        //         }
        //     };
        //
        //
        //     // Set up the request
        //     var response = "";
        //     var post_req = https.request(options, function (post_res) {
        //         post_res.on('data', function (chunk) {
        //             response += chunk;
        //         });
        //
        //         post_res.on('end', function () {
        //             console.log('S2S Response: ', response, "\n");
        //
        //             var _result = JSON.parse(response);
        //             res.render('response', {
        //                 'data': _result
        //             })
        //         });
        //     });
        //
        //     // post the data
        //     post_req.write(post_data);
        //     post_req.end();
        // });
    });
});

//*************************************************************************************************************************//
//********************************************* PAYTM API ENDS **************************************************************//
//*************************************************************************************************************************//

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
