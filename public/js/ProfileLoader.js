let API;
let PHONE_VERIFICATION_FLAG = false;
let applicationVerifier = null;
// FIREBASE AUTHENTICATION FOR THE CURRENT USER STARTS*****************************************************************************

async function loadProfileJS() {
    let uid = USER_IN_SESSION.uid;
    if (getCookie("SU_SY") == "") {
        await fetch("/createToken", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid
            }),
        }).then(res => res.text()).then(function (res) {
            firebase.auth().signInWithCustomToken(res.toString()).then(function (user) {
                setCookie("SU_SY", res.toString(), 1);
                profileListener();
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {
            profileListener();
        }).catch(reason => {
            console.log(reason);
            delete_cookie("SU_SY");
            loadProfileJS();
        });
    }
}

function profileListener()
{
    DB.collection("Users").doc(firebase.auth().currentUser.uid)
        .onSnapshot(function(doc) {
            let newUser= doc.data();
             if(newUser == undefined)
             {
                 API = "CREATE_API";
                 localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
                 USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
                 loadProfileForNewUser(USER_IN_SESSION);
             }
             else
             {
                 API = "UPDATE_API";
                 userInDB = newUser;
                 loadProfileForExistingUser(newUser)
             }

        })

    DB.collection("UserAuthRequest").doc(firebase.auth().currentUser.uid)
        .onSnapshot(function (doc)
        {
            let data = doc.data();
            if(data == undefined)
            {
                //normal user
                document.getElementById("req_pending").classList.add("d-none")
                document.getElementById("requestTournament").classList.add("d-none")
                document.getElementById("normal_user").classList.remove("d-none")
            }
            else if(data.status == true)
            {
                //super user
                document.getElementById("normal_user").classList.add("d-none")
                document.getElementById("req_pending").classList.add("d-none")
                document.getElementById("requestTournament").classList.remove("d-none")
            }
            else
            {
                //req pending user
                document.getElementById("requestTournament").classList.add("d-none")
                document.getElementById("normal_user").classList.add("d-none")
                document.getElementById("req_pending").classList.remove("d-none")
            }
        })
}

//FIREBASE AUTHENTICATION FOR THE CURRENT USER ENDS *****************************************************************************
//todo set all details

function loadProfileForNewUser(user) {
    console.log("firebase auth sesssion",user)
    renderForNewUser();
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
    setMobileNumber(user.phoneNumber)
    setEmail(user.email)
}

function renderForNewUser() {
    showEdit();
    document.getElementById("cancel_btn").classList.add("d-none");
    document.getElementById("withdraw").classList.add("d-none");
    document.getElementById("tot_navbar").classList.add("d-none");
    document.getElementById("edittt").classList.add("d-none");
}

function loadProfileForExistingUser(user) {
    console.log("db Details",user)
    setProfileName(user.userName)
    setProfileImage(user.profileImageURL)
    setMobileNumber(user.mobileNo)
    setEmail(user.userEmailID)
    setUpiId(user.vpa.vpa)
    setBankDetails(user.bankDetail)
    setWalletAmt(user.walletAmount)
}

getElementValue = (id) => {
    return document.getElementById(id).value;
}

setProfileName = (name) => {
    $("#overlay").fadeOut('slow');
    document.getElementById("profileName").innerHTML = name;
    document.getElementById("editProfileName").setAttribute("value", name);
}

setProfileImage = (image) => {
    if (image != null) {
        document.getElementById("profileImage").setAttribute("src", image)
    } else {
        document.getElementById("imgup").classList.add("d-none");
    }
}

setMobileNumber = (number) => {
    if (number != null) {
        number = number.toString().split("+91").pop();
        console.log(number)
        document.getElementById("mobileNumber").innerHTML = number;
        document.getElementById("editMobileNumber").setAttribute("value", number);
        verifyOrVerified("+91"+number);
    }
}

function verifyOrVerified(num)
{
    let verifyButton =document.getElementById("button-addon2");
    if(num == firebase.auth().currentUser.phoneNumber)
    {
        verifyButton.innerHTML="verified!";
        verifyButton.disabled = true;
        PHONE_VERIFICATION_FLAG =true;
    }
    else
    {
        verifyButton.innerHTML="verify";
        verifyButton.disabled = false;
        PHONE_VERIFICATION_FLAG = false;
    }
}

setEmail = (email) => {
    document.getElementById("profileEmail").innerHTML = email;
    document.getElementById("editEmail").setAttribute("value", email);
}

setWalletAmt = (amt) => {
    console.log("heyo")
    document.getElementById("winnings").innerHTML =  amt;
}



setBankDetails = (bankDetail) => {
    if ((bankDetail.accountNo != null) && (bankDetail.ifsc != null) && (bankDetail.accountName != null)) {
        document.getElementById("editAccountNo").setAttribute("value", bankDetail.accountNo);
        document.getElementById("editIfsc").setAttribute("value", bankDetail.ifsc);
        document.getElementById("editAccountName").setAttribute("value", bankDetail.accountName);
    }
}


setUpiId = (number) => {
    if (number) {
        document.getElementById("editUpiID").setAttribute("value", number);
    }
}

removeEdit = () => {
    if (API != "CREATE_API") {
        document.getElementById("editProfileCard").classList.add("d-none");
        document.getElementById("myTournament").classList.remove("d-none");
        document.getElementById("imgup").classList.add("d-none");
        document.getElementById("imgup").classList.add("d-none");
    }
}

showEdit = () => {
    document.getElementById("editProfileCard").classList.remove("d-none");
    document.getElementById("myTournament").classList.add("d-none");
    document.getElementById("imgup").classList.remove("d-none");

}
// update validation
ValidateProfile = () => {
    var email = document.getElementById("editEmail").value;
    var name = document.getElementById("editProfileName").value;
    var mobile = document.getElementById("editMobileNumber").value;
    var account = document.getElementById("editAccountNo").value;
    var ifsc = document.getElementById("editIfsc").value;
    var acccountName = document.getElementById("editAccountName").value;


    var flag = true;
    if (name == "") {
        document.getElementById('editProfileName').classList.add("is-invalid");
        var flag = false;

    }
    if (email == "") {
        document.getElementById('editEmail').classList.add("is-invalid");
        var flag = false;

    }
    if (mobile == "") {
        document.getElementById('editMobileNumber').classList.add("is-invalid");
        var flag = false;

    }

    if ((account != "" || ifsc != "" || acccountName != "")) {
        if (!(account != "" && ifsc != "" && acccountName != "")) {
            document.getElementById('editAccountNo').classList.add("is-invalid");
            document.getElementById('editIfsc').classList.add("is-invalid");
            document.getElementById('editAccountName').classList.add("is-invalid");
            var flag = false;
            iziToast.error({
                message: 'Please enter account no and ifsc and Account Name'
            })
        }
    }
    // console.log(flag);
    return flag;

}

document.getElementById("editMobileNumber").addEventListener("input",checker)

function checker()
{
    verifyOrVerified("+91"+document.getElementById("editMobileNumber").value);
}

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 &&
        (charCode < 48 || charCode > 57) && (charCode < 37 || charCode > 39))
        return false;
    return true;
}

function checkDetails() {
    let overallFlag = 0;
    let no_of_check = 1;
    let userPhone = firebase.auth().currentUser.phoneNumber;
    //CHECK 1 Starts
    console.log("+91" + getElementValue("editMobileNumber"))
    if (PHONE_VERIFICATION_FLAG == true || userPhone == "+91" + getElementValue("editMobileNumber")) {
        overallFlag++;
    } else {
        if (userPhone != null) {
            iziToast.warning({
                title: 'Caution',
                message: "please enter Valid mobile number",
                position: 'topRight'
            });
        }
    }
    //CHECK 1 ends
    if (overallFlag == no_of_check) {
        // alert("YES")

        return true;
    } else {
        return false;
    }
}

function createUserInCollection() {
    if (ValidateProfile()) {
        if (checkDetails() == true) {
            // alert("YES")
            let user = {};
            user.uid = USER_IN_SESSION.uid;
            user.userName = getElementValue("editProfileName");
            user.userEmailID = getElementValue("editEmail");
            user.walletAmount = parseInt(document.getElementById("winnings").innerHTML);
            user.role = 0;
            user.profileImageURL = document.getElementById("profileImage").getAttribute("src");
            user.mobileNo = parseInt(getElementValue("editMobileNumber"));
            let vpa = {};
            vpa.vpa = getElementValue("editUpiID");
            user.vpa = vpa;
            user.token = "";
            let bankDetail = {};
            bankDetail.accountNo = getElementValue("editAccountNo");
            bankDetail.ifsc = getElementValue("editIfsc");
            bankDetail.accountName = getElementValue("editAccountName");
            user.bankDetail = bankDetail;
            user.tournamentIDs = [];
            if (API == "CREATE_API") {
                sessionLogin(firebase.auth().currentUser).then(function (res) {
                    console.log(res)
                    fetch("/createUser", {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                        },
                        body: JSON.stringify({
                            user
                        }),
                    }).then(function () {

                        window.location.assign("/profile");
                    })
                });

            } else {
                console.log(user)
                fetch("/updateUser", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                    },
                    body: JSON.stringify({
                        user
                    }),
                }).then(function () {
                    window.location.assign("/profile");
                })
            }
        } else {
            iziToast.warning({
                message: "please enter and verify your phone number first",
                position: 'topRight'
            });
        }
    }
}

function phoneChecker() {
    if (document.getElementById("editMobileNumber").value.length == 10) {
        let phone = document.getElementById("editMobileNumber").value;
        phone = "+91" + phone;

        if (phone == firebase.auth().currentUser.phoneNumber) {
            // alert("already verified");
            iziToast.warning({
                title: 'Caution',
                message: 'Number verified already',
                position: 'topRight'
            });
        } else {
            if (firebase.auth().currentUser.phoneNumber == null) {
                verifyPhoneNumber(phone)
            } else {
                console.log(firebase.auth().currentUser.providerData);
                firebase.auth().currentUser.unlink("phone").then(function (res) {
                    verifyPhoneNumber(phone)
                }).then(function ()
                {
                    firebase.firestore().collection("Users").doc(firebase.auth().currentUser.uid).update(
                        {
                            mobileNo : null
                        }
                    ).catch(reason => {})
                });
            }
        }
    } else {
        iziToast.warning({
            title: 'Caution',
            message: 'Please enter valid phone number',
            position: 'topRight'
        });
        document.getElementById('editMobileNumber').classList.add("is-invalid");

    }
}

function verifyPhoneNumber(phone) {
    if(applicationVerifier !=null)
    {
        applicationVerifier.clear();
        document.getElementById("recaptcha_parent").removeChild(document.getElementById("recaptcha"));
        let recaptcha = document.createElement("div");
        recaptcha.id = "recaptcha"
        document.getElementById("recaptcha_parent").appendChild(recaptcha);
    }
    applicationVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
        'size': 'invisible'
    });

    firebase.auth().currentUser.linkWithPhoneNumber(phone, applicationVerifier).then(function (confirmationResult) {
        $("#modalRegisterForm").modal('show');
        iziToast.success({
            message: "OTP sent Successfully",
            position: 'topRight'
        });
        getOTP().then(function (otp) {
            return confirmationResult.confirm(otp.toString()).then(() => {
                PHONE_VERIFICATION_FLAG = true;
                verifyOrVerified(phone)
                $("#modalRegisterForm").modal('toggle');
                iziToast.success({
                    message: "number verified successfully",
                    position: 'topRight'
                });
            }).then(function ()
            {
                firebase.firestore().collection("Users").doc(firebase.auth().currentUser.uid).update(
                    {
                        mobileNo : phone.toString().split("+91").pop()
                    }
                ).catch(reason => {})
            }).catch(function (error){
                $("#modalRegisterForm").modal('toggle');
                iziToast.error({
                    title: 'Caution',
                    message: 'incorrect otp',
                    position: 'topRight'
                });
            });
        })
        OTP = null;
        document.getElementById("otp").value=null;
    }).catch(function (error) {
        $("#modalRegisterForm").modal('toggle');
        iziToast.error({
            title: 'Caution',
            message: error.toString(),
            position: 'topRight'
        });
    })
}

let OTP = null;

function getOTP() {
    return new Promise((resolve, reject) => {
        let otpTimer = setInterval(() => {
            if (OTP != null) {
                window.clearInterval(otpTimer);
                resolve(OTP);
            }
            console.log(OTP)
        }, 100)
    });
}

document.getElementById("otpVerify").addEventListener('click', () => {
    if (document.getElementById("otp").value.length == 6) {
        OTP = document.getElementById("otp").value;
    }
});
var flagr = 1;

/*      SHOW UPLOADED IMAGE        */
function readURL(input) {
    if (input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#profileImage')
                .attr('src', e.target.result);
        };

        reader.readAsDataURL(input.files[0]);
        if (flagr) {
            storeImage(input.files[0])
        }
        flagr = 0;
    }
}

$(function () {
    $('#upload').on('change', function () {
        readURL(input);
    });
});

/*         SHOW UPLOADED IMAGE NAME         */
var input = document.getElementById('upload');
var infoArea = document.getElementById('upload-label');

input.addEventListener('change', showFileName);

function showFileName(event) {
    var input = event.srcElement;
    var fileName = input.files[0].name;
    infoArea.textContent = 'File name: ' + fileName;
}


function storeImage(img) {
    // let img = document.getElementById("image-file").files[0];
    document.getElementById("uploadProgress").classList.remove('d-none');

    console.log(img)
    if (typeof (img) != "undefined") {
        let url;
        let uploadTask = firebase.app().storage("gs://hostitgaming-36a6b.appspot.com")
            .ref("user/" + userInDB.uid).child("profile.jpg").put(img);

        uploadTask.on('state_changed', function (snapshot) {
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            $("#dynamic")
                .css("width", progress + "%")
                .attr("aria-valuenow", progress)
                .text(Math.floor(progress) + "% Complete");

            // console.log('Upload is ' + progress + '% done');
        }, function (error) {
            iziToast.error({
                message: "we are little depressed for the time being, try again later!",
                position: 'topRight'
            });
        }, function () {
            uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
                console.log('File available at', downloadURL);
                let u = {}
                u.uid = firebase.auth().currentUser.uid;
                u.url = downloadURL;
                url = downloadURL;
                return fetch("/updateProfileImage", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        u
                    }),
                });
            }).catch(reason => {
                // alert(reason)
                iziToast.error({
                    message: "Something went wrong",
                    position: 'topRight'
                });

            }).then(res => res.text()).then(function (res) {
                if (res == "success") {
                    // console.log("image updated in db")
                    document.getElementById("uploadProgress").classList.add('d-none');
                    $("#dynamic")
                        .css("width", 0 + "%")
                        .attr("aria-valuenow", 0)
                        .text(0 + "% Complete");
                    iziToast.success({
                        message: "profile pic updated successfully",
                        position: 'topLeft'
                    });
                    flagr = 1;

                    setProfileImage(url)
                }
            });
        });
    }
}

function withdraw() {

    fetch("/availableRequest?uid=" + firebase.auth().currentUser.uid).then(res => res.json())
        .then(function (res) {
            console.log(res)
            if (res.length == 0) {
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
                if (payLoad.amount == 0) {
                    iziToast.error({
                        message: "first earn, then ask",
                        position: 'topRight'
                    });
                } else {
                    if (typeOfTransaction == "account") {
                        if ((accName == "" || accNo == "" || ifsc == "")) {
                            iziToast.error({
                                message: "furnish your account details",
                                position: 'topRight'
                            });
                            return;
                        } else {
                            payLoad.type = 1;
                            payLoad.accountNo = accNo;
                            payLoad.accountName = accName;
                            payLoad.ifsc = ifsc;
                        }
                    } else {
                        if (upid == "") {
                            iziToast.error({
                                message: "furnish your upid first",
                                position: 'topRight'
                            });
                            return;
                        } else {
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
                        body: JSON.stringify({
                            payLoad
                        }),
                    }).then(res => res.text()).then(function (res) {
                        if (res == "success") {
                            iziToast.success({
                                message: "request made! keep checking your account, money maybe on the way",
                                position: 'topRight'
                            });
                        }
                    }).catch(reason => {
                        alert(reason)
                    })
                }
            } else {
                iziToast.error({
                    message: "patience is virtue! Request is already made.. wait for processing",
                    position: 'topRight'
                });
            }
        });


}

validateAdmin = () => {
    var flag = true;
    if (document.getElementById("inputEmail3").value == "") {
        document.getElementById('inputEmail3').classList.add("is-invalid");
        flag = false;
    }
    if (document.getElementById("editSocialURL").value == "") {
        document.getElementById('editSocialURL').classList.add("is-invalid");
        flag = false;
    }
    if (!document.getElementById("question1").checked) {
        document.getElementById('question1').classList.add("is-invalid");
        flag = false;
    }
    if (!document.getElementById("question2").checked) {
        document.getElementById('question2').classList.add("is-invalid");
        flag = false;
    }
    return flag;
}

function changeRole() {

    if (validateAdmin()) {
        let address = document.getElementById("inputEmail3").value;
        let socialAddress = document.getElementById("editSocialURL").value;
        let q1 = document.getElementById("question1").checked;
        let q2 = document.getElementById("question2").checked;


        let details = {}
        details.address = address;
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
            body: JSON.stringify({
                details
            }),
        }).then(res => res.text()).then(function () {
            iziToast.success({
                message: "Applied successfully, await for Approval",
                position: 'topRight'
            });
        });
    }
}