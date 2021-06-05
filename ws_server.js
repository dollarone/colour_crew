const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8988 })
console.log('Server started on 8988')

let blue=0
let red=0
let yellow=0

let players = []
let playerNum=0

let titles=["john","major","lord","captain","commander","sergant","private","doctor","mr","count","reverend","duke","corporal","master","overlord","cult leader","emperor"]
let names=["frank","titus","arnold","ozzy","chester","zonk","power","fleck","steve","dave","zeus","loki","zelda","gore","duke","martijn","marwane"]
let alliances=["earth","mars","ziggurant 9","the star alliance","the indigo brotherhood","the painkillers","the judas priests","the church of cheese","sheffield wednesday","the venus homeboys","bossa nova","the south star realms","the defenders","the mars volta","jupiter","pluto","the pacifist death cult","the emperor's pawns","the dukes"]

var fs = require('fs')
var logStream = fs.createWriteStream('journal.csv', {flags: 'a'});
// use {flags: 'a'} to append and {flags: 'w'} to erase and write a new file

wss.on('connection', function(ws, req) {
console.log(ws)
    console.log('connected: ' + ws)
    let user=playerNum
    playerNum++
    players[user] = {}
    players[user]["ws"]=ws

    let payload = new Object()
    payload["status"] = "registered"
    console.log("registration successful")
    ws.send(JSON.stringify(payload))

    ws.on('message', function(message) {       
        let incomingMsg = JSON.parse(message)

        if (user in players) {
            
            console.log("action from #" + user + " (current nick: " + players[user].nick + ") " + ": " + incomingMsg.action)
           // for ( a in incomingMsg) { console.log(a + ": " + incomingMsg[a])}
            if (incomingMsg.action == "requestJournal") {
            	var start = players[user].start
				var end = new Date().getTime()
				var time = (end - start) / 1000
            	logStream.write(players[user].journalname + "," + players[user].colour + "," + time + "\n");
//logStream.end('this is the end line')

            }
            if (incomingMsg.action == "setNick") {
                if (incomingMsg.colour == null || incomingMsg.title == undefined || incomingMsg.name == "" || incomingMsg.alliance == undefined) {
                    players[user].nick = "Dr. Rust"
                }
                else {
                	co="yellow"
                	if (incomingMsg.colour==1) { 
                		co="blue"
                	}

                	if (incomingMsg.colour==2) { 
                		co="red"
                	}
                    players[user].nick = titles[incomingMsg.title-1] + " " + names[incomingMsg.name-1] + " of " + alliances[incomingMsg.alliance-1] + " (" + co + ")"
                	players[user].journalname = titles[incomingMsg.title-1] + " " + names[incomingMsg.name-1] + " of " + alliances[incomingMsg.alliance-1]
                	players[user].colour=co
                }

                console.log(user + " setNick to : " + players[user].nick)

                players[user].start = new Date().getTime()

                let payload = new Object();
				payload["status"]="updateColours"
				payload["blue"]=blue
				payload["red"]=red
				payload["yellow"]=yellow
				ws.send(JSON.stringify(payload));
            }

            else if (incomingMsg.action == "setColour") {
            	if (incomingMsg.value==0 || incomingMsg.value==1) {
	            	if (incomingMsg.colour==1) {
	            		blue=incomingMsg.value
	            		updateAllPlayers()
	            	}
	            	else if (incomingMsg.colour==2) {
	            		red=incomingMsg.value
	            		updateAllPlayers()
	            	}
	            	else if (incomingMsg.colour==3) {
	            		yellow=incomingMsg.value
	            		updateAllPlayers()
	            	}
	            	co="yellow"
                	if (incomingMsg.colour==1) { 
                		co="blue"
                	}

                	if (incomingMsg.colour==2) { 
                		co="red"
                	}
	                console.log(players[user].nick + " setColour " + co + " to : " + incomingMsg.value)
            	}
            }
            else if (incomingMsg.action == "requestColour") {
            	if (incomingMsg.colour==1 || incomingMsg.colour==2 || incomingMsg.colour==3) {
            		requestAllPlayers(incomingMsg.title, incomingMsg.name, incomingMsg.alliance, incomingMsg.colour)
	            	co="yellow"
                	if (incomingMsg.colour==1) { 
                		co="blue"
                	}

                	if (incomingMsg.colour==2) { 
                		co="red"
                	}
	                console.log(players[user].nick + " requests " + co)
            	}
            }            
            else {
                console.log("action from unknown user (" + user + "): " + incomingMsg.action)
            }

        }
        
    })
})


function requestAllPlayers(title,name,alliance,col) {
	let payload = new Object()
	payload["status"]="requestColour"
	payload["title"]=title
	payload["name"]=name
	payload["alliance"]=alliance
	payload["colour"]=col
	for(let player=0; player<players.length; player++) {
		players[player]["ws"].send(JSON.stringify(payload))
	}
}

function updateAllPlayers() {
	let payload = new Object()
	payload["status"]="updateColours"
	payload["blue"]=blue
	payload["red"]=red
	payload["yellow"]=yellow
	for(let player=0; player<players.length; player++) {
		players[player]["ws"].send(JSON.stringify(payload))
	}
}
function announceWin(gameNumber, pl) {

    games[gameNumber]["onGoing"] = false
    let returnStatus = "gameOver"
    let sentUsers = {}
    let users = games[gameNumber]["players"]
    for (let user=0; user<users.length; user++) {
        let userString = games[gameNumber]["players"][user]["user"]
        let payload = new Object()
        payload["status"] = returnStatus
        payload["loser"] = pl
        console.log("in attack loop " + user + " /" + userString )

        if (sentUsers[userString] != undefined) {
        }
        else {
            games[gameNumber]["players"][user]["ws"].send(JSON.stringify(payload))
            sentUsers[userString] = true
            console.log( "sending " + payload["status"] + " to " + userString)
            console.log(JSON.stringify(sentUsers))
            delete players[userString]
        }
    }    
}