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

    addUserStatsToDb(userId){
        //Add it
        console.log(userId);
        console.log(this.props.stats);
        this.props.finishSaving();
    }

    componentDidMount(){
        firebase.auth().onAuthStateChanged(user =>{
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
                    this.addUserStatsToDb(uId);
            }
        });
    }

    render(){
        return (
            <div>
                <div className='StatsAuthTitle'>Save results</div>
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