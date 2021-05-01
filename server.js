const http = require("http"),
    fs = require("fs");

const port = 3456;
const file = "/src/index.html";
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:

const server = http.createServer(function (req, res) {
    const headers = {
        "Access-Control-Allow-Origin": "ws://ec2-184-73-88-167.compute-1.amazonaws.com:3000",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Credentials": true
    }
    res.writeHead(200,headers);
    console.log("hello");
    res.end();


    // This callback runs when a new connection is made to our HTTP server.
    //  fs.readFile(file, function (err, data) {
    // //     // This callback runs when the client.html file has been read from the filesystem.
    //     const headers = {
    //         "Access-Control-Allow-Origin": "http://ec2-184-73-88-167.compute-1.amazonaws.com:3000",
    //         "Access-Control-Allow-Methods": "GET,POST"
    //     }
        
    //     if (err) return res.writeHead(500,headers);
    //     res.writeHead(200,headers);
    //     console.log("hello");
    //     res.end(data);
    //  });
   

});
console.log("hello2");
server.listen(port);
const socketio = require("socket.io")(http, {
    // cors:{
    //     origin: "http://ec2-184-73-88-167.compute-1.amazonaws.com:3000",
    //     credentials: true,
    //     mehods: ["GET","POST"]
    // },
    wsEngine: 'ws'
});


// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);
io.sockets.on("connection", function (socket) {
    // This callback runs when a new Socket.IO connection is established.
    socket.on('login_req', function (data) {
        let isSuccess = true;

        // This callback runs when the server receives a new message from the client.
        console.log("login requested from: " + data["username"] + " with password " + data["passwordAttempt"]); // log it to the Node.JS output
        io.sockets.emit("login_req", { loginAttempt: isSuccess }); // broadcast the message to other users
    });
});