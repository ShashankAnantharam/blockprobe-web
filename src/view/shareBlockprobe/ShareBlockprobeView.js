import React, { Component } from 'react';
import './ShareBlockprobe.css';
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
       // this.setState({blocksUploaded: true});
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