import React, { Component } from 'react';
import * as firebase from 'firebase';
import { isNullOrUndefined } from 'util';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Loader from 'react-loader-spinner';
import SingleGameListItemComponent from '../../../viso/gameList/singleGameElement/SingleGameElement';
import './GameListPrivate.css';

class GameListPrivate extends React.Component {

    constructor(props) {
      super(props);
      //gameListId

      this.state={
          list: [],
          title: null,
          isLoading: true,
          currGameList: {},
          addGameList: false
      }

      this.removeGame = this.removeGame.bind(this);
      this.addGame = this.addGame.bind(this);
      this.writeToDb = this.writeToDb.bind(this);
      this.singleGameListItem = this.singleGameListItem.bind(this);
      this.renderGameListFull = this.renderGameListFull.bind(this);
    }

    removeGame(gameId){
        let list = this.state.list;
        let ans = [];
        for(let i=0; i<list.length; i++){
            if(list[i].id != gameId){
                ans.push(list[i]);
            }
        }
        this.writeToDb(list,this.state.title);
    }

    addGame(game){
        let list = this.state.list;
        list.push(game);

        this.writeToDb(list,this.state.title);
    }

    async writeToDb(list, title){
        let currGameList = this.state.currGameList;
        currGameList['list'] = list;
        currGameList['title'] = title;
        await firebase.firestore().collection('publicGameList').doc(this.props.gameListId).set(currGameList);
    }

    singleGameListItem(game){
        return (
            <div className="singleGameListItemContainer">
                <SingleGameListItemComponent
                    title={game.title}
                    id={game.id}
                    isPrivate={true}
                    removeGame={this.removeGame}
                />
            </div>
        )
    }

    componentDidMount(){
        if(!isNullOrUndefined(this.props.gameListId)){
            //get gameList

            let scope = this;
            firebase.firestore().collection('publicGameList').doc(this.props.gameListId).onSnapshot(doc => {
                if(doc.exists){
                    let title = doc.data().title;
                    let list = doc.data().games;
                    let currGameList = doc.data();
    
                    scope.setState({
                        list: list,
                        title: title,
                        currGameList: currGameList
                    });
                    console.log(currGameList);
                }
                scope.setState({
                    isLoading: false
                });
            },
            error =>{
                scope.setState({
                    isLoading: false
                });
            });
        }
    }

    renderGameListFull(){
        let list = this.state.list;

        let displayList = list.map(game => {
            return this.singleGameListItem(game);
        })
        return (
            <div>
                <h2 className="gameListTitle">{this.state.title}</h2>

                <div className="gameListPrivateOptionsContainer">
                    <Button
                        className="addGameButton"
                        color="primary"
                        variant="contained"
                        onClick={() => { this.props.return()}}>
                            Back to gameLists
                    </Button>
                    {!this.state.addGameList?
                        <Button
                            className="addGameButton"
                            color="primary"
                            variant="contained"
                            onClick={() => { this.setState({addGameList: true})}}>
                                Add new game
                        </Button>
                            : 
                        <Button
                            className="addGameButton"
                            color="primary"
                            variant="contained"
                            onClick={() => { this.setState({addGameList: false})}}>
                                Close
                        </Button>    
                    }
                </div>

                {this.state.list.length > 0?
                    <div style={{marginBottom:'40px'}}>{displayList}</div>
                    :
                    null
                }                
            </div>
        );
    }

    render(){
        return (
            <div>
                {this.state.isLoading?
                    <div style={{width:'50px',margin:'auto'}}>
                        <Loader 
                        type="TailSpin"
                        color="#00BFFF"
                        height="50"	
                        width="50"              
                        /> 
                    </div>
                    :
                    this.renderGameListFull()
                }
            </div>
        );
    }

}
export default GameListPrivate;