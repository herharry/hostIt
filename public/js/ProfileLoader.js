function loadProfileDetails() {
   loadUser(JSON.parse(sessionStorage.getItem("userInfo")));
}

function loadProfileForNewUser(user)
{
    console.log(user)
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
    setMobileNumber(user.phoneNumber)
    setEmail(user.email)
}

function loadProfileForExistingUser(user)
{
    console.log(user)
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
                loadProfileForNewUser(user);
            }
            else
            {
                console.log(res.val)

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
    document.getElementById("editProfileCard").classList.add("d-none");
    document.getElementById("myTournament").classList.remove("d-none");
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
    //todo validate the incoming data.. including phone number, if it isi verified, etc
}
function createUserInCollection()
{
    checkDetails();
    let user = {};
    user.uid = JSON.parse(sessionStorage.getItem("userInfo")).uid;
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

    fetch("/createUser", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "CSRF-Token": Cookies.get("XSRF-TOKEN"),
        },
        body: JSON.stringify({user}),
    }).then()
}

function verifyPhoneNumber() {
    let phone = document.getElementById("editMobileNumber").value;
    phone = "+91" + phone;

    var applicationVerifier = new firebase.auth.RecaptchaVerifier('button-addon2', {
        'size': 'invisible'
    });
    var provider = new firebase.auth.PhoneAuthProvider();
    provider.verifyPhoneNumber(phone, applicationVerifier)
        .then(function (verificationId) {
            let coder = prompter('code')
            return firebase.auth.PhoneAuthProvider.credential(verificationId, coder.toString());
        }).then(function(phoneCredential) {
           console.log(phoneCredential);
    });
}

async function prompter(text) {

    let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve(window.prompt(text)), 1000)
    });

    return await promise; // wait until the promise resolves (*)
}
