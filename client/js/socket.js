var socket = io();

    socket.on('statusUpdated', function(userData){
	console.log(userData);
    console.log("hejsan2");
    var teachRes = document.getElementById(userData.name);
    
    if(userData.presence == true){
                teachRes.className = "teachResPresent";
            }
            else{
                teachRes.className = "teachResNotPresent";
            }
})
		  
