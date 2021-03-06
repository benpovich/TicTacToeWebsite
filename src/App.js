import React, { Component } from 'react';
import './App.css';
import Login from './login.js';
import DimSelect from './DimSelect.js';
import TicTacToe from './tictactoe.js';
import FriendManager from './FriendManager.js';
import Chat from './Chat.js';
import io from 'socket.io-client';

let socketio = io("ws://ec2-184-73-88-167.compute-1.amazonaws.com:3456/", { transports: ["websocket"] });

class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      username: "",
      enteredPassword: "",
      isLoggedIn: false,
      attemptLogin: false,
      boardDimensions: 3,
      opponent: "",
      player: "X",
      board: [],
      winby: 3,
      winner: false,
      gameFinished: false,
      tie: false,
      request: "",
      friendReq: [],
      friends: [],
      isOnline: false,
      currentTurn: "X",
      isHost: false,
      challengers: [],
      message: "",
      receivedMsg: []
    }
    this.loginReq = this.loginReq.bind(this);
    this.onChangeUname = this.onChangeUname.bind(this);
    this.onChangePword = this.onChangePword.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.regReq = this.regReq.bind(this);
    this.logoutReq = this.logoutReq.bind(this);
    this.setupBoard = this.setupBoard.bind(this);
    this.modifyBoard = this.modifyBoard.bind(this);
    this.onChangeDim = this.onChangeDim.bind(this);
    this.onChangeWinBy = this.onChangeWinBy.bind(this);
    this.onChangeReq = this.onChangeReq.bind(this);
    this.isWin = this.isWin.bind(this);
    this.newGame = this.newGame.bind(this);
    this.sendFriendRequest = this.sendFriendRequest.bind(this);
    this.getFriendReqs = this.getFriendReqs.bind(this);
    this.acceptFriendReq = this.acceptFriendReq.bind(this);
    this.declineFriendReq = this.declineFriendReq.bind(this);
    this.getFriends = this.getFriends.bind(this);
    this.sendChallenge = this.sendChallenge.bind(this);
    this.modifyBoardOnline = this.modifyBoardOnline.bind(this);
    this.acceptChallenge = this.acceptChallenge.bind(this);
    this.declineChallenge = this.declineChallenge.bind(this);
    this.onChangeDimOnline = this.onChangeDimOnline.bind(this);
    this.newGameOnline = this.newGameOnline.bind(this);
    this.onChangeWinByOnline = this.onChangeWinByOnline.bind(this);
    this.sendMsg = this.sendMsg.bind(this);
    this.onChangeMsg = this.onChangeMsg.bind(this);
    this.leaveGame = this.leaveGame.bind(this);


    this.setupBoard();


  }


  render() {
    if (this.state.isLoggedIn) {
      return (
        <div id="everything">
          <h3>Welcome, {this.state.username}!</h3>
          <div id="logoutdiv">
            <form onSubmit={this.logoutReq}>
              <input type="Submit" value="Log out" id="logoutbtn"></input>
            </form>
          </div>

          <FriendManager challengers={this.state.challengers} accChal={this.acceptChallenge} decChal={this.declineChallenge} sendChallenge={this.sendChallenge} decFR={this.declineFriendReq} accFR={this.acceptFriendReq} getFriendReqs={this.getFriendReqs} friends={this.state.friends} friendReqs={this.state.friendReq} reqFriend={this.sendFriendRequest} onChangeReq={this.onChangeReq}></FriendManager>
          <DimSelect isOnline={this.state.isOnline} isHost={this.state.isHost} onChangeDim={this.onChangeDim} onChangeWinBy={this.onChangeWinBy} newGame={this.newGame}></DimSelect>
          <TicTacToe curTurn={this.state.currentTurn} isOnline={this.state.isOnline} boardDimensions={this.state.boardDimensions} username={this.state.username} opponent={this.state.opponent}
            player={this.state.player} board={this.state.board} modifyBoard={this.modifyBoard} isWinner={this.state.winner}
            isGameFinished={this.state.gameFinished} isTie={this.state.tie} leaveGame={this.leaveGame}
          ></TicTacToe>
          <Chat user={this.state.username} onChangeMsg={this.onChangeMsg} sendMsg={this.sendMsg} isOnline={this.state.isOnline} recMsg={this.state.receivedMsg}></Chat>
        </div>
      );
    }
    else {
      return (
        <div id="everything">
          <div className="login">
            <Login username={this.state.username} password={this.state.enteredPassword} regReq={this.regReq} loginReq={this.loginReq}
              onChangeUname={this.onChangeUname} onChangePword={this.onChangePword} isLoggedIn={this.state.isLoggedIn}
              attemptLogin={this.state.attemptLogin} logoutReq={this.logoutReq}
            ></Login>
          </div>
        </div>
      );
    }

  }

  componentDidMount() {

    let self = this;
    if (window.sessionStorage.getItem("username") !== "") {
      self.setState({
        username: window.sessionStorage.getItem("username"),
        isLoggedIn: window.sessionStorage.getItem("isLoggedIn")

      }, function () {
        self.getFriendReqs(); //logged in, get friends & requests
        self.getFriends();
      });

    }



    socketio.on("challenge_accepted", function (data) {
      if (self.state.username === data["challenger"]) {
        self.setState({
          opponent: data["receiver"],
          player: data["chalPlayer"],
          isOnline: true,
          isHost: true
        });
      }
      else if (self.state.username === data["receiver"]) {
        //set state variables

        self.setState({
          opponent: data["challenger"],
          player: data["receivePlayer"],
          isOnline: true,
          isHost: false
        });
        self.newGameOnline();
      }
    });

    socketio.on("challenge_declined", function (data) {
      if (self.state.username === data["challenger"]) {
        alert(data["receiver"] + " declined your challenge :(");
      }
    })



    socketio.on("receive_challenge", function (data) {
      if (self.state.username === data["receiver"]) {
        let friend = data["challenger"];
        if (self.state.challengers && !self.state.challengers.includes(friend)) { //checks to make sure you didnt already challenge
          let oldChallengers = self.state.challengers
          self.setState({
            challengers: [...oldChallengers, data["challenger"]]
          });
        }
      }

    });

    socketio.on("inform_of_tie", function (data) {
      if (self.state.username === data["user"]) {
        self.setState({
          board: data["board"]
        }, function () {
          self.setState({
            tie: true,
            gameFinished: true
          });
        });
      }
    });

    socketio.on("inform_of_loss", function (data) {
      if (self.state.username === data["user"]) {
        self.setState({
          board: data["board"]

        }, function () {
          self.setState({
            winner: false,
            gameFinished: true,
            tie: false
          });
        });

      }
    });

    socketio.on("receive_move", function (data) {
      if (self.state.username === data["user"]) {

        let newBoard = data["board"];
        self.setState({
          board: newBoard,
          currentTurn: data["curTurn"]
        });
      }
    })



    socketio.on("login_req", function (data) {
      if (self.state.username === data["username"]) {
        self.setState({
          attemptLogin: true
        });
        if (data["loginAttempt"]) {
          self.setState({ isLoggedIn: true }, function () {
            self.getFriendReqs(); //logged in, get friends & requests
            self.getFriends();
            window.sessionStorage.setItem("username", this.state.username);
            window.sessionStorage.setItem("isLoggedIn", this.state.isLoggedIn);
          });

        }
        else {
          alert("Failed to log in. Please try again");
        }
      }

    });


    socketio.on("reg_req", function (data) {
      if (self.state.username === data["username"]) {
        if (data["regAttempt"]) {
          alert("Registration successful!");
        }
        else {
          if (data["duplicate"]) {
            alert("Account with username: " + self.state.username + " already exists! Try logging in.");
          }
          else {
            alert("Registration unsuccessful :(");
          }
        }

      }
    });

    socketio.on("sent_req", function (data) {
      if (self.state.username === data["sender"]) {
        if (data["isSuccess"]) {
          //alert("Successfully send friend request to " + data["receiver"]);
        }
        else {
          //alert("Failed to send friend request to " + data["receiver"]);
        }
      }
    });


    socketio.on("received_friend_req", function (data) {
      if (self.state.username === data["receiver"]) {
        //add user to friend request list
        self.getFriendReqs(); //logged in, get friends & requests
      }
    });

    socketio.on("get_friend_req", function (data) {
      if (self.state.username === data["username"]) {
        if (data["isSuccess"]) {
          let newFR = data["friendReqs"];
          self.setState({
            friendReq: newFR
          });


        }
      }
    });

    socketio.on("accept_friend_req", function (data) {
      if (self.state.username === data["username"]) {
        if (data["isSuccess"]) {
          let oldFriend = self.state.friends;
          self.setState({
            friend: [...oldFriend, data["friend"]]
          }, function () {
            self.getFriendReqs(); //logged in, get friends & requests
            self.getFriends();
          });
        }
      }
      else if (self.state.username === data["friend"]) {
        let oldFriend = self.state.friends;
        self.setState({
          friend: [...oldFriend, data["user"]]
        }, function () {
          self.getFriendReqs(); //logged in, get friends & requests
          self.getFriends();
        });
      }
    });

    socketio.on("decline_friend_req", function (data) {
      if (self.state.username === data["username"]) {
        if (data["isSuccess"]) {
          self.getFriendReqs();
        }

      }
    }
    );

    socketio.on("get_friends", function (data) {
      if (self.state.username === data["username"]) {
        if (data["isSuccess"]) {
          let newFriends = data["friends"];
          self.setState({
            friends: newFriends
          });
        }
      }
    });

    socketio.on("updateBoardDim", function (data) {
      if (self.state.username === data["opponent"]) {
        self.setState({
          board: data["board"],
          boardDimensions: data["dim"]
        });
      }
    });

    socketio.on("changeWinBy", function (data) {
      if (self.state.username === data["opponent"]) {
        self.setState({
          winby: data["winby"]
        });
      }
    });

    socketio.on("newGame", function (data) {
      if (self.state.username === data["opponent"]) {
        self.setState({
          board: data["board"],
          winner: false,
          gameFinished: false,
          tie: false,
          currentTurn: "X",
          player: data["oppPlayer"]
        });
      }
    });

    socketio.on("receive_msg", function (data) {
      if (self.state.username === data["receiver"]) {
        let message = data["sender"] + ": " + data["message"];
        let messages = [message, ...self.state.receivedMsg];

        self.setState({
          receivedMsg: messages
        });
      }
      else if (self.state.username === data["sender"]) {
        let message = data["sender"] + ": " + data["message"];
        let messages = [message, ...self.state.receivedMsg];

        self.setState({
          receivedMsg: messages
        });
      }
    });

    socketio.on("leave_game", function (data) {
      if (self.state.username === data["user"]) {
        let oldOpp = self.state.opponent;
        alert(oldOpp + " has left your game!");

        let newMsgs = [];
        self.setState({
          opponent: "",
          isOnline: false,
          isHost: false,
          player: "X",
          receivedMsg: newMsgs
        }, function () {
          self.setState({
            winner: false,
            gameFinished: false,
            tie: false,
            board: []
          }, function () {
            for (let i = 0; i < self.state.boardDimensions * self.state.boardDimensions; i++) {

              let oldBoard = self.state.board;
              oldBoard[i] = " ";
              self.setState({
                board: oldBoard
              });
            }
          });
        });
      }
    });
  }


  leaveGame(event) {
    event.preventDefault();
    let newMsgs = [];
    let oldOpp = this.state.opponent;
    this.setState({
      opponent: "",
      isOnline: false,
      isHost: false,
      player: "X",
      receivedMsg: newMsgs

    }, function () {
      this.newGame(event);
      socketio.emit("leave_game", { opponent: oldOpp });
    });

  }


  sendMsg(event) {
    event.preventDefault();
    socketio.emit("send_msg", { sender: this.state.username, receiver: this.state.opponent, message: this.state.message });
    event.target.firstChild.value = "";
  }

  onChangeMsg(event) {
    this.setState({
      message: event.target.value
    });
  }

  getFriends() {
    socketio.emit("get_friends", { user: this.state.username });
  }

  acceptFriendReq(event) {
    event.preventDefault();
    let friend = event.target.previousSibling.innerHTML;
    socketio.emit("accept_friend_req", { user: this.state.username, friend: friend });
  }

  declineFriendReq(event) {
    event.preventDefault();
    let friend = event.target.previousSibling.previousSibling.innerHTML;

    socketio.emit("decline_friend_req", { user: this.state.username, friend: friend });
  }

  sendChallenge(event) {
    event.preventDefault();
    let friend = event.target.previousSibling.innerHTML;
    if (this.state.challengers && !this.state.challengers.includes(friend)) { //checks to make sure you didnt already challenge
      socketio.emit("send_challenge", { user: this.state.username, friend: friend });
    }

  }


  getFriendReqs() {
    socketio.emit("get_friend_req", { user: this.state.username });
  }

  acceptChallenge(event) {
    event.preventDefault();
    if (!this.state.isOnline) {
      let challenger = event.target.previousSibling.innerHTML;
      let clearChallengers = [];
      this.setState({
        challengers: clearChallengers
      });
      this.newGameOnline(event);
      socketio.emit("challenge_accepted", { challenger: challenger, receiver: this.state.username });

    }
  }

  declineChallenge(event) {
    event.preventDefault();
    let challenger = event.target.previousSibling.previousSibling.innerHTML;
    let removeChallenge = this.state.challengers;
    let index = removeChallenge.indexOf(challenger);
    removeChallenge.splice(index, 1);
    this.setState({
      challenger: removeChallenge
    });
    socketio.emit("challenge_declined", { challenger: challenger, receiver: this.state.username });
  }

  onChangeReq(event) {
    this.setState({
      request: event.target.value
    });
  }

  onChangeUname(event) {
    this.setState({
      username: event.target.value
    });
  }

  onChangePword(event) {
    this.setState({
      enteredPassword: event.target.value
    });
  }

  onChangeWinByOnline(event) {
    let winbycond = event.target.value;
    if (Number(winbycond) > Number(this.state.boardDimensions)) {
      winbycond = this.state.boardDimensions
      event.target.value = winbycond;
    }
    this.setState({
      winby: winbycond
    }, function () {
      socketio.emit("changeWinBy", { winby: winbycond, opponent: this.state.opponent });
    });
  }

  onChangeWinBy(event) {
    if (this.state.isOnline) {
      this.onChangeWinByOnline(event);
    }
    else {
      let winbycond = event.target.value;
      if (Number(winbycond) > Number(this.state.boardDimensions)) {
        winbycond = this.state.boardDimensions
        event.target.value = winbycond;
      }
      this.setState({
        winby: winbycond
      });
    }

  }

  sendFriendRequest(event) {
    event.preventDefault();
    if (this.state.friends && this.state.friends.some(item => item.friend === this.state.request)) { //checks to make sure you arent already friends
      this.setState({
        request: ""
      });
    }
    else if (this.state.friendReq && this.state.friendReq.some(item => item.friend === this.state.request)) {//checks to make sure you havent already requested
      this.setState({
        request: ""
      });
    }
    else {
      socketio.emit("send_friend_req", { sender: this.state.username, receiver: this.state.request });
    }

  }



  isWin() {


    let currentBoard = this.state.board;
    let dim = this.state.boardDimensions
    let winby = Number(this.state.winby);
    let userPlayer = this.state.player;


    //first check rows
    //index = dim*row# + col#
    for (let row = 0; row < dim; row++) {

      let sameCount = 0;
      let firstplayer = currentBoard[dim * row];

      for (let col = 0; col < dim; col++) {

        let index = dim * row + col;

        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }


    //now check cols
    for (let col = 0; col < dim; col++) {

      let sameCount = 0;
      let firstplayer = currentBoard[col];

      for (let row = 0; row < dim; row++) {

        let index = dim * row + col;

        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }


    //now check low left to top right diag. top left part of board
    for (let row = dim - 1; row >= 0; row--) {

      let sameCount = 0;
      let firstplayer = " ";
      let tempRow = row;

      for (let col = 0; col < dim; col++) {
        let index = dim * tempRow + col;

        if (tempRow < 0) {
          continue;
        }

        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        tempRow--;

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }


    //now check top right to lower left diag. bottom right part of board
    for (let row = 1; row < dim; row++) {

      let sameCount = 0;
      let firstplayer = " ";
      let tempRow = row;

      for (let col = dim - 1; col >= 0; col--) {
        let index = dim * tempRow + col;

        if (tempRow >= dim) {
          continue;
        }
        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        tempRow++;

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }


    //now check top left to bottom right diag. top right part of board
    for (let col = 0; col < dim; col++) {

      let sameCount = 0;
      let firstplayer = " ";
      let tempCol = col;

      for (let row = 0; row < dim; row++) {
        let index = dim * row + tempCol;

        if (tempCol >= dim) {
          continue;
        }

        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        tempCol++;

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }

    //now check top left to bottom right diag. top right part of board
    for (let col = dim - 1; col >= 0; col--) {

      let sameCount = 0;
      let firstplayer = " ";
      let tempCol = col;

      for (let row = dim - 1; row >= 0; row--) {
        let index = dim * row + tempCol;

        if (tempCol < 0) {
          continue;
        }

        if (firstplayer === currentBoard[index] && firstplayer !== " ") {
          sameCount++;
        }
        else {
          firstplayer = currentBoard[index];
          sameCount = 1;
        }

        tempCol--;

        if (sameCount === winby) {
          if (firstplayer === userPlayer) {
            this.setState({ //current user won
              winner: true,
              gameFinished: true
            });
          }
          else {
            this.setState({ //current user won
              winner: false,
              gameFinished: true
            });
          }


          return true;
        }
      }
    }


  }


  newGameOnline(event) {
    let thisPlayer = "";
    let oppPlayer = "";
    if (Math.random < 0.5) {
      thisPlayer = "X";
      oppPlayer = "O";
    }
    else {
      thisPlayer = "O";
      oppPlayer = "X";
    }
    this.setState({
      winner: false,
      gameFinished: false,
      tie: false,
      board: [],
      currentTurn: "X",
      player: thisPlayer
    }, function () {
      for (let i = 0; i < this.state.boardDimensions * this.state.boardDimensions; i++) {

        let oldBoard = this.state.board;
        oldBoard[i] = " ";
        this.setState({
          board: oldBoard
        }, function () {
          socketio.emit("newGame", { board: this.state.board, opponent: this.state.opponent, oppPlayer: oppPlayer });
        });
      }
    });
  }



  newGame(event) {
    event.preventDefault();
    if (this.state.isOnline) {
      this.newGameOnline(event);
    }
    else {
      this.setState({
        winner: false,
        gameFinished: false,
        tie: false,
        board: []
      }, function () {
        for (let i = 0; i < this.state.boardDimensions * this.state.boardDimensions; i++) {

          let oldBoard = this.state.board;
          oldBoard[i] = " ";
          this.setState({
            board: oldBoard
          });
        }
      });
    }

  }


  onChangeDimOnline(event) {
    if (window.confirm("Changing the dimensions will reset the game. Continue?")) {

      let dim = event.target.value;
      let clearBoard = [];
      this.setState({
        boardDimensions: dim,
        board: clearBoard
      }, function () { //callback necessary as state does not update right away
        for (let i = 0; i < this.state.boardDimensions * this.state.boardDimensions; i++) {

          let oldBoard = this.state.board;
          oldBoard[i] = " ";
          this.setState({
            board: oldBoard
          }, function () {
            socketio.emit("updateBoardDim", { board: this.state.board, dim: dim, opponent: this.state.opponent });
          });
        }



      });
    }
    else {
      event.target.value = this.state.boardDimensions;
    }
  }

  onChangeDim(event) {
    event.preventDefault();
    if (this.state.isOnline) {
      this.onChangeDimOnline(event);
    } else {
      if (window.confirm("Changing the dimensions will reset the game. Continue?")) {
        let dim = event.target.value;
        let clearBoard = [];
        this.setState({
          boardDimensions: dim,
          board: clearBoard
        }, function () { //callback necessary as state does not update right away
          for (let i = 0; i < this.state.boardDimensions * this.state.boardDimensions; i++) {

            let oldBoard = this.state.board;
            oldBoard[i] = " ";
            this.setState({
              board: oldBoard
            });
          }
        });
      }
      else {
        event.target.value = this.state.boardDimensions;
      }
    }



  }
  setupBoard() {
    console.log("Dim of board is " + this.state.boardDimensions);
    for (let i = 0; i < this.state.boardDimensions * this.state.boardDimensions; i++) {

      let oldBoard = this.state.board;
      oldBoard[i] = " ";
      this.setState({
        board: oldBoard
      });

    }
  }


  modifyBoardOnline(event) {

    if (!this.state.gameFinished) {
      let self = this;
      if (self.state.currentTurn === self.state.player) {

        let currentBoard = self.state.board;
        let playerSpaceIndex = event.target.id;
        let opponentPlayer = "";
        if (self.state.player === "X") {
          opponentPlayer = "O";
        }
        else {
          opponentPlayer = "X";
        }

        let currentRemainingSpaces = 0;
        for (let i = 0; i < self.state.board.length; i++) {
          if (self.state.board[i] === " ") {
            currentRemainingSpaces++;
          }
        }
        if (currentRemainingSpaces === 0) {
          self.setState({
            tie: true,
            gameFinished: true
          }, function () {
            socketio.emit("inform_of_tie", { user: self.state.opponent, board: self.state.board });

          });
        }
        if (currentBoard[playerSpaceIndex] === " ") {
          currentBoard[playerSpaceIndex] = self.state.player;

          self.setState({
            board: currentBoard,
            currentTurn: opponentPlayer
          }, function () {

            //first, check for win

            if (self.isWin()) {
              socketio.emit("inform_of_loss", { user: self.state.opponent, board: self.state.board });
            }
            else if (currentRemainingSpaces === 1) {
              self.setState({
                tie: true,
                gameFinished: true
              })
              socketio.emit("inform_of_tie", { user: self.state.opponent, board: self.state.board });
            }
            else {
              //send update
              socketio.emit("send_player_move", { user: self.state.opponent, board: self.state.board, player: self.state.player, curTurn: self.state.currentTurn });

            }




          });

        }





      }


    }



  }



  modifyBoard(event) {

    if (this.state.isOnline) {
      this.modifyBoardOnline(event);
    }
    else {


      if (!this.state.gameFinished) {
        let self = this;
        let oldBoard = this.state.board;

        let curRemain = 0;
        for (let i = 0; i < self.state.board.length; i++) {
          if (self.state.board[i] === " ") {
            curRemain++;
          }
        }
        if (curRemain === 0) {
          self.setState({
            tie: true,
            gameFinished: true
          });
        }
        if (oldBoard[event.target.id] === " ") {
          oldBoard[event.target.id] = this.state.player;

          this.setState({
            board: oldBoard
          }, function () {
            if (self.state.opponent === "") {

              if (!self.isWin()) {
                let computerPick = Math.floor(Math.random() * self.state.board.length);
                let remainingSpaces = 0;
                for (let i = 0; i < self.state.board.length; i++) {
                  if (self.state.board[i] === " ") {
                    remainingSpaces++;
                  }
                }
                if (remainingSpaces > 0) {
                  while (self.state.board[computerPick] !== " ") {
                    computerPick = Math.floor(Math.random() * self.state.board.length);
                  }
                  let compPlayer = "";
                  if (self.state.player === "X") {
                    compPlayer = "O";
                  }
                  else {
                    compPlayer = "X";
                  }
                  let oldBoard = self.state.board;
                  oldBoard[computerPick] = compPlayer;
                  self.setState({
                    board: oldBoard
                  }, function () {
                    self.isWin();
                  });
                }
                else {
                  self.setState({
                    tie: true,
                    gameFinished: true
                  });
                }
              }


            }

          });


        }
      }
    }
  }

  loginReq(event) {
    event.preventDefault();
    socketio.emit("login_req", { username: this.state.username, passwordAttempt: this.state.enteredPassword });
    //sends req to server to verify if this is the correct username/password
    //if so, we have a successful login, else we fail to login
  }

  regReq(event) {
    event.preventDefault();
    socketio.emit("reg_req", { username: this.state.username, passwordAttempt: this.state.enteredPassword });
  }

  logoutReq(event) {
    event.preventDefault();
    this.setState({
      username: "",
      enteredPassword: "",
      isLoggedIn: false,
      attemptLogin: false,
      boardDimensions: 3,
      opponent: "",
      player: "X",
      board: [],
      winby: 3,
      winner: false,
      gameFinished: false,
      tie: false,
      request: "",
      friendReq: [],
      friends: [],
      isOnline: false,
      currentTurn: "X",
      isHost: false,
      challengers: [],
      message: "",
      receivedMsg: []

    }, function () {
      window.sessionStorage.setItem("username", "");
      window.sessionStorage.setItem("isLoggedIn", "");


    });
  }
}

export default App;
