import React, { Component } from 'react';
import './App.css';
import Login from './login.js';
import io from 'socket.io-client'

let socketio = io.connect();
class App extends Component{
  
  
  constructor(props){
    super(props);
    this.state={
      username: "",
      enteredPassword: "",
      isLoggedIn: false
    }
    this.loginReq = this.loginReq.bind(this);
    this.onChangeUname = this.onChangeUname.bind(this);
    this.onChangePword = this.onChangePword.bind(this);
  }


  render(){
    return (
      <div className="login">
        <Login username={this.state.username} password={this.state.enteredPassword} loginReq={this.loginReq}
        onChangeUname={this.onChangeUname} onChangePword={this.onChangePword} isLoggedIn={this.state.isLoggedIn}
        ></Login>
      </div>
    );
  }

  componentDidMount(){
    socketio.on("login_req", function(data){
        //if(loginsuccessful){this.setstate({isLoggedIn: true}); } else...
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
    socketio.emit("login_req",{username: this.state.username, passwordAttempt: this.state.password});
    //sends req to server to verify if this is the correct username/password
    //if so, we have a successful login, else we fail to login
  }



}

export default App;
