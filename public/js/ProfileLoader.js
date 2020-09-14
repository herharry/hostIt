function loadProfileDetails()
{
    let user = JSON.parse(sessionStorage.getItem("userInfo"));
    console.log(user)
    setProfileName(user.displayName)
}


function setProfileName(name)
{
    document.getElementById("profileName").innerHTML = name;
}