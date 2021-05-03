import React, { Component } from 'react';
import './login.css';

class Login extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (

            <div id="loginTerminal">
                <h2>Tic Tac Toe Online</h2>
                <form onSubmit={this.props.loginReq}>
                    <div id="unameTerm">Username: <input type="text" id="username" onChange={this.props.onChangeUname}></input></div>
                    <div id="pwordTerm">Password: <input type="password" id="password" onChange={this.props.onChangePword}></input></div>
                    <input type="Submit" value="Login" id="loginbtn"></input>
                </form>
                <form onSubmit={this.props.regReq}>
                    <input type="Submit" value="Register" id="regbtn"></input>
                </form>
            </div>


        );

    }

}

export default Login;