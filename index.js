const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const bodyParser = require("body-parser");
const express = require("express");
const admin = require("firebase-admin");
const firebase = require("firebase")
const qs = require('querystring')
const path = require("path");
const http = require("http")
const ejs = require('ejs')

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
app.set('view engine', 'ejs')

var REGISTERED_USER_FOR_TRANSACTION = [];

app.use(bodyParser.json());
app.use(cookieParser());
// app.use(csrfMiddleware);
app.use(express.static(__dirname + '/public'));

// app.all("*", (req, res, next) => {
//     console.log(req.url)
//     if(req.url != "/paynow")
//     {
//         res.cookie("XSRF-TOKEN", req.csrfToken());
//     }
//     next();
// });


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
//********************************************* PROFILE API STARTS **************************************************************//
//*************************************************************************************************************************//
app.post('/createUser', (req, res) => {
    (async () => {
        try {
            let u = req.body.user;
            console.log(req.body.user);
            console.log(req.body.user.uid);
            let bankDetail = {}
            bankDetail.accountName = u.bankDetail.accountName;
            bankDetail.accountNo = u.bankDetail.accountNo
            bankDetail.ifsc=u.bankDetail.ifsc;
            await db.collection('Users').doc(req.body.user.uid)
                .create({
                        bankDetail: bankDetail,
                        mobileNo : u.mobileNo,
                        userName:    u.userName ,
                        userEmailID:u.userEmailID,
                        walletAmount:u.walletAmount,
                        role:u.role,
                        profileImageURL:u.profileImageURL,
                        vpa:u.vpa,
                        tournamentIds:u.tournamentIDs
                });
            res.redirect("/dashboard")
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.post('/updateUser', (req, res) => {
    (async () => {
        try {
            let u = req.body.user;
            console.log(req.body.user);
            console.log(req.body.user.uid);
            let bankDetail = {}
            bankDetail.accountName = u.bankDetail.accountName;
            bankDetail.accountNo = u.bankDetail.accountNo
            bankDetail.ifsc=u.bankDetail.ifsc;
            await db.collection('Users').doc(req.body.user.uid)
                .update({
                    bankDetail: bankDetail,
                    mobileNo : u.mobileNo,
                    userName:    u.userName ,
                    userEmailID:u.userEmailID,
                    walletAmount:u.walletAmount,
                    role:u.role,
                    profileImageURL:u.profileImageURL,
                    vpa:u.vpa,
                    tournamentIds:u.tournamentIDs
                });
            res.redirect("/profile")
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.get('/user', (req, res) => {
    (async () => {
        let response;
        let uid = req.param('uid', false)
            let userDoc = db.collection('Users')

            if (uid!=false) {
                userDoc = userDoc.doc(uid);
            }
            response = await userDoc.get();
            response = response.data();
            if(response == null)
            {
                console.log("hellooos")
                response = "false"
            }
        return res.status(200).json({val : response});
    })();
});
//*************************************************************************************************************************//
//********************************************* PROFILE API ENDS **************************************************************//
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

app.post('/paynow', [parseUrl, parseJson], (req, resp) => {
        let tid = "5cf38a9f-2cf3-477f-8314-fe248fa739fb"
        let uid ="2aLrKYs2GpfogAvKYANVsjgdD9x2";
        let inGameID = req.body.phone;
        let inGameName = req.body.email;


    if (!req.body.amount || !req.body.email || !req.body.phone) {
        res.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_'+ uid + new Date().getTime();
        params['CUST_ID'] = 'customer_001';
        params['TXN_AMOUNT'] = req.body.amount.toString();
        params['CALLBACK_URL'] = 'http://localhost:3000/callback';
        params['EMAIL'] = req.body.email;
        params['MOBILE_NO'] = req.body.phone.toString();


        checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
            // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
            var txn_url = "https://securegw-stage.paytm.in/order/process";// for testing

            var form_fields = "";
            for (var x in params) {
                form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
            }
            form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

            params['TID'] = tid;
            params['UID'] = uid;
            params['IN_GAME_ID'] = inGameID;
            params['IN_GAME_NAME'] = inGameName;
            params['api'] = "paynow";


            fetch("http://localhost:3000/registerTournament", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({params}),
            }).then(res => res.text()).then(function(resMsg){
                if(resMsg == "success")
                {
                    resp.writeHead(200, { 'Content-Type': 'text/html' });
                    resp.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
                    resp.end();
                }
                else
                {
                    return resp.status(400).send("some error! pleas try again later");

                }
            }).catch(reason => {
                console.log(reason)
            });



        });
    }
});

app.post('/callback', (req, responser) => {
    var body = '';

    req.on('data', function (data) {
        body += data;
    });

    req.on('end', function () {
        var html = "";
        var post_data = qs.parse(body);

        // received params in callback

        // verify the checksum
        var checksumhash = post_data.CHECKSUMHASH;
        // delete post_data.CHECKSUMHASH;
        var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
        console.log("Checksum Result => ", result, "\n");

        let transactionDetails = {};
        transactionDetails.currency = post_data.CURRENCY;
        transactionDetails.respmsg = post_data.RESPMSG;
        transactionDetails.mid = post_data.MID;
        transactionDetails.respcode = post_data.RESPCODE;
        transactionDetails.txnid = post_data.TXNID;
        transactionDetails.txnamount = post_data.TXNAMOUNT;
        transactionDetails.orderid = post_data.ORDERID;
        transactionDetails.status = post_data.STATUS;
        transactionDetails.banktxnid = post_data.BANKTXNID;
        transactionDetails.txndate = post_data.TXNDATE;
        transactionDetails.checksumhash = post_data.CHECKSUMHASH;
        transactionDetails.api ="callback";


        if(result == true) {
             return fetch("http://localhost:3000/registerTournament", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({transactionDetails}),
            }).then(res => res.text()).then(function(Res)
             {
                 if(Res == "success")
                 {
                     console.log("indadeiiiiiii")
                     return responser.render('payResponse', {
                         'data': transactionDetails
                     })

                 }
             });
        }
        else {
           return fetch("http://localhost:3000/addTransaction", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({transactionDetails}),
            }).then(res=>res.json()).then(function (trans)
            {
                responser.render('payResponse', {
                    'data': trans
                })
            })
        }
});
});


    app.post("/addTransaction", (req, res) => {
    (async () => {
        try {
            let transDetails = req.body.transactionDetails;

            await db.collection('Transactions').doc()
                .create({
                    tournamentID : transDetails.tournamentID,
                    userID :transDetails.userID,
                    currency :transDetails.currency,
                    respmsg:transDetails.respmsg,
                    mid:transDetails.mid ,
                    respcode:transDetails.respcode,
                    txnid:transDetails.txnid,
                    txnamount:transDetails.txnamount,
                    orderid:transDetails.orderid ,
                    status:transDetails.status ,
                    banktxnid:transDetails.banktxnid,
                    txndate:transDetails.txndate,
                    checksumhash: transDetails.checksumhash
                });
           return res.status(200).json(transDetails);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.post('/addTournamentToUser', (req, res) => {
    (async () => {
        let uid = req.body.td.userID;
        let tid = req.body.td.tournamentID;
        try {
            let userDoc = db.collection('Users').doc(uid);
            let userdata = await userDoc.get();
            let tournaments = userdata.data().tournamentIds;
            tournaments.push(tid);
            await userDoc.update({
                tournamentIds : tournaments
            });
        } catch
            (error) {
            console.log(error)
            return res.status(200).json(null);
        }
        return res.status(200).json(req.body.td);
    })();
});

app.post('/reduceVacantSeat', (req, res) => {
    (async () => {
        let tid = req.body.trans.tournamentID;
        let uid = req.body.trans.userID;
        let userInfo = {}
        userInfo.inGameID = req.body.trans.inGameID;
        userInfo.inGameName = req.body.trans.inGameName;
        userInfo.userID = uid;
        try {
            let userDoc = db.collection('Tournaments').doc(tid);
            let userdata = await userDoc.get();
            let availableSeat = userdata.data().vacantSeats;
                availableSeat=availableSeat-1;
            let registeredUsers = userdata.data().registeredUsers;
                registeredUsers.push(uid);
            let registeredUserDetails = userdata.data().registeredUserDetails;
                registeredUserDetails.push(userInfo)
            await userDoc.update({
                vacantSeats : availableSeat,
                registeredUsers:registeredUsers,
                registeredUserDetails:registeredUserDetails
            });
        } catch
            (error) {
            console.log(error)
            return res.status(200).json(null);
        }
        return res.status(200).send("success");
    })();
});

app.post("/registerTournament",(req, response) => {
    let transactionDetails = req.body.transactionDetails || req.body.params;
    console.log(transactionDetails)

    if(transactionDetails.api == "paynow")
    {
        REGISTERED_USER_FOR_TRANSACTION.push(transactionDetails);
        console.log(transactionDetails.inGameName," ",REGISTERED_USER_FOR_TRANSACTION)
        return response.status(200).send("success");
    }
    else if(transactionDetails.api == "callback")
    {
        let flag=false;
        for(let i =0; i<REGISTERED_USER_FOR_TRANSACTION.length; i++)
        {
            if(REGISTERED_USER_FOR_TRANSACTION[i].ORDER_ID == transactionDetails.orderid)
            {
                transactionDetails.tournamentID = REGISTERED_USER_FOR_TRANSACTION[i].TID;
                transactionDetails.userID = REGISTERED_USER_FOR_TRANSACTION[i].UID;
                transactionDetails.inGameID = REGISTERED_USER_FOR_TRANSACTION[i].IN_GAME_ID;
                transactionDetails.inGameName = REGISTERED_USER_FOR_TRANSACTION[i].IN_GAME_NAME;

                REGISTERED_USER_FOR_TRANSACTION.splice(i,1);
                flag = true;
                break;
            }
        }

        if(flag == true) {
            console.log("true",transactionDetails.inGameName," ",REGISTERED_USER_FOR_TRANSACTION)

            return fetch("http://localhost:3000/addTransaction", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({transactionDetails}),
            }).then(res => res.json()).then(function (td) {
                console.log(td)
                return fetch("http://localhost:3000/addTournamentToUser", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({td}),
                })
                    .then(res => res.json()).then(function (trans) {
                        console.log(trans)
                        return fetch("http://localhost:3000/reduceVacantSeat", {
                            method: "POST",
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({trans}),
                        }).then(res => res.text()).then(function (res) {
                            console.log("res ", res)
                            if (res.toString() == "success") {
                                console.log("compare success")
                                return response.status(200).send("success");

                            } else {
                                return response.status(200).send("failure");
                            }
                        });
                    });
            });
        }
        else
        {
            console.log("false",transactionDetails.inGameName," ",REGISTERED_USER_FOR_TRANSACTION)
        }
    }
});
//*************************************************************************************************************************//
//********************************************* PAYTM API ENDS **************************************************************//
//*************************************************************************************************************************//

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
