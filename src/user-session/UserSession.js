import React, { Component } from 'react';
import * as firebase from 'firebase';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';


class UserSession extends React.Component {

    constructor(props){
        super(props);
        this.state={
            isUserSignedIn: false,
            userId: '',
            providerId: ''
        }
    }

    uiConfig = {
        signInFlow: "popup",
        signInOptions: [
          firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        callbacks:{
          signInSuccess: () => false,
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            
            console.log("Here");
            //...
          }      
        }
      }

      componentDidMount(){
        firebase.auth().onAuthStateChanged(user =>{

            this.setState({
                isUserSignedIn: !!user
            });
            
            var providerId = '';
            var uId = '';
            
            if(isNullOrUndefined(firebase.auth().currentUser) && 
            isNullOrUndefined(firebase.auth().currentUser.providerData) &&
            firebase.auth().currentUser.providerData.length>0){
                providerId = firebase.auth().currentUser.providerData[0].providerId;
            }
            if(providerId=="phone"){
                uId = firebase.auth().currentUser.phoneNumber;
            }

            this.setState({
                providerId: providerId,
                userId: uId,
              });
            console.log(firebase.auth().currentUser);
          })
      }
    render(){
        return (
            <div>
                {this.state.isUserSignedIn?
                    <div>
                        <button onClick={() => firebase.auth().signOut()}>
                        Log Out
                        </button>
                        <h1>{firebase.auth().currentUser.phoneNumber}</h1>
                        <span>{firebase.auth().currentUser.providerData[0].providerId}</span>
                    </div>
                        :
                    <div>
                            <StyleFirebaseAuth
                            uiConfig={this.uiConfig}
                            firebaseAuth={firebase.auth()}
                            />
      
                    </div>
                }
            </div>
        );
    }


}
export default UserSession;