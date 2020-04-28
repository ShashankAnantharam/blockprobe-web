import React, { Component } from 'react';
import * as firebase from 'firebase';
import SingleGameListItemComponent from './singleGameElement/SingleGameElement';
import './GameListComponent.css';
import { isNullOrUndefined } from 'util';

class GameListComponent extends React.Component {

    constructor(props){
      super(props);

      this.state = {
          gameListId: this.props.match.params.gameListId,
          list: [],
          title: null
      }

      this.singleGameListItem = this.singleGameListItem.bind(this);
    }

    async componentDidMount(){
        if(!isNullOrUndefined(this.state.gameListId)){
            //get gameList

            let docs = await firebase.firestore().collection('publicGameList').doc(this.state.gameListId).get();
            if(docs.exists){
                let title = docs.data().title;
                let list = docs.data().games;

                this.setState({
                    list: list,
                    title: title
                });
                console.log(list, title);
            }
        }
    }

    singleGameListItem(game){
        return (
            <div className="singleGameListItemContainer">
                <SingleGameListItemComponent
                    title={game.title}
                    id={game.id}
                />
            </div>
        )
    }

    render(){
        let list = this.state.list;

        let displayList = list.map(game => {
            return this.singleGameListItem(game);
        })
        return (
            <div>
                <h3 className="gameListTitle">{this.state.title}</h3>
                {displayList}
            </div>
        );
    }
}
export default GameListComponent;