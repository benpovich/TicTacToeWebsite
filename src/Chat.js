import React, { Component } from 'react';

class Chat extends Component{
    constructor(props){
        super(props);
    }
    render(){
        if(this.props.isOnline){
            return(
                <div id="entireChat">
                    {this.props.recMsg.map((value,index)=>(
                        <div key={index} id={"m-"+index} className="chatmsg">
                            <p>{value}</p>
                        </div>

                    ))}
                    <div id="chatDiv">
                        <form id="chat" onSubmit={this.props.sendMsg}>
                            <input type="text" id="txtbox" onChange={this.props.onChangeMsg}></input>
                            <input type="submit" value="Send" id="sendbtn"></input>
                        </form>
                    </div>
                </div>
                
            );
        }
        else{
            return(
                <div>

                </div>
            );
        }
        
    }
}
export default Chat;