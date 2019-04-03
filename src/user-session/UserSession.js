import React, { Component } from 'react';
import * as firebase from 'firebase';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import './UserSession.css';

class UserSession extends React.Component {

    constructor(props){
        super(props);
        this.state={
            isUserSignedIn: false,
            showLogin: false,
            userId: '',
            providerId: ''
        }
        this.loggedInView = this.loggedInView.bind(this);
        this.loggedOutView = this.loggedOutView.bind(this);
        this.clickLoginOption = this.clickLoginOption.bind(this);
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

      clickLoginOption(){
          this.setState({
              showLogin: true
          });
      }

      componentDidMount(){
        firebase.auth().onAuthStateChanged(user =>{

            this.setState({
                isUserSignedIn: !!user
            });

            var providerId = '';
            var uId = '';
            
            if(!isNullOrUndefined(firebase.auth().currentUser) && 
            !isNullOrUndefined(firebase.auth().currentUser.providerData) &&
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



      loggedInView(){
          return (
            <div>
                <header className="toolbar">
                    <nav className="toolbar__navigation">
                        <div></div>
                        <div className="toolbar__logo"><a href="/">Blockprobe</a></div>
                        <div className="spacer" />
                        <div className="toolbar__navigation-items">
                            <ul>
                                <li><a href="/">{this.state.userId}</a></li>
                                <li><a onClick={() => firebase.auth().signOut()}>Logout</a></li>
                            </ul>
                        </div>
                    </nav>
                </header>
                <main style={{marginTop:'80px'}}>
                        Content
                </main>
            </div>
          );
      }

      loggedOutView(){
          return (
              <div>
                <header className="toolbar">
                    <nav className="toolbar__navigation">
                        <div></div>
                        <div className="toolbar__logo"><a href="/">Blockprobe</a></div>
                        <div className="spacer" />
                        <div className="toolbar__navigation-items">
                            <ul>
                                <li><a onClick={() => this.clickLoginOption()}>Login</a></li>
                            </ul>
                        </div>
                    </nav>                 
                </header>
                <main style={{marginTop:'80px'}}>
                        {this.state.showLogin?
                            <StyleFirebaseAuth
                            uiConfig={this.uiConfig}
                            firebaseAuth={firebase.auth()}
                            /> : null 
                        }
                </main>
              </div>
          );
      }
    render(){
        return (
            <div>
                {this.state.isUserSignedIn?
                    this.loggedInView()
                        :
                    this.loggedOutView()
                }
            </div>
        );
    }


}
export default UserSession;