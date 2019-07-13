import React, { Component } from 'react';
import './ShareBlockprobe.css';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Loader from 'react-loader-spinner';
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
import { timingSafeEqual } from 'crypto';
import Info from '@material-ui/icons/Info';
import Joyride,{ ACTIONS, EVENTS, STATUS } from 'react-joyride';


class ShareBlockprobeComponent extends React.Component {

    constructor(props){
      super(props);
      this.state = {
          urlPrefix: 'https://blockprobe-32644.firebaseapp.com/view/',
          blocksUploaded: false,
          adhocTooltip:{
            publicLink:{
                flag: false,
                text: [
                    {
                        title: 'Link to share with public',
                        target: '.share-url',
                        content: 'Share your dashboard with the general public using this link so that they can also engage with your story.',
                        disableBeacon: true
                    }
                ]
            },
            socialMedia:{
                flag: false,
                text: [
                    {
                        title: 'Share link on social media',
                        target: '.tooltipSocialMedia',
                        content: 'You can directly open social media (Facebook and Whatsapp) and share your dashboard\'s public link.',
                        disableBeacon: true
                    }
                ]
            }
        }
      }

      this.renderShareScreen = this.renderShareScreen.bind(this);
      this.showLocalTooltip = this.showLocalTooltip.bind(this);
      this.handleAdhocTooltipJoyrideCallback = this.handleAdhocTooltipJoyrideCallback.bind(this);
    }

    showLocalTooltip(type){
        var adhocTooltip = this.state.adhocTooltip;
       if(type=='publicLink'){
           adhocTooltip.publicLink.flag = true;
       }
       else if(type=='socialMedia'){
           adhocTooltip.socialMedia.flag = true;
       }
       this.setState({adhocTooltip: adhocTooltip});
    }

    handleAdhocTooltipJoyrideCallback(data, tooltipType){
       const {action,index,status,type} = data;
       if([STATUS.FINISHED, STATUS.SKIPPED].includes(status)){
           var adhocTooltip = this.state.adhocTooltip;
           if(tooltipType=='publicLink'){
               adhocTooltip.publicLink.flag = false;
           }
           else if(tooltipType=='socialMedia'){
               adhocTooltip.socialMedia.flag = false;
           }
           this.setState({adhocTooltip: adhocTooltip});
       }
   }

    renderShareScreen(){
        let url = this.state.urlPrefix + this.props.bpId;
        return (
            <div>
                <div className='share-section-heading'>
                    Public Link
                    <a className='share-tooltips' onClick={(e)=>{this.showLocalTooltip('publicLink')}} >
                            <Info style={{fontSize:'19px', color:'blue'}}/>
                    </a>
                    <Joyride
                                styles={{
                                    options: {
                                    arrowColor: '#e3ffeb',
                                    beaconSize: '4em',
                                    primaryColor: '#05878B',
                                    backgroundColor: '#e3ffeb',
                                    overlayColor: 'rgba(79, 26, 0, 0.4)',
                                    width: 400,
                                    zIndex: 1000,
                                    }
                                    }}
                                    steps={this.state.adhocTooltip.publicLink.text}
                                    run = {this.state.adhocTooltip.publicLink.flag}
                                    callback={(data)=>{this.handleAdhocTooltipJoyrideCallback(data,'publicLink')}}                    
                                    />                     
                </div>
                <a href={url} target="_blank" className="share-url">{url}</a>
                <div className='share-section-heading'>
                    Share Link on Social Media
                    <a className='share-tooltips tooltipSocialMedia' onClick={(e)=>{this.showLocalTooltip('socialMedia')}} >
                            <Info style={{fontSize:'19px', color:'blue'}}/>
                            <Joyride
                                styles={{
                                    options: {
                                    arrowColor: '#e3ffeb',
                                    beaconSize: '4em',
                                    primaryColor: '#05878B',
                                    backgroundColor: '#e3ffeb',
                                    overlayColor: 'rgba(79, 26, 0, 0.4)',
                                    width: 400,
                                    zIndex: 1000,
                                    }
                                    }}
                                    steps={this.state.adhocTooltip.socialMedia.text}
                                    run = {this.state.adhocTooltip.socialMedia.flag}
                                    callback={(data)=>{this.handleAdhocTooltipJoyrideCallback(data,'socialMedia')}}                    
                                    /> 
                    </a> 
                </div>
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

            </div>
        )

    }

    componentDidMount(){
        var bTree = this.props.blockTree;
        let count=0;
        let allBlocks = [], currBlockPage = [];
        if(bTree!=null){
            Object.keys(bTree).map((key, index) => {
                if(count==100){
                    let page = {
                        blocks: currBlockPage
                    };
                    allBlocks.push(page);
                    currBlockPage = [];
                }
                var block = bTree[key];
                if(block!=null){
                    if(block.previousKey)
                        block['parent']=block.previousKey;
                    if(!block.children)
                        block['children']=[];    
                    if(block.actionType){    
                    currBlockPage.push(block);
                    count++;
                    }
                }
            } 
            );
        }
        if(currBlockPage.length > 0){
            let page = {
                blocks: currBlockPage
            };
            allBlocks.push(page);
            currBlockPage = [];
        }
        if(allBlocks.length>0){

            firebase.firestore().collection("public").doc(this.props.bpId)
                .collection("aggBlocks").get().then((snapshot) => {
                    snapshot.forEach((doc) => {
                        var ref = firebase.firestore().collection("public").doc(this.props.bpId)
                            .collection("aggBlocks").doc(doc.id).delete();
                    });
                    for(var i=0; i<allBlocks.length; i++){
                        firebase.firestore().collection('public').doc(this.props.bpId)
                        .collection('aggBlocks').doc(String(i)).set(allBlocks[i]);        
                    }
        
                }).then(
                    this.setState({blocksUploaded: true})
                );

        }
    }

    render(){
        return (
            <div>
                {this.state.blocksUploaded?
                    this.renderShareScreen()
                    :
                    <Loader 
                        type="TailSpin"
                        color="#00BFFF"
                        height="200"	
                        width="200"
                    />   
                }                
            </div>
        );
    }
}
export default ShareBlockprobeComponent;