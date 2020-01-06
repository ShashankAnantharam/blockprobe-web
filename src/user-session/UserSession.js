import React, { Component } from 'react';
import * as firebase from 'firebase';
import StyleFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { isNullOrUndefined } from 'util';
import * as Utils from '../common/utilSvc';
import * as DbUtils from "../common/dbSvc";
import './UserSession.css';
import UserBlockprobesComponent from './UserBlockprobes';
import ViewBlockprobePrivateComponent from '../view/ViewBlockprobePrivate';
import Loader from 'react-loader-spinner';
import GoogleFontLoader from 'react-google-font-loader';
import Img from 'react-image';
import JournalistLogo from "./icons/journalist.png";
import PoliceLogo from "./icons/police.png";
import PoliticianLogo from "./icons/political.png";
import TeacherLogo from "./icons/teacher.png";
import MainLogo from "./icons/logo.png";
import UserWall from "./userWall/UserWall";
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
            isWallOpened: false,
            selectedBlockprobeId: '',
            userId: this.getItemWrapper('userId',''),//'',
            providerId: this.getItemWrapper('providerId',''),//'',
            blockprobes: {},
            posts: [],
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
                },
                teacher:{
                    logo: TeacherLogo,
                    text: 'As a tutor, you can visualise your chapters in history, science and english using blockprobe, and better engage your students with these subjects.'
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
        this.getBlockprobesShort = this.getBlockprobesShort.bind(this);
        this.getNewBlockprobesTillThisSession = this.getNewBlockprobesTillThisSession.bind(this);
        this.listenToBlockprobesDuringSession = this.listenToBlockprobesDuringSession.bind(this);
        this.updateShortenedBlockprobesListToDb = this.updateShortenedBlockprobesListToDb.bind(this);
        this.selectBlockprobe = this.selectBlockprobe.bind(this);
        this.createBlockprobeList = this.createBlockprobeList.bind(this);
        this.addBlockprobeToList = this.addBlockprobeToList.bind(this);
        this.removeBlockprobeFromList = this.removeBlockprobeFromList.bind(this);
        this.cueCardView = this.cueCardView.bind(this);
        this.getLatestTimestamp = this.getLatestTimestamp.bind(this);
        this.returnToViewBlockprobes = this.returnToViewBlockprobes.bind(this);
        this.modifyBlockprobe = this.modifyBlockprobe.bind(this);
        this.getUserWall = this.getUserWall.bind(this);
        this.buildUserWall = this.buildUserWall.bind(this);
        this.viewWall = this.viewWall.bind(this);
        this.updatePosts = this.updatePosts.bind(this);
        this.renderGeneralLoggedInView = this.renderGeneralLoggedInView.bind(this);
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

      clickLoginOption(){
          this.setState({
              showLogin: true
          });
      }

      returnToViewBlockprobes(){
          this.setState({
              selectedBlockprobeId: '',
              isWallOpened: false
          });
      }

      viewWall(){
          this.setState({
              isWallOpened: true,
              selectedBlockprobeId: ''
          });
      }

      addBlockprobeToList(doc){
        var blockprobeDic = this.state.blockprobes;
        var newBlockprobe = {
            id: doc.id,
            title: doc.title,
            summary: doc.summary,
            timestamp: doc.timestamp,
            isActive: doc.isActive,
            active: doc.active,
            permit: doc.permit
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
                this.getBlockprobesShort();
        }
      }

    getLatestTimestamp(snapshot){
        let timestampLatest = 0;
        snapshot.forEach((doc) => { 
            let data = doc.data().blockprobe;
            for(let i=0; data && i<data.length; i++){
                if(data[i].timestamp)
                    timestampLatest = Math.max(timestampLatest, data[i].timestamp);
            }
        }); 
        return timestampLatest;
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

      updateShortenedBlockprobesListToDb(){
        let allBlockprobes = Utils.getShortenedListOfBlockprobes(this.state.blockprobes);
        if(allBlockprobes &&  allBlockprobes.length>0){
            firebase.firestore().collection("Users").doc(this.state.userId)
                    .collection("shortBlockprobes").get().then((snapshot) => {
                    
                snapshot.forEach((doc) => {
                        var ref = firebase.firestore().collection("Users").doc(this.state.userId)
                        .collection("shortBlockprobes").doc(doc.id).delete();
                    });
                    
                for(var i=0; i<allBlockprobes.length; i++){
                    firebase.firestore().collection("Users").doc(this.state.userId)
                    .collection("shortBlockprobes").doc(String(i)).set(allBlockprobes[i]);        
                }       
                });
        }
      }

      listenToBlockprobesDuringSession(latestTimestamp){
            firebase.firestore().collection("Users").doc(this.state.userId)
            .collection("blockprobes").where("timestamp", ">", latestTimestamp).orderBy("timestamp").onSnapshot(
                querySnapshot => {
                    querySnapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            let data = change.doc.data();
                            if(data){
                                this.addBlockprobeToList(data);
                            }
                            //console.log('New block: ', change.doc.data().timestamp);
                        }
                        else if (change.type == 'modified'){
                            let data = change.doc.data();
                            if(data){
                                this.addBlockprobeToList(data);
                            }
                        }
                    }); 
                });
      }

     getNewBlockprobesTillThisSession(latestTimestamp){

        let currTime = Date.now();
        //Get short blockprobes
        firebase.firestore().collection("Users").doc(this.state.userId)
        .collection("blockprobes").where("timestamp", ">", latestTimestamp).where("timestamp", "<=", currTime).
        orderBy("timestamp").get().then((snapshot) => {
                                
            snapshot.forEach((doc) => {
                let data = doc.data();
                if(data){
                    this.addBlockprobeToList(data);
                }
            });

            this.updateShortenedBlockprobesListToDb();
            this.setState({
                areBlockprobesLoading: false
            });
            this.listenToBlockprobesDuringSession(currTime);
        });          
    }

      getBlockprobesShort(){         
        //Get short blockprobes
        firebase.firestore().collection("Users").doc(this.state.userId)
                                    .collection("shortBlockprobes").get().then((snapshot) => {

                                let latestTs = this.getLatestTimestamp(snapshot);                                 
                                let allBlockprobes = [];
                                snapshot.forEach((doc) => {
                                        let data = doc.data();
                                        if(data.blockprobe){
                                            for(let i=0; i<data.blockprobe.length; i++){
                                                allBlockprobes.push(data.blockprobe[i]);
                                                this.addBlockprobeToList(data.blockprobe[i]);
                                            }
                                        }
                                    });
                                this.getNewBlockprobesTillThisSession(latestTs);                                
                                });                                                      
      }

      selectBlockprobe(blockprobeId, buildStory){
          var tooltip = this.state.tooltip;
          tooltip.buildStory = buildStory;
          this.setState({
              selectedBlockprobeId: blockprobeId,
              isWallOpened: false,
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

                        //Toggle tooltip here for new logins
                        tooltip.buildStory = false; //true;
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

      async logout(){
        await firebase.auth().signOut();
        await localStorage.setItem('isUserSignedIn',false);
        await localStorage.removeItem('userId');
        await localStorage.removeItem('providerId');
        await this.setState({
            isUserSignedIn: false,
            isWallOpened: false
        });        
        window.location.href = "/";
      }

      componentDidMount(){

        if(this.state.isUserSignedIn){
            this.getAndSetUser();
            this.getBlockprobes();
            this.getUserWall();
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
                else if(providerId=='google.com'){
                    uId = firebase.auth().currentUser.email;
                }
                else if(providerId=='password'){
                    uId = firebase.auth().currentUser.email;
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
                    this.getUserWall();
                }
            });

      }

      updatePosts(posts){
         DbUtils.writePostListToDb(posts, this.state.userId);
          this.setState({
              posts: posts
          });
      }

      async modifyBlockprobe(type, blockprobe){
          if(type=='update'){
             // console.log('Users/'+ this.state.userId +'/blockprobes/'+blockprobe.id);
             // console.log(blockprobe);
                await firebase.firestore().collection('Users').doc(this.state.userId)
                    .collection('blockprobes').doc(blockprobe.id).set(blockprobe);
          }
      }

      renderGeneralLoggedInView(){
          if(this.state.isWallOpened){
              return (
                  <UserWall
                    posts = {this.state.posts}
                  />
              );
          }

          return(
            <UserBlockprobesComponent 
                blockprobes={this.state.blockprobes}
                selectedBlockprobe = {this.state.selectedBlockprobeId}
                selectBlockprobe = {this.selectBlockprobe}
                uId={this.state.userId}
                buildStorytooltip={this.state.tooltip.buildStory}
                />
          );
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
                                <div>
                                    {this.renderGeneralLoggedInView()}
                                </div>
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
                                <li><a onClick={() => this.returnToViewBlockprobes()}>Home</a></li> 
                                <li><a onClick={() => this.viewWall()}>Wall</a></li>
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
                            buildStorytooltip={this.state.tooltip.buildStory}
                            prevTitle={this.state.blockprobes[this.state.selectedBlockprobeId].title}
                            currBlockprobe={this.state.blockprobes[this.state.selectedBlockprobeId]}
                            modifyBlockprobe={this.modifyBlockprobe}
                            posts={this.state.posts}
                            updatePosts={this.updatePosts}/>
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
          var mainLogoList = [MainLogo]
          return (
              <div>                
                <main style={{paddingTop:'10px',minHeight:'100vh'}} className="body-color-backup">
                <div style={{marginTop:'10px', textAlign:'center'}}>
                                    <Img src={mainLogoList}
                                    style={{width:'70%'}}></Img>
                                </div>
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
                                
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'center', fontSize: '26px', fontWeight:'bold'}}><span>Visually engage your audience and yourself with your work.</span></div>
                                <div style={{marginTop:'16px'}}>
                                    {this.cueCardView(this.state.landingPage.journalist.logo, this.state.landingPage.journalist.text)}
                                    {this.cueCardView(this.state.landingPage.politician.logo, this.state.landingPage.politician.text)}
                                    {this.cueCardView(this.state.landingPage.teacher.logo, this.state.landingPage.teacher.text)}
                                </div>                        
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'justify', marginTop:'20px'}}>
                                    For example, a story on Nirav Modi has been built using the tool. You can view it <a href='https://blprobe.com/view/6790279f4c45b5c9ff7e4f90f2b398eca2a3eb296bcc82604a3def599865b782' target='blank'>here</a>.
                                </div>
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'justify', marginTop:'20px'}}>
                                    A brief history of Otto von Bismarck has been built using the tool. You can view it <a href='https://blprobe.com/view/09f190bf8d3e2f71ea2463c8ce98e68639080fd3ce3d3021fb04d17e62215ead' target='blank'>here</a>.
                                </div>
                                <div style={{fontFamily: 'Lora, bold-italic', textAlign:'justify', marginTop:'20px'}}>
                                    To use blockprobe, login with your mobile and get started!
                                </div>
                                <div style={{marginTop:'3%'}}>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/quickstart" target="blank">Quickstart</a>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/home" target="blank">About</a>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/privacy-policy" target="blank">Privacy Policy</a>
                                    <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/terms-of-service" target="blank">Terms of Service</a>                                    
                                </div>                                
                            </div>
                            <div>                        
                            {this.state.showLogin?
                            <div className="user-session-login-container">
                                    <div className='user-session-shadow-view'>
                                        <StyleFirebaseAuth
                                        uiConfig={this.uiConfig}
                                        firebaseAuth={firebase.auth()}                            
                                        />
                                    </div>
                                    <div className='mobile-landing-page'>
                                        <div style={{marginTop:'16px'}}>
                                            {this.cueCardView(this.state.landingPage.journalist.logo, this.state.landingPage.journalist.text)}
                                            {this.cueCardView(this.state.landingPage.politician.logo, this.state.landingPage.politician.text)}
                                            {this.cueCardView(this.state.landingPage.teacher.logo, this.state.landingPage.teacher.text)}
                                        </div> 
                                        <div style={{marginTop:'3%'}}>
                                            <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/quickstart" target="blank">Quickstart</a>
                                            <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/home" target="blank">About</a>
                                            <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/privacy-policy" target="blank">Privacy Policy</a>
                                            <a style={{fontFamily: 'Roboto, sans-serif', margin:'3%'}} href="https://sites.google.com/view/blockprobe/terms-of-service" target="blank">Terms of Service</a>
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