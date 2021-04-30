import React, { Component } from 'react';

class Login extends Component{
    constructor(props){
        super(props);
    }
    render(){
        return(
            <form onSubmit={this.props.loginReq}>
                Username: <input type="text" id="username" onChange={this.props.onChangeUname}></input>
                Password: <input type="password" id="password" onChange={this.props.onChangePword}></input>
                <input type="Submit" value="Login" id="loginbtn"></input>
            </form>
        );
    }
       
}

export default Login;