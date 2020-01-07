import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import { isNullOrUndefined } from 'util';
import UserWall from '../../user-session/userWall/UserWall';

class PublicWallComponent extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            userId: '',
            posts: []
        }

        if(!isNullOrUndefined(props.match.params.userId)){
                this.state.userId = JSON.parse(JSON.stringify(props.match.params.userId));
          }

        this.getUserWall = this.getUserWall.bind(this);
        this.buildUserWall = this.buildUserWall.bind(this);
    }


    getUserWall(){
        firebase.firestore().collection("publicWall").doc(this.state.userId).
        collection("userPosts").get().then((snapshot) => {
                this.buildUserWall(snapshot);
        });
    }
    
    buildUserWall(snapshot){
        let postList = [];
        snapshot.forEach((doc) => {
                let data =doc.data();
                for(let i=0; data && data.posts && i<data.posts.length;i++){
                    postList.push(data.posts[i]);
                }
            });   
        this.setState({
            posts: postList
        });        
    }

    componentDidMount(){
        this.getUserWall();
    }

    render(){
        return(
            <div>
                <h2 style={{textAlign: 'center'}}>{this.state.userId}</h2>
                <UserWall
                    posts = {this.state.posts}
                    isPrivate = {false}
                  />
            </div>
        );
    }
}
export default PublicWallComponent;