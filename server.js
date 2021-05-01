const http = require("http"),
    fs = require("fs");
const mysql = require("mysql");
const port = 3456;
const file = "/src/index.html";
const bcrypt = require("bcrypt");
// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html, on port 3456:

const server = http.createServer(function (req, res) {
    const headers = {
        "Access-Control-Allow-Origin": "ws://ec2-184-73-88-167.compute-1.amazonaws.com:3000",
        "Access-Control-Allow-Methods": "GET,POST",
        "Access-Control-Allow-Credentials": true
    }
    res.writeHead(200,headers);;
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
server.listen(port);
const socketio = require("socket.io")(http, {
    // cors:{
    //     origin: "http://ec2-184-73-88-167.compute-1.amazonaws.com:3000",
    //     credentials: true,
    //     mehods: ["GET","POST"]
    // },
    wsEngine: 'ws'
});

//connecting to mysql database to get/set username and password
const mysqldb = mysql.createConnection({ //referencing https://stackoverflow.com/questions/17618381/how-to-access-mysql-database-with-socket-io
    host: "localhost",
    database: "tictactoedb",
    user: "wustl_inst",
    password: "wustl_pass"
});



// Attach our Socket.IO server to our HTTP server to listen
const io = socketio.listen(server);
io.sockets.on("connection", function (socket) {
    // This callback runs when a new Socket.IO connection is established.
    socket.on('login_req', function (data) {
        mysqldb.query("select password from users where username=?",[data["username"]],function(err,res){
            if(err){
                console.log(err);
                console.log("login requested from: " + data["username"] + " with password " + data["passwordAttempt"]);
                io.sockets.emit("login_req", { loginAttempt: false});
            }
            else if(res.length==0){
                io.sockets.emit("login_req", { loginAttempt: false});
            }
            else{
                let response = JSON.parse(JSON.stringify(res));
                console.log(response);
                console.log(response[0].password);

                if(bcrypt.compareSync(data["passwordAttempt"],response[0].password)){
                    console.log("login requested from: " + data["username"] + " with password " + data["passwordAttempt"]);
                    io.sockets.emit("login_req", { loginAttempt: true});
                }
                else{
                    console.log("login requested from: " + data["username"] + " with password " + data["passwordAttempt"]);
                    io.sockets.emit("login_req", { loginAttempt: false});
                }
            }

        });
        
        
    });

    socket.on('reg_req', function (data){
        const salt = bcrypt.genSaltSync(10); //from https://www.npmjs.com/package/bcrypt
        const hashedpassword = bcrypt.hashSync(data["passwordAttempt"],salt);


        mysqldb.query("insert into users (username, password) values (?,?)",[data["username"],hashedpassword],function(err,res){
            if(err){
                
                console.log("failed to reg user: " + data["username"]);
                console.log(err);
                if(err["code"]=="ER_DUP_ENTRY"){
                    io.sockets.emit("reg_req", { regAttempt: false, duplicate: true });
                }
                else{
                    io.sockets.emit("reg_req", { regAttempt: false, duplicate: false});
                }
                
            }
            else{
                console.log("successfully added user: " + data["username"] );
                io.sockets.emit("reg_req", { regAttempt: true, duplicate: false });
            }
        });
    })

});