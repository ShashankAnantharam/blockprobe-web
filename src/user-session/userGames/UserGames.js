import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import * as firebase from 'firebase';
import './UserGames.css';
import { isNullOrUndefined } from 'util';
import { Button } from '@material-ui/core';

class UserGames extends React.Component {
    constructor(props) {
      super(props);
      //userId (has to be there)
      
      this.state = {
          selectedUserGame: null,
          userGameLists: {},
          createGameList: false
      }

      this.selectGame = this.selectGame.bind(this);
      this.addGameList = this.addGameList.bind(this);
      this.removeGameList = this.removeGameList.bind(this);
      this.getList = this.getList.bind(this);
      this.toggleCreateGameList = this.toggleCreateGameList.bind(this);
      this.renderGameList = this.renderGameList.bind(this);
    }

    selectGame(id){
        this.setState({
            selectedUserGame: id
        });
    }

    renderSingleUserGame(game){
        let scope = this;
        return (
            <ListItem button 
                selected={scope.state.selectedUserGame == game.id}
                onClick={() => { scope.selectGame(game.id)}}
                style={{width:'100%'}}
                >
                <ListItemText primary={game.title}/>
            </ListItem>
        );
    }

    addGameList(game){
        if(!isNullOrUndefined(game)){
            let userGameLists = this.state.userGameLists;
            userGameLists[game.id] = game;
            this.setState({
                userGameLists: userGameLists
            });
        }
    }

    removeGameList(game){
        if(!isNullOrUndefined(game)){
            let userGameLists = this.state.userGameLists;
            delete userGameLists[game.id];
            this.setState({
                userGameLists: userGameLists
            });
        }
    }

    componentDidMount(){
        firebase.firestore().collection('Users').doc(this.props.userId)
        .collection('gameLists').orderBy("timestamp").onSnapshot(
            querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        let data = change.doc.data();
                        if(data){
                            this.addGameList(data,true);
                        }
                        //console.log('New block: ', change.doc.data().timestamp);
                    }
                    else if (change.type == 'removed'){
                        let data = change.doc.data();
                        if(data){
                            this.removeGameList(data,false);
                        }
                    }
                }); 
            });
    }

    getList(gameMap){
        let list = [];
        for(let key in gameMap){
            list.push(gameMap[key]);
        }
        return list;
    }

    toggleCreateGameList(){
        this.setState({
            createGameList: !this.state.createGameList
        });
    }

    renderGameList(){
        let scope = this;
        let userGamesTempList = this.getList(this.state.userGameLists);
        userGamesTempList.sort(function(a, b){if(a.title.toLowerCase()>b.title.toLowerCase()){return 1} return -1;});
        let userGamesRender = userGamesTempList.map((game) => {
            return scope.renderSingleUserGame(game);
        });

        return (
            <div className="gameListsViewContainer">
            <h2 style={{textAlign:'center'}}>My game lists</h2>
                <div className="createGameListOptions">
                    <Button 
                    className="createGameListButton"
                    color="primary"
                    variant="contained"
                    onClick={this.toggleCreateGameList}>
                        {
                            !this.state.createGameList?
                            <div>Create gamelist</div>
                            :
                            <div>Close</div>
                        }
                    </Button>
                </div>
                <div>
                    <List>
                        {userGamesRender}
                    </List>
                </div>
            </div>
        )
    }

    render(){
        
        return (
            <div>
                {
                    isNullOrUndefined(this.state.selectedUserGame)?
                    <div>
                        {this.renderGameList()}
                    </div>
                    :
                    <div>
                        SINGLE GAMELIST
                    </div>
                }
            </div>
        )
    }
}
export default UserGames;