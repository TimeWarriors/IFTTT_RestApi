"use strict";


window.onload = function(){
	console.log("Hello world");
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "http://localhost:3000/");
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.addEventListener("load", function(){
		console.log(xhr.responseText);
		//Can test stuff here with response
	})
	var obj = { id: 1234, name: "Kalle"};
	
	
	xhr.send(JSON.stringify(obj));
	//Do stuff
}