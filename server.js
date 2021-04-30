
var http = require('http'),
url = require('url'),
path = require('path'),
mime = require('mime'),
path = require('path'),
fs = require('fs');


var app = http.createServer(function(req, resp){
var filename = path.join(__dirname, "staticchat", url.parse(req.url).pathname);
(fs.exists || path.exists)(filename, function(exists){
if (exists) {
    fs.readFile(filename, function(err, data){
        if (err) {
            resp.writeHead(500, {
                "Content-Type": "text/plain"										
            });
            resp.write("Internal server error: could not read file");
            resp.end();
            return;
        }
        var mimetype = mime.getType(filename);
        resp.writeHead(200, {
            "Content-Type": mimetype
        });
        resp.write(data);
        resp.end();
        return;
    });
}else{
    resp.writeHead(404, {
        "Content-Type": "text/plain"
    });
    resp.write("Requested file not found: "+filename);
    resp.end();
    return;
}
});
});
app.listen(3456);

// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(app);
io.sockets.on("connection", function (socket) {
    // This callback runs when a new Socket.IO connection is established.

    socket.on('message_to_server', function (data) {
        // This callback runs when the server receives a new message from the client.

        console.log("message: " + data["message"]); // log it to the Node.JS output
        io.sockets.emit("message_to_client", { message: data["message"] }) // broadcast the message to other users
    });
});