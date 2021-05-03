import React, { Component } from 'react';

class DimSelect extends Component{
    constructor(props){
        super(props);
    }
    render(){
        if(this.props.isOnline===false || this.props.isHost){
            return(
                <div>
                    Select board dimension:
                    <select id="dimlist" onChange={this.props.onChangeDim}>
                        <option value = "3">3</option>
                        <option value = "4">4</option>
                        <option value = "5">5</option>
                        <option value = "6">6</option>
                        <option value = "7">7</option>
                        <option value = "8">8</option>
                        <option value = "9">9</option>
                        <option value = "10">10</option>
                        <option value = "11">11</option>
                        <option value = "12">12</option>
                        <option value = "13">13</option>
                        <option value = "14">14</option>
                        <option value = "15">15</option>
                    </select>
                    Select win by condition:
                    <select id="winbylist" onChange={this.props.onChangeWinBy}>
                        <option value = "3">3</option>
                        <option value = "4">4</option>
                        <option value = "5">5</option>
                        <option value = "6">6</option>
                    </select>
                    <form onSubmit={this.props.newGame}>
                        <input type="Submit" value="Start New Game"></input>
                    </form>
                </div>
            );
        }
        else{
            return(
                <div></div>
            );
        }
        
    }
}
export default DimSelect;