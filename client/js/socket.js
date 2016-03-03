var socket = io();

    socket.on('statusUpdated', function(userData){
	console.log(userData);
    console.log("hejsan2");
    console.log(userData[0].name);
    
    
    for (var i = 0; i < userData.length; i++){
        var teachRes = document.getElementById(userData[i].name);
    if(userData[i].presence == true){
        // teachRes.style.backgroundColor = "#ADFF2F";
        teachRes.className = "teachResPresent";
    }
    else{
        // teachRes.style.backgroundColor = "#B22222";
      
        teachRes.className = "teachResNotPresent";
    }
    }
})
		  
