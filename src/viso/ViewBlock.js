import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
import ChatBox from './ChatBox';
import './ViewBlock.css';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';


class ViewBlockComponent extends React.Component {

    constructor(props){
        super(props);
        this.state={
            chatList: []
        }
        this.renderChat = this.renderChat.bind(this);
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
        return(
            <div className="block-evidence">
                <a href={evidence.evidenceLink} target="_blank" className="block-evidence-title">Evidence {index+1}</a>
                <div className="block-evidence-subtitle">{evidence.supportingDetails}</div>
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
                    <h4 style={{marginBottom:'5px'}}>CHAT</h4>
                    <ChatBox selectedBlock={this.props.selectedBlock} 
                    uId={this.props.uId}
                    bpId = {this.props.bpId}
                    blId={id}/>
                </div>
            );
        } 
        return null;
    }

    componentDidMount(){
        
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
                <h2 class="block-title">{this.props.selectedBlock.title}</h2>
                <p class="block-summary">{this.props.selectedBlock.summary}</p>
            </div>
            
            {this.renderDateTime(dateTimeString)}

            <div>{renderBlockEntities}</div>
            <div className="block-evidence-list">
                {renderBlockEvidences}
            </div>

            {this.renderChat(this.props.selectedBlock.key)}

            <ReactTooltip id='dateTime' type='error' place="left" className="hover-template">
                <span>Date and Time associated with the event described by this block.</span>
            </ReactTooltip>
            </div>
        );
    }
}
export default ViewBlockComponent;