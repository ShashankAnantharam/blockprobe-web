import React, { Component } from 'react';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import './gamifiedStatsAuth.css';

class GamifiedAuth extends React.Component {
    constructor(props) {
      super(props);
      //stats, type (graphGame), 

      this.writeToLeaderboard = this.writeToLeaderboard.bind(this);
    }

    uiConfig = {
        signInFlow: "popup",
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        callbacks:{
          signInSuccess: () => false,
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            
            //...
            }      
        }
    }

    async saveUserStats(userId){
        //Add it
         // console.log(userId);
         // console.log(this.props.stats);
        let type = this.props.type;
        let stats = JSON.parse(JSON.stringify(this.props.stats));
        let timestamp = Date.now();
        stats['ts'] = timestamp;
        stats['bpId'] = this.props.bpId;
        stats['userId'] = userId;
        stats['bpTitle'] = this.props.title;

        let entityStats = this.props.stats['entityStats'];
        let newStats = {};
        for(let entity in entityStats){
            newStats[entity] = {
                entity: entity,
                mistakes: entityStats[entity] 
            }
        }
        stats['entityStats'] = newStats;
        //console.log(stats);

        let softBlockprobe = {
            bpId: this.props.bpId,
            ts: timestamp,
            title: this.props.title
        };

        let leaderboardBlockprobe = JSON.parse(JSON.stringify(stats));
        leaderboardBlockprobe['type'] = 'mtt';

        let docStr = this.props.bpId + '_' + String(timestamp);
        if(type == 'timeline'){
            docStr = docStr + '_ts';
            stats.bpId = stats.bpId + "_ts";
            leaderboardBlockprobe['type'] = 'ftd';
        }
        await firebase.firestore().collection('Users').doc(userId)
        .collection('gameScores').doc(docStr).set(stats);
        await firebase.firestore().collection('Users').doc(userId)
        .collection('gameBlockprobes').doc(this.props.bpId).set(softBlockprobe);

        await this.writeToLeaderboard(this.props.bpId, leaderboardBlockprobe['type'],
            leaderboardBlockprobe, userId);

        //TODO Temp fix for logging out
        //if(!(this.getItemWrapper('isUserSignedIn', false)))
        await firebase.auth().signOut();
        this.props.finishSaving(userId);
    }

    async writeToLeaderboard(bpId,type,leaderboardBlockprobe, userId){
        let docStr = userId;
        let ref = firebase.firestore().collection('gameLeaderboards').doc(bpId)
        .collection(type).doc(docStr);
        let doc  = await ref.get();
        if(doc.exists){
            if(doc.data()['score'] < leaderboardBlockprobe['score']){
                //Higher score now
                await ref.set(leaderboardBlockprobe);    
            }
        }
        else{
            await ref.set(leaderboardBlockprobe);
        }
    }

    getItemWrapper(key, defaultVal){
        if(!isNullOrUndefined(localStorage.getItem(key))){
            return localStorage.getItem(key);
        }
        return defaultVal;
    }

    componentDidMount(){
        this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(user =>{
            let uId = null, providerId = null;
            if(!isNullOrUndefined(firebase.auth().currentUser) && 
            !isNullOrUndefined(firebase.auth().currentUser.providerData) &&
            firebase.auth().currentUser.providerData.length>0){
                providerId = firebase.auth().currentUser.providerData[0].providerId;
            }
            if(providerId=="phone"){
                uId = firebase.auth().currentUser.phoneNumber;
            }
            else if(providerId=='google.com'){
                uId = firebase.auth().currentUser.email;
            }
            else if(providerId=='password'){
                uId = firebase.auth().currentUser.email;
            }            
        // console.log(firebase.auth().currentUser);

            if(!!user && !isNullOrUndefined(firebase.auth().currentUser)){     
                if(!isNullOrUndefined(uId))           
                    this.saveUserStats(uId); 
            }
        });
    }

    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    render(){
        return (
            <div>
                <div className='StatsAuthTitle'>Sign in to save</div>
                <div className='StatsAuthLoginContainer'>                                       
                    <StyleFirebaseAuth
                    uiConfig={this.uiConfig}
                    firebaseAuth={firebase.auth()}                            
                    />
                </div>
            </div>
        );
    }
}
export default GamifiedAuth;