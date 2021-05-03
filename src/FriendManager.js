import React, { Component } from 'react';

class FriendManager extends Component{
    constructor(props){
        super(props);
    }


    render(){
        if(this.props.friends){
            if(this.props.friendReqs){
                
                return(
                    <div id="friend">
                        <form onSubmit={this.props.reqFriend}>
                            Send Friend Request:<input type="text" onChange={this.props.onChangeReq}></input>
                            <input type="Submit" value="Request" id="freqbtn"></input>
                        </form>
                        
                        <div id="friendReqList">
                            <h3>Friend Requests:</h3>
                            {this.props.friendReqs.map((value,index)=>(
                             <div key={index} id={"fr-"+index} className="friendRequest">
                                 <p>{value.friend}</p>
                                 <input type="Submit" value="Accept" className="afr" onClick={this.props.accFR}></input>
                                 <input type="Submit" value="Decline" className="dfr" onClick={this.props.decFR}></input>
                            </div>   
                            ))}
                        </div>
                        <div id="friendsList">
                            <h3>Friends:</h3>
                        {this.props.friends.map((value,index)=>(
                            <div key={index} id={"f-"+index} className="friends">
                                 <p>{value.friend}</p>
                                 <input type="Submit" value="Challenge" className="cbtn" onClick={this.props.sendChallenge}></input>
                            </div>   
                            ))}
                        </div>

                        <div id="challengerList">
                            <h3>Challengers:</h3>
                        {this.props.challengers.map((value,index)=>(
                            <div key={index} id={"c-"+index} className="challengers">
                                 <p>{value}</p>
                                 <input type="Submit" value="Accept" className="afr" onClick={this.props.accChal}></input>
                                 <input type="Submit" value="Decline" className="dfr" onClick={this.props.decChal}></input>
                            </div>   
                            ))}
                        </div>
                    </div>
                );


            }
            else{

                return(
                    <div id="friend">
                        <form onSubmit={this.props.reqFriend}>
                            Send Friend Request:<input type="text" onChange={this.props.onChangeReq}></input>
                            <input type="Submit" value="Request" id="freqbtn"></input>
                        </form>
                        
                        <div id="friendsList">
                            <h3>Friends:</h3>
                        {this.props.friends.map((value,index)=>(
                            <div key={index} id={"f-"+index} className="friends">
                                 <p>{value.friend}</p>
                            </div>   
                            ))}
                        </div>
                    </div>
                );

            }
        }
        else{
            if(this.props.friendReqs){


                return(
                    <div id="friend">
                        <form onSubmit={this.props.reqFriend}>
                            Send Friend Request:<input type="text" onChange={this.props.onChangeReq}></input>
                            <input type="Submit" value="Request" id="freqbtn"></input>
                        </form>
                        
                        <div id="friendReqList">
                            <h3>Friend Requests:</h3>
                            {this.props.friendReqs.map((value,index)=>(
                             <div key={index} id={"fr-"+index} className="friendRequest">
                                 <p>{value.friend}</p>
                                 <input type="Submit" value="Accept" className="afr" onClick={this.props.accFR}></input>
                                 <input type="Submit" value="Decline" className="dfr" onClick={this.props.decFR}></input>
                            </div>   
                            ))}
                        </div>
                    </div>
                );
                

            }
            else{
                return(
                    <div id="friend">
                        <form onSubmit={this.props.reqFriend}>
                            Send Friend Request:<input type="text" onChange={this.props.onChangeReq}></input>
                            <input type="Submit" value="Request" id="freqbtn"></input>
                        </form>
                    </div>
                );
                

            }

        } 
        
    }
}
export default FriendManager;