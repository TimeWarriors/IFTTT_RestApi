"use strict"; 

//not used atm. Tested when trying to read json file
var path = "../../../settings/settings.json";

function updatePresence(){
	
	var xhr = new XMLHttpRequest();
	//xhr.overrideMimeType("application/json");
	
	//xhr.open("GET", "https://tw2-mathiassundin-3.c9users.io/userData"); On server
    xhr.open("GET", "http://localhost:3000/userData"); //On localhost
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.addEventListener("load", function(res){

        let data = JSON.parse(xhr.responseText);
        console.log(data);
        
        let dataDiv = document.getElementById("dataDiv");
        
        for (var i = 0; i < data.length; i++){
            let img = document.createElement("img");
            img.className = "teachImgPresent";
            let textName = document.createElement("p");
            let name = data[i].name;
            textName.textContent = name.split("_").join(" ");
            let teachDiv = document.createElement("div");
            teachDiv.id = name;
            teachDiv.className = "teachResPresent";
            let textDiv = document.createElement("div");
            textDiv.className = "teachTextPresent";
            let roomName = document.createElement("div");
            roomName.className = "roomName";
            let textRoom = document.createElement("p");
            textRoom.className = "textRoom";
            textRoom = data[i].inRoom;
            
            img.src = data[i].img;
            dataDiv.appendChild(teachDiv);
            teachDiv.appendChild(img);
            roomName.appendChild(textRoom);
            teachDiv.appendChild(roomName);
            teachDiv.appendChild(textDiv);
            textDiv.appendChild(textName)
            
            if(data[i].presence == true){
                teachDiv.className = "teachResPresent";
            }
            else{
                teachDiv.className = "teachResNotPresent";
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