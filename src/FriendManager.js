import React, { Component } from 'react';
import './FriendManager.css';
class FriendManager extends Component {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div id="friend">
                <div id="friendreq">
                    <form onSubmit={this.props.reqFriend}>
                        <div id="sendfr">Send Friend Request:<input type="text" id="sendfrtxt" onChange={this.props.onChangeReq}></input>
                            <input type="Submit" value="Request" id="freqbtn"></input>
                        </div>
                    </form>
                </div>
                <div id="friendReqList">
                    <h3>Friend Requests:</h3>
                    {this.props.friendReqs.map((value, index) => (
                        <div key={index} id={"fr-" + index} className="friendRequest">
                            <p>{value.friend}</p>
                            <input type="Submit" value="Accept" className="afr" onClick={this.props.accFR}></input>
                            <input type="Submit" value="Decline" className="dfr" onClick={this.props.decFR}></input>
                        </div>
                    ))}
                </div>
                <div id="friendsList">
                    <h3>Friends:</h3>
                    {this.props.friends.map((value, index) => (
                        <div key={index} id={"f-" + index} className="friends">
                            <p>{value.friend}</p>
                            <input type="Submit" value="Challenge" className="cbtn" onClick={this.props.sendChallenge}></input>
                        </div>
                    ))}
                </div>

                <div id="challengerList">
                    <h3>Challengers:</h3>
                    {this.props.challengers.map((value, index) => (
                        <div key={index} id={"c-" + index} className="challengers">
                            <p>{value}</p>
                            <input type="Submit" value="Accept" className="afr" onClick={this.props.accChal}></input>
                            <input type="Submit" value="Decline" className="dfr" onClick={this.props.decChal}></input>
                        </div>
                    ))}
                </div>
            </div>
        );


    }


}
export default FriendManager;