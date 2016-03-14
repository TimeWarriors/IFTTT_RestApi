"use strict"; 

//not used atm. Tested when trying to read json file
var path = "../../../settings/settings.json";

function updatePresence(){
	
	var xhr = new XMLHttpRequest();
	//xhr.overrideMimeType("application/json");
	
    xhr.open("GET", "http://localhost:3000/userData"); //On localhost
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.addEventListener("load", function(res){

        let data = JSON.parse(xhr.responseText);
        console.log(data);
        
        let mainContainer = document.getElementById("teachers-main-container");
        
        for (var i = 0; i < data.length; i++){
            let img = document.createElement("img");
            img.className = "teacher-profile-picture";
            let textName = document.createElement("p");
            textName.className = "teacher-name-text";
            let name = data[i].name;
            textName.textContent = name.split("_").join(" ");
            let teacherDiv = document.createElement("div");
            teacherDiv.id = name;
            teacherDiv.className = "teacher-container";
            let textDiv = document.createElement("div");
            textDiv.className = "teacher-name-container";
            
           
            let roomDiv = document.createElement("div");
            roomDiv.className = "teacher-location-container";
            roomDiv.id = "roomTextDiv"
            let textRoom = document.createElement("p");
            textRoom.className = "teacher-location-text";
            textRoom.id = "teacher-location-text";
            let room = data[i].inRoom;
            textRoom.textContent = room;
       
            img.src = data[i].img;
            mainContainer.appendChild(teacherDiv);
            teacherDiv.appendChild(img);
            teacherDiv.appendChild(textDiv);
            teacherDiv.appendChild(roomDiv);
            textDiv.appendChild(textName)
            roomDiv.appendChild(textRoom);
            
            
            if(data[i].presence == true){
                if (data[i].city == "Kalmar") {
                    teacherDiv.className += " teacher-status-present";
                } else {
                    teacherDiv.className += " teacher-status-vaxjo";
                }
            }
            if(data[i].presence == false){
                teacherDiv.className += " teacher-status-not-present";  
            }
             
        };
      
	});
	
	xhr.send();

	//console.log(JSON.parse("../settings/settings.json"))
}



console.log("hej test av github");
 window.onload = updatePresence;

// window.onload = function () {
//     updatePresence();
// }