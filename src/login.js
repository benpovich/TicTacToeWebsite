import React, { Component } from 'react';

class Login extends Component{
    constructor(props){
        super(props);
    }
    render(){
        if(this.props.attemptLogin){ //if login was attempted & successful, display "welcome user", else display form & notif
            if(this.props.isLoggedIn){
                return(
                    <div id="loginTerminal">
                        <h3>Welcome, {this.props.username}</h3>
                    </div>
                );
               
            }
            else{
                return(
                    <div id="loginTerminal">
                        <h3>Login Failed, Username or Password Incorrect!</h3>
                        <form onSubmit={this.props.loginReq}>
                            Username: <input type="text" id="username" onChange={this.props.onChangeUname}></input>
                            Password: <input type="password" id="password" onChange={this.props.onChangePword}></input>
                        <input type="Submit" value="Login" id="loginbtn"></input>
                    </form>
                    </div>
                    
                );
            } 
        }
        else{
            return(
                <div id="loginTerminal">
                    <form onSubmit={this.props.loginReq}>
                    Username: <input type="text" id="username" onChange={this.props.onChangeUname}></input>
                    Password: <input type="password" id="password" onChange={this.props.onChangePword}></input>
                    <input type="Submit" value="Login" id="loginbtn"></input>
                </form>
                </div>
                
            );
        }
        
    }
       
}

export default Login;