let API;
let PHONE_VERIFICATION_FLAG = false;
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
                localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
                USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
                profileListener();
                loadUser(USER_IN_SESSION);
                setCookie("SU_SY", res.toString(), 1);
            })
        });
    } else {
        firebase.auth().signInWithCustomToken(getCookie("SU_SY")).then(function (user) {
            localStorage.setItem("userInfo", JSON.stringify(firebase.auth().currentUser))
            USER_IN_SESSION = JSON.parse(localStorage.getItem("userInfo"));
            profileListener();
            loadUser(USER_IN_SESSION);
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
            loadProfileForExistingUser(newUser)
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
    renderForNewUser();
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
    setMobileNumber(user.phoneNumber)
    setEmail(user.email)
    setBankDetails(user.bankDetail)
    setUpiId(user.vpa)
    setWalletAmt(user.walletAmount)
}

function renderForNewUser() {
    showEdit();
    document.getElementById("cancel_btn").classList.add("d-none");
    document.getElementById("withdraw").classList.add("d-none");

}

function loadProfileForExistingUser(user) {
    console.log(user)
    setProfileName(user.userName)
    setProfileImage(user.profileImageURL)
    setMobileNumber(user.mobileNo)
    setEmail(user.userEmailID)
    setUpiId(user.vpa)
    setBankDetails(user.bankDetail)
    setWalletAmt(user.walletAmount)
}

loadUser = (user) => {
    fetch("/user?uid=" + user.uid)
        .then(res => res.json())
        .then(function (res) {
            console.log("hey")
            console.log(res)
            if (res.val === "false") {
                console.log("in")
                API = "CREATE_API"
                loadProfileForNewUser(user);
            } else {
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
    }
}

setEmail = (email) => {
    document.getElementById("profileEmail").innerHTML = email;
    document.getElementById("editEmail").setAttribute("value", email);
}

setWalletAmt = (amt) => {
    document.getElementById("winnings").setAttribute("value", amt);
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

function isNumberKey(evt) {
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 46 && charCode > 31 &&
        (charCode < 48 || charCode > 57))
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
            user.userEmailID = getElementValue("editEmail");;
            user.walletAmount = 0;
            user.role = 0;
            user.profileImageURL = document.getElementById("profileImage").getAttribute("src");
            user.mobileNo = getElementValue("editMobileNumber");
            user.vpa = getElementValue("editUpiID");
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

    var applicationVerifier = new firebase.auth.RecaptchaVerifier('button-addon2', {
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
                $("#modalRegisterForm").modal('toggle');
                iziToast.success({
                    message: "number verified successfully",
                    position: 'topRight'
                });
            });
        })
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
            // console.log("A")
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
                u.uid = userInDB.uid;
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
                    alert("first earn, then ask")
                } else {
                    if (typeOfTransaction == "account") {
                        if ((accName == "" || accNo == "" || ifsc == "")) {
                            console.log("furnish your account details");
                            return;
                        } else {
                            payLoad.type = 1;
                            payLoad.accountNo = accNo;
                            payLoad.accountName = accName;
                            payLoad.ifsc = ifsc;
                        }
                    } else {
                        if (upid == "") {
                            console.log("furnish your upid first")
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
                            console.log("request made! keep checking your account, money maybe on the way")
                        }
                    }).catch(reason => {
                        alert(reason)
                    })
                }
            } else {
                alert("patience is virtue! Request is already made.. wait for processing")
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