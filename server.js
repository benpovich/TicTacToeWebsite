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
                console.log("login requested from: " + data["username"]);
                io.sockets.emit("login_req", { loginAttempt: false, username: data["username"]});
            }
            else if(res.length==0){
                io.sockets.emit("login_req", { loginAttempt: false, username: data["username"]});
            }
            else{
                let response = JSON.parse(JSON.stringify(res));
               

                if(bcrypt.compareSync(data["passwordAttempt"],response[0].password)){
                    console.log("login requested from: " + data["username"] );
                    io.sockets.emit("login_req", { loginAttempt: true, username: data["username"]});
                }
                else{
                    console.log("login requested from: " + data["username"]);
                    io.sockets.emit("login_req", { loginAttempt: false, username: data["username"]});
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
                    io.sockets.emit("reg_req", { regAttempt: false, duplicate: true, username: data["username"] });
                }
                else{
                    io.sockets.emit("reg_req", { regAttempt: false, duplicate: false, username: data["username"]});
                }
                
            }
            else{
                console.log("successfully added user: " + data["username"] );
                io.sockets.emit("reg_req", { regAttempt: true, duplicate: false, username: data["username"] });
            }
        });
    });

    socket.on('send_friend_req', function(data){
        mysqldb.query("insert into friends (user,friend,isFriend,isRequested) values (?,?,?,?)",[data["receiver"],data["sender"],'no','yes'],function(err,res){
            if(err){
                console.log("failed to send friend request from " + data["sender"] + " to " + data["receiver"]);
                console.log(err);
                io.sockets.emit("sent_req",{sender: data["sender"], receiver: data["receiver"], isSuccess: false});
            }
            else{
                console.log("sent friend request from " + data["sender"] + " to " + data["receiver"]);
                io.sockets.emit("received_friend_req",{sender: data["sender"], receiver: data["receiver"]});
                io.sockets.emit("sent_req",{sender: data["sender"], receiver: data["receiver"], isSuccess: true});
            }
        }); //adding requester as friend, and the receiver as user, notifying them they've been requested
    });

    socket.on('get_friend_req',function(data){
        mysqldb.query("select friend from friends where (user=? and isRequested='yes' and isFriend='no')",[data["user"]],function(err,res){
            if(err){
                console.log("failed to get friend requests to user: " + data["sender"]);
                console.log(err);
                io.sockets.emit("get_friend_req", {isSuccess: false, username: data["user"]});
            }
            else{
                console.log(res);
                let response = JSON.parse(JSON.stringify(res));
                console.log(response);
                io.sockets.emit("get_friend_req",{isSuccess: true, friendReqs: response, username: data["user"]});
            }
        });
    });

    socket.on('accept_friend_req',function(data){
        mysqldb.query("update friends set isFriend='yes', isRequested='no' where (user=? and friend=?)",[data["user"],data["friend"]],function(err,res){
            if(err){
                console.log(err)
                io.sockets.emit("accept_friend_req",{isSuccess: false, username: data["user"], friend: data["friend"]});
                io.sockets.emit("accept_friend_req",{username: data["friend"], friend: data["user"], isSuccess: false});
            }
            else{
                mysqldb.query("insert into friends (user,friend,isFriend,isRequested) values (?,?,?,?)",[data["friend"],data["user"],'yes','no'],function(err,res){
                    if(err){
                        console.log(err);
                        io.sockets.emit("accept_friend_req",{username: data["friend"], friend: data["user"], isSuccess: false});
                        io.sockets.emit("accept_friend_req",{isSuccess: false, username: data["user"], friend: data["friend"]});
                    }
                    else{
                        console.log("friend request accepted between " + data["user"] + " and " + data["friend"]);
                        io.sockets.emit("accept_friend_req",{isSuccess: true, username: data["user"], friend: data["friend"]});
                        io.sockets.emit("accept_friend_req",{isSuccess: true, username: data["friend"], friend: data["user"]});
                    }
                });
            }
        });
    });



    socket.on('decline_friend_req',function(data){
        mysqldb.query("delete from friends where (user=? and friend=?)",[data["user"],data["friend"]],function(err,res){
            if(err){
                console.log(err)
                io.sockets.emit("decline_friend_req",{isSuccess: false, username: data["user"], friend: data["friend"]});
            }
            else{
                console.log("friend request rejected by " + data["user"] + " from " + data["friend"]);
                io.sockets.emit("decline_friend_req",{isSuccess: true, username: data["user"], friend: data["friend"]});
            }
        });
    });


    socket.on('get_friends',function(data){
        mysqldb.query("select friend from friends where (user=? and isFriend='yes')",[data["user"]],function(err,res){
            if(err){
                console.log(err);
                io.sockets.emit("get_friends",{isSuccess: false, username: data["user"]});
            }
            else{
                let response = JSON.parse(JSON.stringify(res));
                console.log(data["user"] + " requested friends");
                io.sockets.emit("get_friends",{isSuccess: true, friends: response, username: data["user"]});
            }
        });
    });


    socket.on('send_challenge',function(data){
        io.sockets.emit("receive_challenge",{challenger: data["user"], receiver: data["friend"]});
    });

    socket.on('challenge_accepted',function(data){
        //determine player value
        let chalPlayer = "";
        let receivePlayer="";
        if(Math.random()<0.5){
            chalPlayer="X";
            receivePlayer="O";
        }
        else{
            chalPlayer="O";
            receivePlayer="X";
        }
        io.sockets.emit("challenge_accepted",{challenger: data["challenger"], receiver: data["receiver"], chalPlayer: chalPlayer, receivePlayer: receivePlayer});
    });

    socket.on('challenge_declined',function(data){
        io.sockets.emit("challenge_declined",{challenger: data["challenger"], receiver: data["receiver"]});
    });


    socket.on('inform_of_tie',function(data){
        io.sockets.emit("inform_of_tie",{user: data["user"], board: data["board"]});
    });

    socket.on('inform_of_loss',function(data){
        io.sockets.emit("inform_of_loss",{user: data["user"], board: data["board"]});
    });

    socket.on('send_player_move',function(data){
        io.sockets.emit("receive_move",{board: data["board"], curTurn: data["curTurn"], user: data["user"]});
    });

    socket.on('updateBoardDim',function(data){
        io.sockets.emit("updateBoardDim",{board: data["board"], dim: data["dim"], opponent: data["opponent"]});
    });

    socket.on('changeWinBy',function(data){
        io.sockets.emit("changeWinBy",{winby: data["winby"], opponent: data["opponent"]});
    });

    socket.on('newGame',function(data){
        io.sockets.emit("newGame",{oppPlayer: data["oppPlayer"], board: data["board"], opponent: data["opponent"]});
    });
});