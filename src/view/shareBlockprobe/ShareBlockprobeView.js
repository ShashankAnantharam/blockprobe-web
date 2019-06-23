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

class ShareBlockprobeComponent extends React.Component {

    constructor(props){
      super(props);
      this.state = {
          urlPrefix: 'https://blockprobe-32644.firebaseapp.com/view/',
          blocksUploaded: false
      }

      this.renderShareScreen = this.renderShareScreen.bind(this);
    }

    renderShareScreen(){
        let url = this.state.urlPrefix + this.props.bpId;
        return (
            <div>
                <div className='share-section-heading'>Link</div>
                <a href={url} target="_blank" className="share-url">{url}</a>
                <div className='share-section-heading'>Share</div>
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