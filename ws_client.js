
function updateColour(col,value) {
 	console.log("updateColour " + col + " called with " + value)
 	setColour(col,value)
	// ajaxCall("GET","http://localhost:9081/colour_crew/update_colour/" + col + "/" + value, null, update_colour_success);
 }
 function update_colour_success(response) {
 	console.log("update_colour_success returned")
 	gpio[0]=0
 }

function getColoursFromServer() {
 	console.log("loadLevel called")
	// ajaxCall("GET","http://localhost:9081/colour_crew/get_colours", null, get_colours);
 }

  function get_colours(response) {
  	//global gpio;
    var res = JSON.parse(response);
    console.log("get_colours returned " + response)
    if(gpio[0]==0) {
		gpio[1] = res.data["blue"]
		gpio[2] = res.data["red"]
	 	gpio[3] = res.data["yellow"]
	 }
 }

	//	var getColoursFromServerAtSetInterval = setInterval(function() {
   // 		getColoursFromServer();
	//	}, 2000);
	//	getColoursFromServerAtSetInterval();
	
    function openConnection() {
        this.ws = new WebSocket("ws://localhost:8988") 
        this.connected = false
        this.ws.onmessage = this.onMessage.bind(this)
        this.ws.onerror = this.displayError.bind(this)
        this.ws.onopen = this.connectionOpen.bind(this)
    }

    function connectionOpen() {
        this.connected = true
        //this.myText.text = 'connected\n'
	//	this.ws.send(JSON.stringify({action: "setNick", nick: this.playerName}))

    }

    function onMessage(message) {

        this.queuedAction = ""
        
        var msg = JSON.parse(message.data);
         console.log(msg);
        if (undefined == msg.status) {
        	//do nutjimng
        }
        else if (undefined != msg.status && msg.status == "updateColours") {
			gpio[1] = msg["blue"]
			gpio[2] = msg["red"]
		 	gpio[3] = msg["yellow"]

        }
        else if (undefined != msg.status && msg.status == "requestColour") {
			gpio[8] = msg["title"]
			gpio[9] = msg["name"]
		 	gpio[10] = msg["alliance"]
		 	gpio[11] = msg["colour"]
		 	gpio[0]=20
        }
        else if (undefined != msg.status && msg.status == "registered") {
            this.ws.send(JSON.stringify({action: "joinGame", gameType: this.gameType, level: this.level}))
        }
        else if (undefined != msg.status && msg.status == "gameOver") {
            if (msg.loser == 0) {
                this.announceWin(1)
            }
            else {
                this.announceWin(0)
            }
        }
        else {

        }

    }

    function displayError(err) {
        console.log('Web Socket error - probably the server died. Sorry! Error: ' + err)
        //this.game.add.text(100, 400, "Web Socket error - the server is unreachable or dead. Sorry!\nYour best bet is to reload - or wait a bit and then try again:/", { font: "20px Arial", fill: "#ff0044"})
    }
    function setNick(col,title,name,alliance) {
       if (this.connected && !this.gameOver) {
            this.ws.send(JSON.stringify({action: "setNick", colour: col, title: title, name:name, alliance:alliance}))
        }
    }
    function requestJournal() {
       if (this.connected && !this.gameOver) {
            this.ws.send(JSON.stringify({action: "requestJournal"}))
        }
    }
    function requestColour(col,title,name,alliance) {
       if (this.connected && !this.gameOver) {
            this.ws.send(JSON.stringify({action: "requestColour", colour: col, title: title, name:name, alliance:alliance}))
        }
    }
    function setColour(col,val) {
       if (this.connected && !this.gameOver) {
       	 	console.log("setColour " + col + " called with " + val)

            this.ws.send(JSON.stringify({action: "setColour", colour: col, value: val}))
        }
    }