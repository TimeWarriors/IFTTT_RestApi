var socket = io();

socket.on('statusUpdated', (userData) => {
    for (var i = 0; i < userData.length; i++) {
        var teachRes = document.getElementById(userData[i].name);
        if (userData[i].presence == true) {
            // teachRes.style.backgroundColor = "#ADFF2F";         
            if (userData[i].city == "Kalmar") {
                teachRes.className = "teachResPresent";
            } else {
                teachRes.className = "teachResVaxjo";
            }
            teachRes.childNodes[2].firstChild.innerHTML = userData[i].inRoom;
            //teachRes.className = "teachResPresent";
        } else {
            // teachRes.style.backgroundColor = "#B22222";
            teachRes.className = "teachResNotPresent";
            teachRes.childNodes[2].firstChild.innerHTML = userData[i].inRoom;
        }
    }
})