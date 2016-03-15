var socket = io();

socket.on('statusUpdated', (userData) => {
    for (var i = 0; i < userData.length; i++) {
        var teacherDiv = document.getElementById(userData[i].publicid);
        console.log(teacherDiv);
        console.log(userData[i].publicid);
        if (userData[i].presence === true) {  
            if (userData[i].city.toLowerCase() == "kalmar") {
                teacherDiv.className = "teacher-status-present";
            } else {
                teacherDiv.className = "teacher-status-vaxjo";
            }          
        } else {
            teacherDiv.className = "teacher-status-not-present";
        }
        teacherDiv.querySelector('.teacher-location-container').innerHTML = userData[i].inRoom;
    }
})