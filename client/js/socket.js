var socket = io();

socket.on('statusUpdated', (userData) => {
    for (var i = 0; i < userData.length; i++) {
        var teachRes = document.getElementById(userData[i].name);
        if (userData[i].presence === true) {  
            if (userData[i].city.toLowerCase() == "kalmar") {
                teachRes.className = "teacher-status-present";
            } else {
                teachRes.className = "teacher-status-vaxjo";
            }
            teachRes.querySelector('.roomText').innerHTML = userData[i].inRoom;
        } else {
            teachRes.className = "teacher-status-not-present";
            teachRes.querySelector('.roomText').innerHTML = userData[i].inRoom;
        }
    }
})