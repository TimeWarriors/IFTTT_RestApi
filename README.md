# IFTTT_RestApi

## Set up

Host the application on a chosen device that supports node js v5.7.1.

## Installation

1. Run the command: npm install
2. Create a file in the root named "usersettings.json". (It can be something else but then you have to change the fileName varible in server.js")
3. In this file you want to write in the users you wish to have registered for the presence system. It should be built up like the following JSON example: 
```
[
  {
      "userId": "1234",
      "public_data": {
          "name": "Johan_Leitet",
          "presence": false,
          "city": "",
          "inRoom": "",
          "img": "URL_to_profile_picture",
          "publicid": "<uniqueid>"
      }
  }, ...
]
```

It's important to note that anything you write in the public_data object will be visible on the client.

city and inRoom can be initiated with no values.

Also, the userId should be tried to be kept secret since it works like a key for controlling certain data in the public_data object. This is also only handled on the server side. If it happens to be leaked it can just be re-written in this json file, but you will also have to change the id in the API calls that will be described in the next step.

## How to call this API via IFTTT

### Setting up IFTTT
NOTE: If you have an office or lectures in both Kalmar and Växjö you need to do this process twice, once for Kalmar and once for Växjö.

1. Create your account on ifttt.com. The email you use could be private or your lnu mail.
2. When you have logged in, up in the right corner you can click on your name to get down a menu, in that menu you press Create.
3. Press the huge blue coloured "this" text.
4. (Choose Trigger Channel) - In the new menu that pops up, search for "Location", there should be 2 options that you now can choose from. Pick whatever fits your mobile device.
5. (Choose a Trigger) - In this menu you have 3 options, pick the one furthest to the right called "You enter or exit an area".
6. (Complete Trigger Fields) - Put the trigger over the university building in Kalmar or Växjö (which ever you are creating a trigger for). 
7. Press the huge blue coloured "that" text.
8. (Choose Action Channel) - In this menu you want to search for "Maker", 3 options should pop up. You want to press the one furthest to the left called "Maker".
9. (Choose an Action) - Press the "Make a web request" button.
10. (Complete Action Fields) - Almost done, now we just need to fill out the request. You'll want to fill in the fields with the following values:

<b>URL:</b> *TBD*/update/yourUserID/cityForTrigger/{{EnteredOrExited}}

yourUserID - this you replace with an ID written in the usersettings.json file, this can be provided by the admin of the system.

cityForTrigger - this you replace with the city you are creating the trigger for, this being Kalmar or Vaxjo (Å,ä and ö are not supported in urls.)

{{EnteredOrExited}} - this is an ingridient you can include with the help of IFTTT on the right side of the url input field where you can press an icon that looks like a chemistry bottle. When the menu pops up you just choose the EnterOrExited ingredient and press Add Ingredient.

<b>Method:</b> POST

<b>Content Type:</b> *This field is not required*

<b>Body:</b> *This field is not required*

Press Create Action

Now you can give the recipe a title, suggestions are : "LNU-IFTTT-Kalmar/Växjö" or "LNU-PresenceApp-Kalmar/Växjö". You can also just leave it be.

Press Create Recipe. All you need to do now is to download the IFTTT app on your mobile device and set the recipe running.

## Functionality

When everything is setup and the registerd users have their IFTTT recipes up and running the server will be abel to take thier calls.

What happens when a call is made fromt he IFTTT recipe?

Firstly, if there isn't a current user queue, a queue is created. This queue will last for 30 seconds (time can be adjusted in the queueHandler script) and any other user who also makes a call within the same 30 seconds, including the one who first initiated the queue if he/ she is to make another call, those commands are also added to the queue. 

When the queue time run out all of the requests in the queue will be executed and the statuses will be changed. 

For all users in the usersettings file a search on their timeedit schedule is made daily and events are created to display any class room that they could be in at that moment. The display of the class room is of course removed when the scheduled event is over. This functionallity is automated when starting up the server and occurs each morning at 5.
