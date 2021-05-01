import React, { Component } from 'react';
import './App.css';
import Login from './login.js';
import io from 'socket.io-client'

let socketio = io("ws://ec2-184-73-88-167.compute-1.amazonaws.com:3456/",{transports: ["websocket"]});

class App extends Component{
  
  
  constructor(props){
    super(props);
    this.state={
      username: "",
      enteredPassword: "",
      isLoggedIn: false,
      attemptLogin: false
    }
    this.loginReq = this.loginReq.bind(this);
    this.onChangeUname = this.onChangeUname.bind(this);
    this.onChangePword = this.onChangePword.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.regReq = this.regReq.bind(this);
  }


  render(){
    return (
      <div className="login">
        <Login username={this.state.username} password={this.state.enteredPassword} regReq = {this.regReq} loginReq={this.loginReq}
        onChangeUname={this.onChangeUname} onChangePword={this.onChangePword} isLoggedIn={this.state.isLoggedIn} attemptLogin={this.state.attemptLogin}
        ></Login>
      </div>
    );
  }

  componentDidMount(){
    let self = this;
    socketio.on("login_req", function(data){
      console.log("Got request! And it was: " + data["loginAttempt"]);
      self.setState({
        attemptLogin: true
      });
      if(data["loginAttempt"]){
        self.setState({isLoggedIn: true}); 
        alert("Logged into " + self.state.username + " successfully!");
      }
      else{
        alert("Failed to log in. Please try again");
      }
    });


    socketio.on("reg_req",function(data){
      console.log("Got reg response! And it was: " + data["regAttempt"]);
      //TODO do stuff
      if(data["regAttempt"]){
        alert("Registration successful!");
      }
      else{
        if(data["duplicate"]){
          alert("Account with username: "+ this.state.username + " already exists! Try logging in.");
        }
        else{
          alert("Registration unsuccessful :(");
        }
      }
    });
  }

  onChangeUname(event){
    this.setState({
      username: event.target.value
    });
  }

  onChangePword(event){
    this.setState({
      enteredPassword: event.target.value
    });
  }

  loginReq(event){
    event.preventDefault();
    console.log(this.state.username);
    console.log(this.state.enteredPassword);
    socketio.emit("login_req",{username: this.state.username, passwordAttempt: this.state.enteredPassword});
    //sends req to server to verify if this is the correct username/password
    //if so, we have a successful login, else we fail to login
  }

  regReq(event){
    event.preventDefault();
    socketio.emit("reg_req",{username: this.state.username, passwordAttempt: this.state.enteredPassword});
  }

}

export default App;
