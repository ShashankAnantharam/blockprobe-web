import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Textarea from 'react-textarea-autosize';
import Slider from '@material-ui/lab/Slider';
import * as Utils from '../../common/utilSvc';
import * as Constants from '../../common/constants';
import Loader from 'react-loader-spinner';
import './BlockprobeSettings.css';
import { isNullOrUndefined } from 'util';


const styles = {
    root: {
      width: 300,
    },
    slider: {
      padding: '22px 0px',
    },
  };

class BlockprobeSettingsComponent extends React.Component {

    constructor(props){
        super(props);
        //details, permit, uId, coUsers

        this.state={
            uIdHash:'',
            shajs:null,
            newCriterion: JSON.parse(JSON.stringify(props.details.criterion)),
            step: 1,
            min: 0,
            viewerId: '',
            contributorId: '',
            creatorId: '',
            prevCreatorId: '',
            creatorMessageId: null,
            addingUser: false
        }

        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        this.changeCriterion = this.changeCriterion.bind(this);
        this.renderBlockprobeSettings = this.renderBlockprobeSettings.bind(this);
        this.modifyBlockProbeSettings = this.modifyBlockProbeSettings.bind(this);
        this.renderAddViewers = this.renderAddViewers.bind(this);
        this.renderAddContributors = this.renderAddContributors.bind(this);
        this.renderAddCreators = this.renderAddCreators.bind(this);
        this.getMessage = this.getMessage.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    getMessage(type){
        let id = this.state.prevCreatorId;
        if(!isNullOrUndefined(type)){
            if(type == 'alreadyPresent'){
                return (
                    <p className="messageUserTextGeneral">User <span className="messageUserTextUid">{id}</span> is already contributing to the story.</p>
                );
            }
            else if(type == 'notExist'){
                return (
                    <p className="messageUserTextGeneral">User <span className="messageUserTextUid">{id}</span> does not exist.</p>
                );
            }
            else if(type == 'alreadySent'){
                return (
                    <p className="messageUserTextGeneral">User <span className="messageUserTextUid">{id}</span> has already been invited.</p>
                );
            }
            else if(type == 'sent'){
                return (
                    <p className="messageUserTextGeneral">Invitation sent to <span className="messageUserTextUid">{id}</span>.</p>
                );
            }
            else if(type =="maxUserLimitReached"){
                return (
                    <p className="messageUserTextGeneral">Cannot add <span className="messageUserTextUid">{id}</span> because each story has {Constants.maxUsers} contributors!</p>
                );
            }
        }
        return null;
    }

    changeCriterion = (event, value) => {
        this.setState({ newCriterion: value });
    };

    modifyBlockProbeSettings(change, shouldModify){
        var val = "";
        if(shouldModify){
            //Modify change in db

            var permit = "";
            if(change == "viewer"){
                val = this.state.viewerId;
                permit = "VIEWER";
            }
            else if(change == "contributor"){
                val = this.state.contributorId;
                permit = "CONTRIBUTOR";
            }
            else if(change == 'reviewer'){
                permit = "REVIEWER";
            }
            else if(change == 'creator'){
                val = this.state.creatorId;
                permit = "CREATOR";
                this.setState({
                    prevCreatorId: val,
                    addingUser: true
                });
            }

            if(change != 'criterion'){
                
                var softBlockprobeToAdd = {
                    active: true,
                    id: this.props.bpId,
                    isActive: true,
                    permit:permit,
                    summary: this.props.details.summary,
                    title: this.props.details.title,
                    timestamp: 0
                };
                // console.log(softBlockprobeToAdd);

                var scope = this;
               let coUsers = this.props.coUsers;
               let currMem = 1;
               if(!isNullOrUndefined(coUsers)){
                   currMem = Math.max(Object.keys(coUsers).length,1);
               } 
               if(currMem < Constants.maxUsers){
                    firebase.firestore().collection("Users").doc(val).get().then(function(doc) {
                        if(doc.exists){
                            // console.log("Debug exists:" + val);
                            firebase.firestore().collection("Users").doc(val).
                            collection("blockprobes").doc(scope.props.bpId).get().then(
                                function(bpSnapshot){
                                    if(bpSnapshot.exists){

                                        // console.log("Blockprobe exist for user");

                                    /*  var existingBlockprobe = bpSnapshot.data();
                                        softBlockprobeToAdd.timestamp = existingBlockprobe.timestamp;
                                        if(change == "contributor" 
                                            && existingBlockprobe.permit == "VIEWER"){
                                                
                                                firebase.firestore().collection("Users").
                                                doc(val).collection("blockprobes").
                                                    doc(scope.props.bpId).set(softBlockprobeToAdd);
                                            }
                                        else if(change == "reviewer" && 
                                            !(existingBlockprobe.permit != "PRIVILEGED")){

                                                firebase.firestore().collection("Users").
                                                doc(val).collection("blockprobes").
                                                    doc(scope.props.bpId).set(softBlockprobeToAdd);
                                            }
                                            */

                                            scope.setState({
                                                creatorMessageId: 'alreadyPresent',
                                                addingUser: false
                                            });
                                            //console.log("User already present");

                                    }
                                    else{

                                        // console.log("adding blockprobe first time");

                                        firebase.firestore().collection("Users").
                                            doc(val).collection("notifications").
                                                doc(scope.props.bpId).get().then(
                                                    function(notifSnapshot){
                                                        if(notifSnapshot.exists){
                                                            //notification sent
                                                            scope.setState({
                                                                creatorMessageId: 'alreadySent',
                                                                addingUser: false
                                                            });
                                                            //console.log("User already sent");
                                                        }
                                                        else{
                                                            firebase.firestore().collection("Users").
                                                                doc(val).collection("notifications").
                                                                    doc(scope.props.bpId).set(softBlockprobeToAdd);

                                                            let userDetails = {
                                                                id: val,
                                                                role: 'INVITED'
                                                            }
                                                            
                                                            // console.log('Blockprobes/'+ blockprobeId +'/isActive/');
                                                            firebase.database().ref('Blockprobes/'+ scope.props.bpId +'/users/').push(userDetails); 
                                                            scope.setState({
                                                                creatorMessageId: 'sent',
                                                                addingUser: false
                                                            });
                                                        }
                                                    }
                                                )

                                        /*if(change != "creator"){
                                            firebase.firestore().collection("Users").
                                            doc(val).collection("blockprobes").
                                                doc(scope.props.bpId).set(softBlockprobeToAdd);
                                        }
                                        else{
                                            firebase.firestore().collection("Users").
                                            doc(val).collection("notifications").
                                                doc(scope.props.bpId).set(softBlockprobeToAdd)
                                        }*/
                                    }
                                }
                            )
                        }
                        else{
                            //console.log("User does not exist");
                            scope.setState({
                                creatorMessageId: 'notExist',
                                addingUser: false
                            });
                        }
                    });
               }
               else{
                scope.setState({
                    creatorMessageId: 'maxUserLimitReached',
                    addingUser: false
                });
               }
               
                
            }
            else if(change == 'criterion'){

                var newDetails = JSON.parse(JSON.stringify(this.props.details));

                newDetails['criterion'] = this.state.newCriterion;


                // console.log(newDetails);

                firebase.firestore().collection('Blockprobes').doc(this.props.bpId).set(newDetails);
            }

        }
        

        if(change == "viewer"){
            this.setState({viewerId: ''});
        }
        else if(change == "contributor"){
            this.setState({contributorId: ''});
        }
        else if(change == "creator"){
            this.setState({creatorId: ''});
        }
        else if(change == "criterion"){

            if(!shouldModify){
                val = this.props.details.criterion;
            }
            else{
                val = this.state.newCriterion;
            }

            this.setState({
                newCriterion: val
            });
        }
    }

    renderBlockprobeSettings(){

        const { classes } = this.props;

        if(this.props.permit == 'CREATOR'){
            return (
                <div style={{marginLeft:'10px', marginBottom:'5em'}}>
                    <h3>Upvote Criteria</h3>
                    <h5>Number of reviewer upvotes for any block to accepted. ({this.state.newCriterion})</h5>
                    <div style={{width:'30%', marginLeft:'15px'}}>
                        <Slider
                            value={this.state.newCriterion}
                            min={0}
                            max={this.props.details.reviewers.length}
                            onChange={this.changeCriterion}
                            step = {this.state.step}
                            />
                    </div>
                    {this.state.newCriterion!=this.props.details.criterion?
                        <div className="blockprobe-settings-criterion-options-container">
                            <button 
                            className="saveBlockProbeSettingsButton" 
                            onClick={(e) => this.modifyBlockProbeSettings("criterion",true)}>
                                <div>Confirm settings</div>
                            </button>
                            <button 
                            className="cancelBlockProbeSettingsButton" 
                            onClick={(e) => this.modifyBlockProbeSettings("criterion",false)}>
                                <div>Cancel</div>
                            </button>
                        </div>
                        :
                        null
                    }
                </div>
            );
        }
        return null;
    }

    handleChange(event, type) {

        var shouldUpdate = false;
        let str = event.target.value;
        if(type=='creator' && Utils.shouldUpdateText(str,['\n','\t'])){
            shouldUpdate = true;
        }

        if(shouldUpdate){
            
            if(type=="viewer"){
                var id = event.target.value;
                this.setState({viewerId: id});
            }
            else if(type == "contributor"){
                var id = event.target.value;
                this.setState({contributorId: id});
            }
            else if(type=="creator"){
                let id = event.target.value;
                this.setState({
                    creatorId: id,
                    creatorMessageId: null
                });
            }

        }
      }

      renderAddContributors(){
          if(this.props.permit == "PRIVILEGED" || this.props.permit == "CREATOR"){
            return (
                <div style={{marginLeft:'10px', marginTop:'1em'}}>
                    <h3>Add Contributors</h3>
                    <form>
                    <label>
                        <Textarea 
                            type="text"
                            placeholder = "Phone number"
                            value={this.state.contributorId}
                            onChange={(e) => { this.handleChange(e,"contributor")}}
                            maxRows="1"
                            minRows="1"
                            style={{
                                background: 'white',
                                borderWidth:'2px', 
                                borderStyle:'solid', 
                                borderColor:'darkgrey',
                                paddingTop:'6px',
                                paddingBottom:'6px',
                                width:'30%'
                                }}/>
                    </label>
                    </form>
                    {this.state.contributorId!=''?
                            <div className="blockprobe-settings-criterion-options-container">
                                <button 
                                className="saveBlockProbeSettingsButton" 
                                style={{marginTop:'1em'}}
                                onClick={(e) => this.modifyBlockProbeSettings("contributor",true)}>
                                    <div>Confirm contributor</div>
                                </button>
                                <button 
                                className="cancelBlockProbeSettingsButton" 
                                style={{marginTop:'1em'}}
                                onClick={(e) => this.modifyBlockProbeSettings("contributor",false)}>
                                    <div>Cancel</div>
                                </button>
                            </div>
                            :
                            null
                        }           
                </div>
                )
                    }

            return null;        
    }

    renderAddViewers(){
        return (
            <div style={{marginLeft:'10px', marginTop:'1em'}}>
                <h3>Add Viewers</h3>
                <form>
                <label>
                    <Textarea 
                        type="text"
                        placeholder = "Phone number"
                        value={this.state.viewerId}
                        onChange={(e) => { this.handleChange(e,"viewer")}}
                        maxRows="1"
                        minRows="1"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'darkgrey',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'30%'
                            }}/>
                 </label>
                 </form>
                 {this.state.viewerId!=''?
                        <div className="blockprobe-settings-criterion-options-container">
                            <button 
                            className="saveBlockProbeSettingsButton" 
                            style={{marginTop:'1em'}}
                            onClick={(e) => this.modifyBlockProbeSettings("viewer",true)}>
                                <div>Confirm viewer</div>
                            </button>
                            <button 
                            className="cancelBlockProbeSettingsButton" 
                            style={{marginTop:'1em'}}
                            onClick={(e) => this.modifyBlockProbeSettings("viewer",false)}>
                                <div>Cancel</div>
                            </button>
                        </div>
                        :
                        null
                    }           
            </div>
        )
    }

    renderAddCreators(){
        return (
            <div>
                <div style={{marginLeft:'10px', marginTop:'1em'}}>
                    <h3>Add Users</h3>
                    <form>
                    <label>
                        <Textarea 
                            type="text"
                            placeholder = "Email or phonenumber"
                            value={this.state.creatorId}
                            onChange={(e) => { this.handleChange(e,"creator")}}
                            maxRows="1"
                            minRows="1"
                            style={{
                                background: 'white',
                                borderWidth:'2px', 
                                borderStyle:'solid', 
                                borderColor:'darkgrey',
                                paddingTop:'6px',
                                paddingBottom:'6px',
                                width:'30%'
                                }}/>
                    </label>
                    </form>
                    {this.getMessage(this.state.creatorMessageId)}
                    {this.state.creatorId!='' && !this.state.addingUser?
                            <div className="blockprobe-settings-criterion-options-container">
                                <button 
                                className="saveBlockProbeSettingsButton" 
                                style={{marginTop:'1em'}}
                                onClick={(e) => this.modifyBlockProbeSettings("creator",true)}>
                                    <div>Confirm</div>
                                </button>
                                <button 
                                className="cancelBlockProbeSettingsButton" 
                                style={{marginTop:'1em'}}
                                onClick={(e) => this.modifyBlockProbeSettings("creator",false)}>
                                    <div>Cancel</div>
                                </button>
                            </div>
                            :
                            null
                        }
                    {this.state.addingUser?
                        <div style={{width:'50px'}}>
                            <Loader 
                            type="TailSpin"
                            color="#00BFFF"
                            height="50"	
                            width="50"
                            /> 
                        </div>
                        :
                        null
                    }           
                </div>
            </div>
        )
    }


    //{this.renderBlockprobeSettings()}
    //{this.renderAddContributors()}
    //{this.renderAddViewers()}
    render(){
        return (
            <div>                
                {this.renderAddCreators()}
            </div>
        );
    }


}
export default BlockprobeSettingsComponent;