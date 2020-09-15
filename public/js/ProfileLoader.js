function loadProfileDetails() {
    let user = JSON.parse(sessionStorage.getItem("userInfo"));
    console.log(user)
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
    setMobileNumber(user.phoneNumber)
    setEmail(user.email)
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

function createUserInCollection()
{
    var user = {};
    user.userName = "";
    user.userEmailID="";
    user.walletAmount=0;
    user.token = "";
    user.role = 0;
    user.profileImageURL = "";
    user.mobileNo = "";
    user.vpa = "";
    var bankDetail = {};
    bankDetail.accountNo = "";
    bankDetail.ifsc = "";
    bankDetail.accountName = "";
    user.bankDetail = bankDetail;
    user.tournamentIDs = [];
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
