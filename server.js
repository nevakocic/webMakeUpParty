// HTTP Portion
var http = require('http');
var fs = require('fs');
var httpServer = http.createServer(requestHandler);
httpServer.listen(3000);
//httpServer.maxConnections = 5; //works but it's not fancy

console.log("listening on 3000")

function requestHandler(req, res){
	//read the html file and callback function
	fs.readFile(__dirname + '/p2p.html', function (err, data) {
		// if there is an error
		if (err) {
			res.writeHead(500);
			return res.end('Well, shit!');
		}
		// otherwise send the data
		res.writeHead(200);
		res.end(data);
	});
}

// websockets portion 
// websockets work with the http httpServer
var io = require('socket.io').listen(httpServer);

// since io.sockets.clients() no longer works                //     ??
var connectedSockets = [];
//var maxConnectections = 5;
var videoUsers = new Array ();

// register a callback function to run wehen we have an individual connection.
// this is run for each individual user that connectedSockets.3....0.0..0
io.sockets.on('connection', function (socket){

	console.log("We have a new client: " + socket.id);

	// add to the connectedSockets array
	connectedSockets.push(socket);

	socket.on('peer_id', function (data){
		
		console.log("Received: 'peer_id' " + data);
		// we can save this in the socket object
		socket.peer_id = data;
		console.log("Saved: " + socket.peer_id);

		var user = {
			socketId: socket.id,
			peerId: data
		};

		videoUsers.push(user);
		console.log(videoUsers);
		// we can loop through these
		for (var i = 0; i < connectedSockets.length; i++) {
			console.log("loop: " + i + " " + connectedSockets[i].peer_id);
		}

		// tell everyone my peer_id
		if ( videoUsers.length < 5){
			console.log('emiting' + data);
			socket.broadcast.emit('peer_id_server', data);
		}
	});

	// limiting number of clients

	//appending paragraph to page
	function addTextNode(text){
		var newtext = document.createTextNode(text);
		p01 = document.getElementById("p1");
		p01.appendChild(newtext);
	}




	socket.on('disconnect', function(){
		console.log("Client has disconnected");
		var indexToRemove = connectedSockets.indexOf(socket);
		connectedSockets.splice(indexToRemove, 1);
		
		var searchTerm = socket.id;
    		var index = -1;
			for(var i = 0, len = videoUsers.length; i < len; i++) {
 			   if (videoUsers[i].socketId === searchTerm) {
    			    index = i;
    			    io.sockets.emit('removeUser', videoUsers[i].peerId)
    			    // now, let's remove them from the videoUsers array
    			    videoUsers.splice(i,1);
					console.log("disconnected/removed: " + socket.id);
    			    break;
  			    }
			}
	});
});