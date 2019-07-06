import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import ChatBox from './ChatBox';
import ViewBlockListComponent from './ViewBlockOptionList';
import UpvoteStatusComponent from './UpvoteStatus';
import Img from 'react-image';
import './ViewBlock.css';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';


class ViewBlockComponent extends React.Component {

    constructor(props){
        super(props);
        //closeSideBar, bpDetails, refreshBlockprobe


        this.state={
            chatList: [],
            reviewersMap: {},
            upVotes: 0,
            canCommit: false
        }
        this.prevBlockId = null;
        this.prevBlockState = null;
        this.reviewerRef = null;

        this.renderChat = this.renderChat.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.renderUpvoteStatus = this.renderUpvoteStatus.bind(this);
        this.selectOption = this.selectOption.bind(this);
        this.getReviewersStatusForBlock = this.getReviewersStatusForBlock.bind(this);
        this.modifyReviewerMap = this.modifyReviewerMap.bind(this);
        this.removeHashedIndex = this.removeHashedIndex.bind(this);
    }

    removeHashedIndex(a){
        if(a){        
            a = a.trim();
            var startI = 0;
            if(a.length>0 && a[0]=='#'){
                for(var i=1; i<a.length; i++){
                    startI = i;
                    if(a.charAt(i)==' '){
                        return a.substring(startI).trim();
                    }
                } 
                return '';   
            }
            return a;
        }
        return '';
    }

    getDateTimeString(timelineBlock){
        var ans = "";
        if(timelineBlock.blockDate!=null){
            ans = ans + timelineBlock.blockDate.date + "-";
            ans = ans + (timelineBlock.blockDate.month+1) + "-";
            ans = ans + timelineBlock.blockDate.year + "  ";


            // console.log(timelineBlock.blockDate);
            // console.log(ans);

            if(timelineBlock.blockTime!=null){
                var temp = "";
                if(timelineBlock.blockTime.hours < 10){
                    temp = "0"; 
                }
                temp = temp + timelineBlock.blockTime.hours;
                ans = ans + temp + ":";

                temp = "";
                if(timelineBlock.blockTime.minutes < 10){
                    temp = "0"; 
                }
                temp = temp + timelineBlock.blockTime.minutes;
                ans = ans + temp;


            }
        }
        return ans;
    }

    BlockEntity(entity){
        return(
        <span className="block-entity">
            {entity.title}
        </span>
        );  
       }

    BlockEvidence(evidence, index){
        const WebView = require('react-electron-web-view');
        var evidenceList = [evidence.evidenceLink];
        return(
            <div className="block-evidence">
                <a href={evidence.evidenceLink} target="_blank" className="block-evidence-title">Evidence {index+1}</a>
                <div className="block-evidence-subtitle">{evidence.supportingDetails}</div>
                <Img src={evidenceList}
                style={{width:'100%'}}></Img>
            </div>
        );
    }   

    renderDateTime(dateTimeString){

        if(dateTimeString!=""){
            return (
                <div class="block-datetime" data-tip data-for='dateTime'>{dateTimeString}</div>
            );
        }
        return null;
    }

    renderChat(id){
        if(!isNullOrUndefined(this.props.selectedBlock.blockState) &&
        (this.props.selectedBlock.blockState =="TO REVIEW" || this.props.selectedBlock.blockState =="UNDER REVIEW"))
        {
            var isReviewer = true;
            if(this.props.selectedBlock.blockState == "UNDER REVIEW"){
                isReviewer = false;
            }         

           
            
            return (
                <div>
                    <h3 style={{marginBottom:'5px',textAlign:"center"}}>CHAT</h3>
                    <ChatBox selectedBlock={this.props.selectedBlock} 
                    uId={this.props.uId}
                    bpId = {this.props.bpId}
                    blId={id}/>
                </div>
            );
        } 
        return null;
    }


    modifyReviewerMap(dataSnapshot){
        var rMap = this.state.reviewersMap;
        rMap[dataSnapshot.key] = dataSnapshot.val();

        var upVotes = 0;
        var total = this.props.bpDetails.criterion;
        var canCommit = false;
        Object.keys(rMap).map((reviewerId)=> {
            if(rMap[reviewerId]=="1"){
                upVotes++;
            }
        });
        if(total - upVotes <= 0){
            canCommit = true;
        }
        this.setState({
            reviewersMap: rMap,
            upVotes: upVotes,
            canCommit: canCommit
        });
    }

    getReviewersStatusForBlock(){
        // reviewers
        this.reviewerRef =
            firebase.database().ref("Blockprobes/"+this.props.selectedBlock.bpID
                        +"/reviewBlocks/"+this.props.selectedBlock.key 
                        +"/reviewers");
        this.reviewerRef.on('child_added', dataSnapshot => {
                            this.modifyReviewerMap(dataSnapshot)
                        });
        this.reviewerRef.on('child_changed', dataSnapshot => {
                            this.modifyReviewerMap(dataSnapshot)
                        });                
        this.prevBlockId = this.props.selectedBlock.key;
        this.prevBlockState = this.props.selectedBlock.blockState;                
        
    }

    componentDidUpdate(){
        if(this.prevBlockId!=this.props.selectedBlock.key){
            this.setState({
                reviewersMap: {}
            });
            this.getReviewersStatusForBlock();
        }
    }

    componentDidMount(){
        this.getReviewersStatusForBlock();
    }

    selectOption(option){
        if(option == "revert" || option == "upvote" || option == "can_commit"){
            if(option == "can_commit")            
                this.props.refreshBlockprobe();
            this.props.closeSideBar();
        }
    }

    renderOptions(){

        if(!isNullOrUndefined(this.props.selectedBlock.blockState)){
            return(
                <ViewBlockListComponent 
                blockState={this.props.selectedBlock.blockState}
                canCommit={this.state.canCommit}
                selectOption = {this.selectOption}
                uId={this.props.uId}
                selectedBlock={this.props.selectedBlock}
                bpDetails={this.props.bpDetails}
                reviewersMap={this.state.reviewersMap}
                latestBlock ={this.props.latestBlock}
                />
            )
        }
        return null;
    }

    renderUpvoteStatus(){
        if(!isNullOrUndefined(this.props.selectedBlock.blockState) && 
        this.props.selectedBlock.blockState=="UNDER REVIEW"){
            return (
                <UpvoteStatusComponent 
                upVotes = {this.state.upVotes}
                bpDetails = {this.props.bpDetails}/>            
            );
        }
        return null;
    }

    render(){

        var renderBlockEntities="";
        var renderBlockEvidences="";
        var dateTimeString = "";

        if(this.props.selectedBlock.entities!=null && 
            this.props.selectedBlock.entities.length>0){            
            renderBlockEntities = this.props.selectedBlock.entities.map((blockEntity) => 
               this.BlockEntity(blockEntity)
           );            
       }

       if(this.props.selectedBlock.evidences!=null && 
        this.props.selectedBlock.evidences.length>0){            
        renderBlockEvidences = this.props.selectedBlock.evidences.map((blockEvidence, index) => 
           this.BlockEvidence(blockEvidence, index)
       );            
       }
       
       if(this.props.selectedBlock.blockDate!=null){
           dateTimeString = this.getDateTimeString(this.props.selectedBlock);
       }

        return (
            <div class="block-div">
            <div class="block-text">
                <h2 class="block-title">{this.removeHashedIndex(this.props.selectedBlock.title)}</h2>
                <p class="block-summary">{this.props.selectedBlock.summary}</p>
            </div>
            
            {this.renderDateTime(dateTimeString)}

            <div>{renderBlockEntities}</div>
            <div className="block-evidence-list">
                {renderBlockEvidences}
            </div>

            {this.renderUpvoteStatus()}

            {this.renderOptions()}

            {this.renderChat(this.props.selectedBlock.key)}

            <ReactTooltip id='dateTime' type='error' place="left" className="hover-template">
                <span>Date and Time associated with the event described by this block.</span>
            </ReactTooltip>
            </div>
        );
    }
}
export default ViewBlockComponent;