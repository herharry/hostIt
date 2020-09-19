let API;
let PHONE_VERIFICATION_FLAG = false;
// FIREBASE AUTHENTICATION FOR THE CURRENT USER STARTS*****************************************************************************

async function loadProfileJS()
{
    let uid = USER_IN_SESSION.uid;
    if(getCookie("SU_SY") == "")
    {
        await fetch("/createToken", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({uid}),
        }).then(res => res.text()).then(function(res){
            firebase.auth().signInWithCustomToken(res.toString()).then(function (user)
            {
                localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
                USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
                loadUser(USER_IN_SESSION);
                setCookie("SU_SY",res.toString(),1);
            })
        });
    }
    else
    {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user)
        {
            localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
            USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
            loadUser(USER_IN_SESSION);
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadProfileJS();
        });
    }
}

//FIREBASE AUTHENTICATION FOR THE CURRENT USER ENDS *****************************************************************************
//todo set all details

function loadProfileForNewUser(user)
{
    renderForNewUser();
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
    setMobileNumber(user.phoneNumber)
    setEmail(user.email)
}

function renderForNewUser()
{
    showEdit();
    document.getElementById("cancel_btn").classList.add("d-none");
    document.getElementById("withdraw").classList.add("d-none");

}

function loadProfileForExistingUser(user)
{
    console.log(firebase.auth().currentUser)
    setProfileName(user.userName)
    setProfileImage(user.profileImageURL)
    setMobileNumber(user.mobileNo)
    setEmail(user.userEmailID)
}
function loadUser(user)
{
    fetch("/user?uid="+user.uid)
        .then(res => res.json())
        .then(function (res)
        {
            console.log("hey")
            console.log(res)
            if(res.val === "false")
            {
                console.log("in")
                API = "CREATE_API"
                loadProfileForNewUser(user);
            }
            else
            {
                console.log(res.val)
                userInDB = res.val;
                API = "UPDATE_API"
                let userInSession = res.val;
                userInSession.uid = user.uid;
                localStorage.setItem("userInfo", JSON.stringify(res.val))
                loadProfileForExistingUser(res.val);
            }
        })
        .catch(err => err);
}


setProfileName = (name) => {
    document.getElementById("profileName").innerHTML = name;
    document.getElementById("editProfileName").setAttribute("value", name);
}

setProfileImage = (image) => {
    document.getElementById("profileImage").setAttribute("src", image)
}

setMobileNumber = (number) => {
    if (number != null) {
        number = number.toString().split("+91").pop();
        console.log(number)
        document.getElementById("mobileNumber").innerHTML = number;
        document.getElementById("editMobileNumber").setAttribute("value", number);
    }
}

setEmail = (email) => {
    document.getElementById("profileEmail").innerHTML = email;
    document.getElementById("editEmail").setAttribute("value", email);
}

setAccountNo = (number) => {
    if (number != null) {
        document.getElementById("editAccountNo").setAttribute("value", number);
    }
}
setIfsc = (number) => {
    if (number != null) {
        document.getElementById("mobileNumber").innerHTML = number;
        document.getElementById("editMobileNumber").setAttribute("value", number);
    }
}
setUpiId = (number) => {
    if (number) {
        document.getElementById("mobileNumber").innerHTML = number;
        document.getElementById("editMobileNumber").setAttribute("value", number);
    }
}

// document.getElementById("edittt").addEventListener("click", () => {
//     showEdit();
//   });
removeEdit = () => {
    if(API != "CREATE_API")
    {
        document.getElementById("editProfileCard").classList.add("d-none");
        document.getElementById("myTournament").classList.remove("d-none");
    }
}

showEdit = () => {
    document.getElementById("editProfileCard").classList.remove("d-none");
    document.getElementById("myTournament").classList.add("d-none");

}

updateProfile = () => {

    var name = document.getElementById("editMobileNumber");
    var mobile = document.getElementById("editMobileNumber");
    var account = document.getElementById("editAccountNo").value;
    var ifsc = document.getElementById("editIfsc").value;
    var upi = document.getElementById("editUpiID").value;

    if ((account && ifsc) || (upi)) {


    }

}


(function () {
    'use strict';
    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);
})();


function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 &&
        (charCode < 48 || charCode > 57))
        return false;
    return true;
}

function getElementValue(id)
{
    return document.getElementById(id).value;
}
function checkDetails()
{
    let overallFlag = 0;
    let no_of_check = 1;
    let userPhone = firebase.auth().currentUser.phoneNumber;
    //CHECK 1 Starts
    console.log("+91"+getElementValue("editMobileNumber"))
    if(PHONE_VERIFICATION_FLAG == true || userPhone == "+91"+getElementValue("editMobileNumber"))
    {
        overallFlag++;
    }
    else
    {
        if(userPhone != null)
        {
            alert("please enter and verify your phone number first")
        }
    }
    //CHECK 1 ends
    if(overallFlag == no_of_check)
    {
        alert("YES")

        return true;
    }
    else{
        return false;
    }
}
function createUserInCollection()
{
    if(checkDetails() == true)
    {
        alert("YES")
        let user = {};
        user.uid = USER_IN_SESSION.uid;
        user.userName = getElementValue("editProfileName");
        user.userEmailID=getElementValue("editEmail");;
        user.walletAmount=0;
        user.role = 0;
        user.profileImageURL = document.getElementById("profileImage").getAttribute("src");
        user.mobileNo = getElementValue("editMobileNumber");
        user.vpa = getElementValue("editUpiID");
        let bankDetail = {};
        bankDetail.accountNo = getElementValue("editAccountNo");
        bankDetail.ifsc = getElementValue("editIfsc");
        bankDetail.accountName = "";
        user.bankDetail = bankDetail;
        user.tournamentIDs = [];
        if(API == "CREATE_API")
        {
            sessionLogin(firebase.auth().currentUser).then(function (res)
            {
                console.log(res)
                fetch("/createUser", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    },
                    body: JSON.stringify({user}),
                }).then(function ()
                {
                    window.location.assign("/profile");
                })
            });

        }
        else
        {
            fetch("/updateUser", {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                },
                body: JSON.stringify({user}),
            }).then(function()
            {
                window.location.assign("/profile");
            })
        }
    }
    else {
        alert("check details failed")
    }
}

function phoneChecker()
{
    let phone = document.getElementById("editMobileNumber").value;
    phone = "+91" + phone;

    if(phone == firebase.auth().currentUser.phoneNumber)
    {
        alert("already verified");
    }
    else
    {
        if(firebase.auth().currentUser.phoneNumber == null)
        {
            verifyPhoneNumber(phone)
        }
        else {
            console.log(firebase.auth().currentUser.providerData);
            firebase.auth().currentUser.unlink("phone").then(function (res)
            {
                verifyPhoneNumber(phone)
            });
        }

    }
}

function verifyPhoneNumber(phone) {

    var applicationVerifier = new firebase.auth.RecaptchaVerifier('button-addon2', {
        'size': 'invisible'
    });
    firebase.auth().currentUser.linkWithPhoneNumber(phone,applicationVerifier).then(function (confirmationResult){
        getOTP().then(function (otp){
            return confirmationResult.confirm(otp.toString()).then(()=>{
                PHONE_VERIFICATION_FLAG=true;
            });
        })
    }).catch(function (error){
            alert(error)
    })
}

let OTP = null;

function getOTP() {
   return  new Promise((resolve, reject) => {
        let otpTimer =  setInterval(()=>{
            if(OTP!=null)
            {
                window.clearInterval(otpTimer);
                resolve(OTP);
            }
            console.log("A")
        },100)
    });
}

function setOTP()
{
     OTP = document.getElementById("otp").value;
     document.getElementById("modalRegisterForm").setAttribute("aria-hidden" ,"true");
}

function storeImage()
{
    let img = document.getElementById("image-file").files[0];
    console.log(img)
    if(typeof(img)!="undefined")
    {
        let url;
        let uploadTask = firebase.app().storage("gs://hostitgaming-36a6b.appspot.com")
            .ref("user/"+userInDB.uid).child( "profile.jpg").put(img);

        uploadTask.on('state_changed', function(snapshot){
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, function(error) {
                alert("we are little depressed for the time being, try again later!")
        }, function() {
            uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
                console.log('File available at', downloadURL);
                let u = {}
                u.uid = userInDB.uid;
                u.url = downloadURL;
                url = downloadURL;
                return fetch("/updateProfileImage", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({u}),
                });
            }).catch(reason => {
                alert(reason)
            }).then(res=>res.text()).then(function (res)
            {
                if(res=="success")
                {
                    console.log("image updated in db")
                    setProfileImage(url)
                }
            });
        });
    }
}

function withdraw() {

    fetch("/availableRequest?uid="+firebase.auth().currentUser.uid).then(res=>res.json())
        .then(function (res){
            console.log(res)
            if(res.length == 0){
                console.log("no request pending")
                let accName = userInDB.bankDetail.accountName;
                let accNo = userInDB.bankDetail.accountNo;
                let ifsc = userInDB.bankDetail.ifsc;
                let upid = userInDB.vpa;
                //todo decide from a radio button  --- > either accountnno or upi id
                let typeOfTransaction = "";
                let payLoad = {}
                payLoad.amount = userInDB.walletAmount;
                payLoad.uid = firebase.auth().currentUser.uid;
                payLoad.uname = userInDB.userName;
                if(payLoad.amount ==0)
                {
                    alert("first earn, then ask")
                }
                else
                {
                    if(typeOfTransaction == "account")
                    {
                        if ((accName == "" || accNo == "" || ifsc == ""))
                        {
                            console.log("furnish your account details");
                            return;
                        }
                        else {
                            payLoad.type = 1;
                            payLoad.accountNo = accNo;
                            payLoad.accountName = accName;
                            payLoad.ifsc = ifsc;
                        }
                    }
                    else
                    {
                        if(upid=="")
                        {
                            console.log("furnish your upid first")
                            return;
                        }
                        else {
                            payLoad.type = 2;
                            payLoad.vpa = upid;
                        }
                    }

                    fetch("/requestWallet", {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({payLoad}),
                    }).then(res=>res.text()).then(function (res)
                    {
                        if(res == "success")
                        {
                            console.log("request made! keep checking your account, money maybe on the way")
                        }
                    }).catch(reason => {
                        alert(reason)
                    })
                }
            }
            else
            {
                alert("patience is virtue! Request is already made.. wait for processing")
            }
        });


}
function changeRole()
{
    let address = document.getElementById("inputEmail3").value;
    let socialAddress = document.getElementById("editSocialURL").value;
    let q1 = document.getElementById("question1").checked;
    let q2 = document.getElementById("question2").checked;


    let details = {}
    details.address= address;
    details.socialUrl = socialAddress;
    details.q1 = q1;
    details.q2 = q2;
    details.userName = userInDB.userName;
    details.uid = firebase.auth().currentUser.uid;

    return fetch("/requestRoleChange", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({details}),
    }).then(res=>res.text()).then(function ()
    {
        alert("request submitted, wait for approval")
    });
}