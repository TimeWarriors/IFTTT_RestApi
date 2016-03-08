var socket = io();

socket.on('statusUpdated', (userData) => {
    for (var i = 0; i < userData.length; i++) {
        var teachRes = document.getElementById(userData[i].name);
        if (userData[i].presence === true) {
            // teachRes.style.backgroundColor = "#ADFF2F";         
            if (userData[i].city == "Kalmar") {
                teachRes.className = "teacherName";
            } else {
                teachRes.className = "teacherNameVaxjo";
            }
            teachRes.querySelector('.roomText').innerHTML = userData[i].inRoom;
            //teachRes.className = "teachResPresent";
        } else {
            // teachRes.style.backgroundColor = "#B22222";
            teachRes.className = "teacherNameNotPrescent";
            teachRes.querySelector('.roomText').innerHTML = userData[i].inRoom;
        }
    }
})