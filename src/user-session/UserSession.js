import React, { Component } from 'react';
import * as firebase from 'firebase';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import './UserSession.css';
import UserBlockprobesComponent from './UserBlockprobes';
import ViewBlockprobePrivateComponent from '../view/ViewBlockprobePrivate';



class UserSession extends React.Component {

    constructor(props){
        super(props);
        this.state={
            isUserSignedIn: false,
            showLogin: false,
            selectedBlockprobeId: '',
            userId: '',
            providerId: '',
            blockprobes: {}
        }
        this.getAndSetUser = this.getAndSetUser.bind(this);
        this.loggedInView = this.loggedInView.bind(this);
        this.loggedInContent = this.loggedInContent.bind(this);
        this.loggedOutView = this.loggedOutView.bind(this);
        this.clickLoginOption = this.clickLoginOption.bind(this);
        this.getBlockprobes = this.getBlockprobes.bind(this);
        this.selectBlockprobe = this.selectBlockprobe.bind(this);
        this.createBlockprobeList = this.createBlockprobeList.bind(this);
        this.addBlockprobeToList = this.addBlockprobeToList.bind(this);
        this.removeBlockprobeFromList = this.removeBlockprobeFromList.bind(this);
    }

    uiConfig = {
        signInFlow: "popup",
        signInOptions: [
          firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        callbacks:{
          signInSuccess: () => false,
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            
            //...
          }      
        }
      }

      clickLoginOption(){
          this.setState({
              showLogin: true
          });
      }

      addBlockprobeToList(doc){
        var blockprobeDic = this.state.blockprobes;
        var newBlockprobe = {
            id: doc.data().id,
            title: doc.data().title,
            summary: doc.data().summary,
            timestamp: doc.data().timestamp,
            isActive: doc.data().isActive,
            active: doc.data().active,
            permit: doc.data().permit
        };
        blockprobeDic[doc.id]=newBlockprobe;
        this.setState({
            blockprobes:blockprobeDic
        });
      }

      removeBlockprobeFromList(doc){
        var blockprobeDic = this.state.blockprobes;
        if(doc.id in blockprobeDic)
        {
            delete blockprobeDic[doc.id];
        }
        this.setState({
            blockprobes:blockprobeDic
        });
      }

      createBlockprobeList(snapshot){
          snapshot.forEach((doc) => ( this.addBlockprobeToList(doc))); 
      }

      getBlockprobes(){
        if(this.state.isUserSignedIn && (this.state.selectedBlockprobeId == '')){

            var arr= [];

                firebase.firestore().collection("Users").doc(this.state.userId)
                .collection("blockprobes").onSnapshot(
                    querySnapshot => {
                        querySnapshot.docChanges().forEach(change => {
                            if (change.type === 'added') {
                                //console.log('New block: ', change.doc.data());
                                this.addBlockprobeToList(change.doc);
                              }
                              if (change.type === 'modified') {
                                //console.log('Modified block: ', change.doc.data());
                                this.addBlockprobeToList(change.doc);
                              }
                              if (change.type === 'removed') {
                                //console.log('Removed block: ', change.doc.data());
                                this.removeBlockprobeFromList(change.doc);
                              }
                        })
                    }
                );    
            

        }
      }

      selectBlockprobe(blockprobeId){
          this.setState({
              selectedBlockprobeId: blockprobeId
          })

      }

      getAndSetUser(){
        if(this.state.isUserSignedIn){
            var uId = this.state.userId;
            firebase.firestore().collection("Users").
                doc(this.state.userId).get().then(function(doc) {
                    if (!doc.exists) {
                        
                        var userData = {
                            ID: uId
                        };
                        firebase.firestore().collection("Users").
                                doc(uId).set(userData);
                    }
                    else{
                        // console.log(doc.data());
                    }
                });
        }
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
                userId: uId
              });
           // console.log(firebase.auth().currentUser);

            if(!!user && !isNullOrUndefined(firebase.auth().currentUser)){
                
                this.getAndSetUser();
                this.getBlockprobes();
            }
          })
      }


      loggedInContent(){
         // console.log(this.state.blockprobes);
         if(this.state.userId!=''){
            return (
                <div className="blockprobe-list-container">
                    {this.state.blockprobes?
                <UserBlockprobesComponent 
                blockprobes={this.state.blockprobes}
                selectedBlockprobe = {this.state.selectedBlockprobeId}
                selectBlockprobe = {this.selectBlockprobe}
                uId={this.state.userId}
                />:
                null
                }
                </div>
            );
        }

        return null;
      }


      loggedInView(){
          return (
            <div>
                <div style={{display: 'block'}}>
                <header className="toolbar">
                    <nav className="toolbar__navigation">
                        <div></div>
                        <div className="toolbar__logo"><a href="/">Blockprobe</a></div>
                        <div className="spacer" />
                        <div className="toolbar__navigation-items">
                            <ul>
                                <li><a href="/">Home</a></li>
                                <li style={{color:'white'}}>{this.state.userId}</li>
                                <li><a onClick={() => firebase.auth().signOut()}>Logout</a></li>
                            </ul>
                        </div>
                    </nav>
                </header>
                </div>
                <div>
                <div className="logged-in-content">
                    {this.state.selectedBlockprobeId == ''?
                        this.loggedInContent()
                        :
                        <div className="blockprobe-list-container">
                        <ViewBlockprobePrivateComponent 
                        bId={this.state.selectedBlockprobeId} 
                        uId={this.state.userId}
                        permit={this.state.blockprobes[this.state.selectedBlockprobeId].permit}/>
                        </div>    
                    }
                </div>
                </div>
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