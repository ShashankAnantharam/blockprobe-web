import React, { Component } from 'react';
import { Button } from '@material-ui/core';
import ViewBlockprobePublicComponent from '../../../view/ViewBlockprobePublic';
import * as Const from '../../../common/constants';
import * as firebase from 'firebase';
import './SingleGameElement.css';
import { isNullOrUndefined } from 'util';

class SingleGameListItemComponent extends React.Component {

    constructor(props){
      super(props);
      //title, id

      this.state = {
          playGame: false
      }
      this.playGame = this.playGame.bind(this);
      this.viewResults = this.viewResults.bind(this);
    }

    playGame(value){
 /*       this.setState({
            playGame: value
        });
        */
        let link = Const.blockprobeUrl + `/game/${this.props.id}`;
        window.open(link, "_blank");       
    }

    viewResults(){
        let link = Const.blockprobeUrl + `/gameResults/${this.props.id}`;
        window.open(link, "_blank")
    }

    render(){
        return (
            <div className="singleGameElementContainer">
                <h4 style={{textAlign:'center'}}>{this.props.title}</h4>
                <div>
                    {this.state.playGame?
                    <Button
                        variant="contained" 
                        className="playGameListItembutton"
                        onClick={() => { this.playGame(false)}}> 
                        Close</Button>
                        :
                    <Button
                        variant="contained" 
                        className="playGameListItembutton"
                        onClick={() => { this.playGame(true)}}> 
                        Play Game</Button>
                    }

                    <Button
                        variant="contained" 
                        className="viewResultGameListItembutton"
                        onClick={() => { this.viewResults()}}> 
                        View Results</Button>
                
                </div>
                              
            </div>
        )
    }
}
export default SingleGameListItemComponent;