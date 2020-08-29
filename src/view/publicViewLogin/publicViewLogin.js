import React, { Component } from 'react';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import './publicViewLogin.css';

class PublicViewLogin extends React.Component {
    constructor(props) {
      super(props);
      //stats, type (graphGame), 

    }

    uiConfig = {
        signInFlow: "popup",
        credentialHelper: 'none',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        callbacks:{
          signInSuccess: () => false,
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            
            //...
            }      
        }
    }

    async finishLogin(userId){
        this.props.postLoginSuccess(userId);
    }

    async componentDidMount(){
        await firebase.auth().signOut();
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
                    this.finishLogin(uId); 
            }
        });
    }

    componentWillUnmount() {
        this.unregisterAuthObserver();
    }

    render(){
        return (
            <div>
                <div className='ShareAuthTitle'>Sign in to view</div>
                <div className="ShareAuthBodyContainer">
                    <div className='ShareAuthLoginContainer'>                                       
                        <StyleFirebaseAuth
                        uiConfig={this.uiConfig}
                        firebaseAuth={firebase.auth()}                            
                        />
                    </div>
                </div>                
            </div>
        );
    }
}
export default PublicViewLogin;