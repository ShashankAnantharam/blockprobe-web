import React, { Component } from 'react';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import './gamifiedStatsAuth.css';

class GamifiedAuth extends React.Component {
    constructor(props) {
      super(props);
      //stats, type (graphGame), 

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
        let stats = JSON.parse(JSON.stringify(this.props.stats));
        let timestamp = Date.now();
        stats['ts'] = timestamp;
        stats['bpId'] = this.props.bpId;
        stats['userId'] = userId;
        let docStr = this.props.bpId + '_' + String(timestamp);
        await firebase.firestore().collection('Users').doc(userId)
        .collection('gameScores').doc(docStr).set(stats);
        await firebase.auth().signOut();
        this.props.finishSaving(userId);
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