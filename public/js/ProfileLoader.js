function loadProfileDetails()
{
    let user = JSON.parse(sessionStorage.getItem("userInfo"));
    console.log(user)
    setProfileName(user.displayName)
    setProfileImage(user.photoURL)
}


function setProfileName(name)
{
    document.getElementById("profileName").innerHTML = name;
}

function setProfileImage(image)
{
    document.getElementById("profileImage").setAttribute("src",image)
}