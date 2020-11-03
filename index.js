//******************************************************************************************************************************************//
//******************************************** INIT STARTS **********************************************************************************//
//*******************************************************************************************************************************************//

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
app.use(express.static(__dirname + '/public'));

//*********************************************************************************************************************************************//
//******************************************** LOCAL CREDENTIALS *************************************************************************************//
//***************************************************************************************************************************************
let callBack = 'http://host-it-test.herokuapp.com/callback';
let registerTournament = 'http://host-it-test.herokuapp.com/registerTournament';
let addTransaction = 'http://host-it-test.herokuapp.com/addTransaction';
let addTournament = 'http://host-it-test.herokuapp.com/addTournamentToUser';
let reduceVacantSeat = 'http://host-it-test.herokuapp.com/reduceVacantSeat';
if(process.argv[2] == "local")
{
    callBack = 'http://localhost:3000/callback';
    registerTournament= 'http://localhost:3000/registerTournament';
    addTransaction = 'http://localhost:3000/addTransaction';
    addTournament='http://localhost:3000/addTournamentToUser';
    reduceVacantSeat = 'http://localhost:3000/reduceVacantSeat';
}

//*********************************************************************************************************************************************//
//******************************************** LOCAL CREDENTIALS ENDS *************************************************************************************//
//***************************************************************************************************************************************





//*********************************************************************************************************************************************//
//******************************************** INIT ENDS *************************************************************************************//
//**********************************************************************************************************************************************//


app.all("*", (req, res, next) => {
    console.log(req.url)
    next();
});

//*********************************************************************************************************************************************//
//******************************************** HTML STARTS *************************************************************************************//
//*******************************************************************************************************************************************

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
    let x = req.param('new', false)
    checkIfValidUser(req,function (callback)
    {
        if (callback == true || x=="true")
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
    checkIfValidUser(req,function (callback)
    {
        if (callback == true || x=="true")
        {
            res.sendFile(path.join(__dirname+'/views/tournament.html'));
        }
        else
        {
            console.log("unauth")
            res.redirect("/register");
        }
    });
});

app.get('/videos', function (req, res) {
    checkIfValidUser(req,function (callback)
    {
        if (callback == true)
        {
            res.sendFile(path.join(__dirname+'/views/videos.html'));
        }
        else
        {
            res.redirect("/register");
        }
    });
})

app.get('/admin', function (req, res) {
    checkIfValidUser(req,function (callback)
    {
        if (callback == true)
        {
            res.sendFile(path.join(__dirname+'/views/admin.html'));
            // res.render('admin')
        }
        else
        {
            res.redirect("/register");
        }
    });
})


//*********************************************************************************************************************************************//
//******************************************** HTML ENDS *************************************************************************************//
//*******************************************************************************************************************************************

//*********************************************************************************************************************************************//
//******************************************** VALIDATION API STARTS *************************************************************************************//
//*******************************************************************************************************************************************


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
               return res.end(JSON.stringify({status: "success"}));
            },
            (error) => {
                console.log(error)
               return res.status(401).send("UNAUTHORIZED REQUEST!");
            }
        );
});


app.get("/sessionLogout", (req, res) => {
    res.clearCookie("session");
    res.clearCookie("SU_SY");
    res.redirect("/");
});

app.post("/createToken", (req, response) => {
    let uid = req.body.uid;
    admin.auth().createCustomToken(uid).then(function (customToken)
    {
        response.status(200).send(customToken);
    })
});

//*********************************************************************************************************************************************//
//******************************************** VALIDATION API ENDS *************************************************************************************//
//*******************************************************************************************************************************************


//*********************************************************************************************************************************************//
//******************************************** TOURNAMENT API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

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


//*********************************************************************************************************************************************//
//******************************************** TOURNAMENT API ENDS *************************************************************************************//
//*******************************************************************************************************************************************


//*********************************************************************************************************************************************//
//******************************************** GAME API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

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

//*********************************************************************************************************************************************//
//******************************************** GAME API ENDS *************************************************************************************//
//*******************************************************************************************************************************************


//*********************************************************************************************************************************************//
//******************************************** BANNER API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

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

app.post('/addBanner', (req, res) => {
    (async () => {
        try {
            let payload = req.body.payLoad;
            console.log(payload)

            await db.collection('Banners').doc()
                .create({
                    description : payload.description,
                    imageUrl :payload.url,
                    tournamentId :payload.tid
                });
            return res.status(200).send("success");
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

//*********************************************************************************************************************************************//
//******************************************** BANNER API ENDS *************************************************************************************//
//*******************************************************************************************************************************************





//*********************************************************************************************************************************************//
//******************************************** WALLET API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

app.post('/requestWallet', (req, res) => {
    (async () => {
        try {
            let payload = req.body.payLoad;
            let details = {}
            if(payload.type == 1)
            {
                details.accountName = payload.accountName;
                details.accountNo = payload.accountNo
                details.ifsc=payload.ifsc;
            }
            else if(payload.type ==2)
            {
                details.vpa = payload.vpa;
            }

            await db.collection('WalletRequests').doc()
                .create({
                    amount: payload.amount,
                    details : details,
                    name:    payload.uname ,
                    status: 1,
                    type:payload.type,
                    userID:payload.uid
                });
            return res.status(200).send("success");
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.get('/availableRequest', (req, res) => {
    (async () => {
        let response = [];
        try {
            let uid = req.param("uid",false);
            console.log("helossss")
            let games = db.collection('WalletRequests').where("status","==",1);
            const snapshot = await games.get();
            console.log(snapshot)
            snapshot.forEach(doc => {
                if(uid == doc.data().userID || uid==false)
                {
                    console.log(doc.data());
                    response.push(doc.data());
                }
            });
        } catch
            (error) {
            return res.status(500).send(error);
        }
        return res.status(200).json(response);
    })();
});

//*********************************************************************************************************************************************//
//******************************************** WALLET API ENDS *************************************************************************************//
//*******************************************************************************************************************************************




//*********************************************************************************************************************************************//
//******************************************** USER API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

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
                    walletAmount:0,
                    role:u.role,
                    token:u.token,
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
            console.log("inga vandhuruchu da")
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
                    token : u.token,
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

app.post('/updateProfileImage', (req, res) => {
    (async () => {
        try {
            let url = req.body.u.url;
            let uid = req.body.u.uid;
            await db.collection('Users').doc(uid)
                .update({
                    profileImageURL:url,
                });
            return res.status(200).send("success");
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.post('/updateRole', (req, res) => {
    (async () => {
        try {
            let uid = req.body.uid;
            await db.collection('Users').doc(uid)
                .update({
                    role:1,
                });
            return res.status(200).send("success");
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

//*********************************************************************************************************************************************//
//******************************************** USER API ENDS *************************************************************************************//
//*******************************************************************************************************************************************




//*********************************************************************************************************************************************//
//******************************************** USER AUTH API STARTS *************************************************************************************//
//*******************************************************************************************************************************************

app.post('/requestRoleChange', (req, res) => {
    (async () => {
        let details = req.body.details;
        try {
            await db.collection('UserAuthRequest').doc(details.uid)
                .create({
                    address: details.address,
                    q1 : details.q1,
                    q2:    details.q2 ,
                    socialUrl :details.socialUrl,
                    status:false,
                    userId:details.uid,
                    userName:details.userName,
                });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
        return res.status(200).send("success");
    })();
});


//*********************************************************************************************************************************************//
//******************************************** USER AUTH API ENDS *************************************************************************************//
//*******************************************************************************************************************************************




//******************************************************************************************************************************************//
//********************************************* PAYTM API STARTS ****************************************************************************//
//*******************************************************************************************************************************************//

app.post('/paynow', [parseUrl, parseJson], (req, resp) => {
    console.log(req)
    console.log(req.body.amount)
    console.log(req.body.phone)
    console.log(req.body.email)
    console.log(req.body.inGameName)
    console.log(req.body.inGameID)
    console.log(req.body.tid)
    console.log(req.body.uid)


    let tid = req.body.tid
    let uid =req.body.uid
    let inGameID = req.body.inGameID;
    let inGameName = req.body.inGameName;


    if (!req.body.amount || !req.body.email || !req.body.phone) {
        resp.status(400).send('Payment failed')
    } else {
        var params = {};
        params['MID'] = config.PaytmConfig.mid;
        params['WEBSITE'] = config.PaytmConfig.website;
        params['CHANNEL_ID'] = 'WEB';
        params['INDUSTRY_TYPE_ID'] = 'Retail';
        params['ORDER_ID'] = 'TEST_'+ uid + new Date().getTime();
        params['CUST_ID'] = 'customer_001';
        params['TXN_AMOUNT'] = req.body.amount.toString();
        params['CALLBACK_URL'] = callBack;
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


            fetch(registerTournament, {
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


        if(result == true && transactionDetails.status != "TXN_FAILURE") {
            return fetch(registerTournament, {
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
            let flag=false;
            for(let i =0; i<REGISTERED_USER_FOR_TRANSACTION.length; i++) {
                if (REGISTERED_USER_FOR_TRANSACTION[i].ORDER_ID == transactionDetails.orderid) {
                    transactionDetails.tournamentID = REGISTERED_USER_FOR_TRANSACTION[i].TID;
                    transactionDetails.userID = REGISTERED_USER_FOR_TRANSACTION[i].UID;
                    transactionDetails.inGameID = REGISTERED_USER_FOR_TRANSACTION[i].IN_GAME_ID;
                    transactionDetails.inGameName = REGISTERED_USER_FOR_TRANSACTION[i].IN_GAME_NAME;

                    REGISTERED_USER_FOR_TRANSACTION.splice(i, 1);
                    flag = true;
                    break;
                }
            }
            return fetch(addTransaction, {
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
            console.log(transDetails)
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

            return fetch(addTransaction, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({transactionDetails}),
            }).then(res => res.json()).then(function (td) {
                console.log(td)
                return fetch(addTournament, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({td}),
                })
                    .then(res => res.json()).then(function (trans) {
                        console.log(trans)
                        return fetch(reduceVacantSeat, {
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

//********************************************************************************************************************************************//
//********************************************* PAYTM API ENDS ******************************************************************************//
//********************************************************************************************************************************************//



//*******************************************************************************************************************************************//
//********************************************* IMP METHODS *********************************************************************************//
//*******************************************************************************************************************************************//

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

//********************************************************************************************************************************************//
//********************************************* IMP METHODS ENDS *****************************************************************************//
//*******************************************************************************************************************************************//


app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
