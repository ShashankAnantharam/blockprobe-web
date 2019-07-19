import React, { Component } from 'react';
import * as firebase from 'firebase';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import './UserSession.css';
import UserBlockprobesComponent from './UserBlockprobes';
import ViewBlockprobePrivateComponent from '../view/ViewBlockprobePrivate';
import Loader from 'react-loader-spinner';
import GoogleFontLoader from 'react-google-font-loader';
import Img from 'react-image';
import JournalistLogo from "./icons/journalist.png";
import PoliceLogo from "./icons/police.png";
import PoliticianLogo from "./icons/political.png";
import Joyride from 'react-joyride';
import {Container, Row, Col} from 'react-bootstrap';
import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    PinterestShareButton,
    VKShareButton,
    OKShareButton,
    RedditShareButton,
    TumblrShareButton,
    LivejournalShareButton,
    MailruShareButton,
    ViberShareButton,
    WorkplaceShareButton,
    LineShareButton,
    PocketShareButton,
    InstapaperShareButton,
    EmailShareButton,
  } from 'react-share';
  import {
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    WhatsappIcon,
    LinkedinIcon,
    PinterestIcon,
    VKIcon,
    OKIcon,
    RedditIcon,
    TumblrIcon,
    LivejournalIcon,
    MailruIcon,
    ViberIcon,
    WorkplaceIcon,
    LineIcon,
    PocketIcon,
    InstapaperIcon,
    EmailIcon,
  } from 'react-share';

class UserSession extends React.Component {

    constructor(props){
        super(props);
        this.state={
            isUserSignedIn: this.getItemWrapper('isUserSignedIn',false), //false,
            showLogin: true,
            selectedBlockprobeId: '',
            userId: this.getItemWrapper('userId',''),//'',
            providerId: this.getItemWrapper('providerId',''),//'',
            blockprobes: {},
            areBlockprobesLoading: false,
            tooltip:{
                buildStory: false
            },
            landingPage:{
                journalist:{
                    logo: JournalistLogo,
                    text: 'As a journalist, you can build your story using blockprobe, visualise your story and better engage your audience with your story.'
                },
                police:{
                    logo: PoliceLogo,
                    text: 'As a law enforcement agent, detective or police officer, you can build your investigation using blockprobe, visualise your investigation and better engage the general public with your investigation.'
                },
                politician:{
                    logo: PoliticianLogo,
                    text: 'As a lawmaker, you can visualise your proposals and laws using blockprobe, and better engage your constituents with your proposals.'
                }
            }    
        }

        if(this.state.userId == ''){
            this.state.isUserSignedIn = false;
        }
        
        this.getItemWrapper = this.getItemWrapper.bind(this);
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
        this.cueCardView = this.cueCardView.bind(this);
    }

    getItemWrapper(key, defaultVal){
        if(!isNullOrUndefined(localStorage.getItem(key))){
            return localStorage.getItem(key);
        }
        return defaultVal;
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
            this.setState({areBlockprobesLoading: true});

            var arr= [];

                firebase.firestore().collection("Users").doc(this.state.userId)
                .collection("blockprobes").onSnapshot(
                    querySnapshot => {
                        this.setState({
                            areBlockprobesLoading: false
                        });
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

      selectBlockprobe(blockprobeId, buildStory){
          var tooltip = this.state.tooltip;
          tooltip.buildStory = buildStory;
          this.setState({
              selectedBlockprobeId: blockprobeId,
              tooltip: tooltip
          })

      }

      getAndSetUser(){
        if(this.state.isUserSignedIn){
            var uId = this.state.userId;
            var scope = this;
            firebase.firestore().collection("Users").
                doc(this.state.userId).get().then(function(doc) {
                    if (!doc.exists) {
                        
                        var userData = {
                            ID: uId
                        };
                        firebase.firestore().collection("Users").
                                doc(uId).set(userData);
                        var tooltip = scope.state.tooltip;
                        tooltip.buildStory = true;
                        scope.setState({tooltip: tooltip});
                    }
                    else{
                        // console.log(doc.data());
                       /* var tooltip = scope.state.tooltip;
                        tooltip.buildStory = true;
                        console.log(tooltip);
                        scope.setState({tooltip: tooltip});
                        */
                    }
                });
        }
      }

      logout(){
        firebase.auth().signOut();
        this.setState({
            isUserSignedIn: false
        });
        localStorage.setItem('isUserSignedIn',false);
        localStorage.removeItem('userId');
        localStorage.removeItem('providerId');
      }

      componentDidMount(){

        if(this.state.isUserSignedIn){
            this.getAndSetUser();
            this.getBlockprobes();
        }

            firebase.auth().onAuthStateChanged(user =>{

                var oldState = this.state.isUserSignedIn;
                this.setState({
                    isUserSignedIn: !!user
                });
                localStorage.setItem('isUserSignedIn',!!user);

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
                localStorage.setItem('providerId',providerId);
                localStorage.setItem('userId',uId);
            // console.log(firebase.auth().currentUser);

                if(!!user && !isNullOrUndefined(firebase.auth().currentUser) && !oldState){
                    
                    this.getAndSetUser();
                    this.getBlockprobes();
                }
            });

      }


      loggedInContent(){
         // console.log(this.state.blockprobes);
         if(this.state.userId!=''){
            return (
                <div className="blockprobe-list-container">
                    {this.state.blockprobes?
                    <div>
                        {this.state.areBlockprobesLoading?
                                <div style={{margin:'auto',width:'50px'}}>
                                    <Loader 
                                    type="TailSpin"
                                    color="#00BFFF"
                                    height="50"	
                                    width="50"
                                    /> 
                                </div>
                                :
                                <UserBlockprobesComponent 
                                blockprobes={this.state.blockprobes}
                                selectedBlockprobe = {this.state.selectedBlockprobeId}
                                selectBlockprobe = {this.selectBlockprobe}
                                uId={this.state.userId}
                                buildStorytooltip={this.state.tooltip.buildStory}
                                />
                        }
                    </div>
                        : 
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
                                <li className="userName" style={{color:'white'}}>{this.state.userId}</li>
                                <li><a onClick={() => this.logout()}>Logout</a></li>
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
                            permit={this.state.blockprobes[this.state.selectedBlockprobeId].permit}
                            buildStorytooltip={this.state.tooltip.buildStory}/>
                        </div>    
                    }
                </div>
                </div>
            </div>
          );
      }

      cueCardView(icon, content){
        var iconList = [icon];
          return(
                    <div className="cue-card-container" style={{border:'1px solid lightgrey', width:'100%', display:'flex'}}>
                        <div style={{minWidth:'30%', maxWidth:'30%', padding:'10px 0 10px 0', textAlign:'center'}}>
                            
                            <div>
                                <Img src={iconList}
                                    style={{width:'50%'}}></Img>
                            </div>                                
                        </div>
                        <div style={{padding:'10px 10px 10px 10px'}}>
                            <div className="cue-card-text" style={{fontFamily: 'Lora, bold-italic', textAlign:'justify'}}>
                                    {content}
                            </div>
                        </div>
                    </div>              
          )
      }

      loggedOutView(){
          var url = 'https://blockprobe-32644.firebaseapp.com/';
          return (
              <div>                
                <main style={{paddingTop:'10px',minHeight:'100vh'}} className="body-color-backup">
                    <div style={{display:'flex'}}>
                        <GoogleFontLoader
                            fonts={[
                                {
                                font: 'Roboto',
                                weights: [400, '400i'],
                                },
                                {
                                font: 'Roboto Mono',
                                weights: [400, 700],
                                },
                                {
                                    font: 'Bungee Inline',
                                    weights: [400]
                                },
                                {
                                    font:'Lora',
                                    weights: [400]
                                }
                            ]}
                            subsets={['cyrillic-ext', 'greek']}
                            />                        

                        <div className="landing-view-container">                       
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'center', fontSize: '26px', fontWeight:'bold', marginTop:'10px'}}><span>Visually engage your audience and yourself with your work.</span></div>
                                <div style={{marginTop:'16px'}}>
                                    {this.cueCardView(this.state.landingPage.journalist.logo, this.state.landingPage.journalist.text)}
                                    {this.cueCardView(this.state.landingPage.police.logo, this.state.landingPage.police.text)}
                                    {this.cueCardView(this.state.landingPage.politician.logo, this.state.landingPage.politician.text)}
                                </div>                        
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'justify', marginTop:'20px'}}>
                                    For example, a story on Nirav Modi has been built using the tool. You can view it <a href='https://blockprobe-32644.firebaseapp.com/view/6790279f4c45b5c9ff7e4f90f2b398eca2a3eb296bcc82604a3def599865b782' target='blank'>here</a>.
                                </div>
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'justify', marginTop:'20px'}}>
                                    To use blockprobe, login with your mobile and get started!
                                </div>
                                <div style={{marginTop:'3%'}}>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/home" target="blank">About</a>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/privacy-policy" target="blank">Privacy Policy</a>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/terms-of-service" target="blank">Terms of Service</a>
                                </div>
                                
                            </div>
                            <div>                        
                            {this.state.showLogin?
                            <div className="user-session-login-container user-session-shadow-view">
                                    <StyleFirebaseAuth
                                    uiConfig={this.uiConfig}
                                    firebaseAuth={firebase.auth()}                            
                                    />
                                    <div className='mobile-landing-page'>
                                        <div style={{marginTop:'16px'}}>
                                            {this.cueCardView(this.state.landingPage.journalist.logo, this.state.landingPage.journalist.text)}
                                            {this.cueCardView(this.state.landingPage.police.logo, this.state.landingPage.police.text)}
                                            {this.cueCardView(this.state.landingPage.politician.logo, this.state.landingPage.politician.text)}
                                        </div> 
                                    </div>
                                </div> : null 
                            }
                            </div>
                        </div>
                        
                </main>
              </div>
          );
      }
      /*
      <div className='shareContainer'>
                                    <div className='shareIcons'>
                                        <FacebookShareButton                        
                                            children={<FacebookIcon round={true}/>} 
                                            url={url} 
                                            hashtag = '#blockprobe'/>
                                    </div>
                                    <div className='shareIcons'>
                                        <WhatsappShareButton
                                            children={<WhatsappIcon round={true}/>} 
                                            url={url} 
                                        />
                                    </div>
                                </div>
                                */
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