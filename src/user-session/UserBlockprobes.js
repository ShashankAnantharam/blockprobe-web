import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import ReactGA from 'react-ga';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Textarea from 'react-textarea-autosize';
import './UserBlockprobes.css';
import Joyride from 'react-joyride';

class UserBlockprobesComponent extends React.Component {

    constructor(props){
        
        //Probs include blockprobes, selectBlockprobe, selectedBlockprobe
        super(props);
        this.state={
            uIdHash:'',
            shajs:null,
            addBlockprobe: false,
            draftBlockprobe: {
                title:'',
                summary:''
            },
            createStoryStep: [
                {
                  title: 'Get started with a new story!',
                  target: '.addBlockprobeButton',
                  content: 'Click to create new story and get started!',
                  disableBeacon: true
                }                                
              ],
            clickOnStoryStep: [
                {                    
                    title: 'Let\'s go right to it!',
                    target: '.blockprobeListTooltip',
                    content: 'Click on your new story!',
                    disableBeacon: true                    
                }
            ],
            showToolTips:{
                createStory: true,
                clickOnStory: false
            }
        };

        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        ReactGA.initialize('UA-143383035-1');   
        ReactGA.pageview('/userBlockProbes');

        this.isValidBlockprobe = this.isValidBlockprobe.bind(this);
        this.renderSingleBlockprobeItem = this.renderSingleBlockprobeItem.bind(this);
        this.addCancelBlockprobe = this.addCancelBlockprobe.bind(this);
        this.renderDraftBlockprobe = this.renderDraftBlockprobe.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.createBlockprobe = this.createBlockprobe.bind(this);
    }

    selectBlockprobe(blockprobeId){
        this.props.selectBlockprobe(blockprobeId);
    }

    renderSingleBlockprobeItem(blockprobe, scope){
        //console.log(blockprobe);
        return (
                <ListItem button 
                    selected={scope.props.selectedBlockprobe == blockprobe.id}
                    onClick={() => { scope.selectBlockprobe(blockprobe.id)}}
                    style={{width:'100%'}}
                    >
                    <ListItemText primary={blockprobe.title} secondary={blockprobe.summary}/>
                </ListItem>
        );
    }

    createBlockprobe(){
        var timestamp = Date.now();

        var firstBlock = {
            key:'',
            title:this.state.draftBlockprobe.title,
            summary:this.state.draftBlockprobe.summary,
            entities:[],
            evidences:[],
            actionType:'genesis',
            previousKey: "0",
            referenceBlock: '',
            timestamp: timestamp,
            verificationHash: ''
        }

        var newBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(timestamp)).digest('hex');
        firstBlock.verificationHash = newBlockId;
        firstBlock.key = this.state.shajs('sha256').update(newBlockId + firstBlock.previousKey).digest('hex');
        var blockprobeId = firstBlock.key;

        var details = {
            active: true,
            criterion: 0,
            isActive: true,
            reviewers: [{ id: this.state.uIdHash, nick: 'creator'}],
            summary: this.state.draftBlockprobe.summary,
            title: this.state.draftBlockprobe.title
        }

        var softBlockprobe = {
            active: true,
            id: blockprobeId,
            isActive: true,
            permit:'CREATOR',
            summary: this.state.draftBlockprobe.summary,
            title: this.state.draftBlockprobe.title,
            timestamp: timestamp
        }

        var nickPhoneHash = {
        };
        nickPhoneHash["creator"]= this.props.uId;

        // console.log('Blockprobes/'+ blockprobeId +'/isActive/');
        firebase.database().ref('Blockprobes/'+ blockprobeId +'/isActive/').set('true'); 

        // console.log('Blockprobes/'+ blockprobeId +'/fullBlocks/'+blockprobeId);
        // console.log(firstBlock);
        firebase.firestore().collection('Blockprobes').doc(blockprobeId)
        .collection('fullBlocks').doc(blockprobeId).set(firstBlock);

        // console.log('Users/'+ this.props.uId +'/blockprobes/'+blockprobeId);
        // console.log(softBlockprobe);
        firebase.firestore().collection('Users').doc(this.props.uId)
        .collection('blockprobes').doc(blockprobeId).set(softBlockprobe);
       
        // console.log('Blockprobes/'+blockprobeId);
        // console.log(details);
        firebase.firestore().collection('Blockprobes').doc(blockprobeId).set(details);
       
       // console.log('Users/'+this.props.uId +"/blockprobes/"+blockprobeId+
       // "/privelegedInfo/nickPhoneHash");
       // console.log(nickPhoneHash);
        
        firebase.firestore().collection('Users').doc(this.props.uId)
        .collection('blockprobes').doc(blockprobeId).
        collection('privelegedInfo').doc('nickPhoneHash').set(nickPhoneHash);        

        this.addCancelBlockprobe();

        ReactGA.event({
            category: 'blockprobe',
            action: 'Create blockprobe',
            label: blockprobeId
          });
    }

    isValidBlockprobe(){
        if(this.state.draftBlockprobe.title == '' || this.state.draftBlockprobe.summary == '')
            return false;
        return true;
    }

    renderDraftBlockprobe(){
        var draftBlockprobeSteps = [
            {
                target: '.newBlockprobeForm',
                content: 'Give a title and summary to your story!',
                disableBeacon: true                    
            }];
        if(this.state.addBlockprobe){
            return (
                <div style={{}}>
                    <Joyride
                    steps={draftBlockprobeSteps}
                    />
                    <form className="newBlockprobeForm">
                        <label>
                            <Textarea 
                                type="text"
                                placeholder = "Title of your story."
                                value={this.state.draftBlockprobe.title}
                                onChange={(e) => { this.handleChange(e,"title")}}
                                maxRows="2"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'darkgrey',
                                    borderBottomWidth:'0px',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    width:'95%'
                                    }}/>
                            <Textarea 
                            type="text"
                            placeholder = "A one line summary of your story."
                            value={this.state.draftBlockprobe.summary}
                            onChange={(e) => { this.handleChange(e,"summary")}}
                            maxRows="5"
                            minRows="3"
                            style={{
                                background: 'white',
                                borderWidth:'2px', 
                                borderStyle:'solid', 
                                borderColor:'darkgrey',
                                borderTopWidth:'0px',
                                paddingTop:'6px',
                                paddingBottom:'6px',
                                width:'95%'
                                }}/>
                        </label>
                    </form>
                    {this.isValidBlockprobe()?
                        <button
                        className="submitBlockprobeButton"
                        onClick={this.createBlockprobe}>
                            <div>Confirm</div>
                        </button>                    
                    :
                        null
                    }
                </div>
            );
        }

        return null;
    }

    handleChange(event, type) {

        var shouldUpdate = true;
      
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t')
            shouldUpdate=false;

        if(shouldUpdate){
            var blockProbe = this.state.draftBlockprobe;
            if(type=="title"){
                    blockProbe.title = event.target.value;
                    this.setState({draftBlockprobe: blockProbe});
                }
            else if(type=="summary"){
                    blockProbe.summary = event.target.value;
                    this.setState({draftBlockprobe: blockProbe});
                }
            }
        
    }

    addCancelBlockprobe(){
        var addBlockprobe = this.state.addBlockprobe;

        var draftBlockprobe = this.state.draftBlockprobe;
        var showToolTips = this.state.showToolTips;

        if(addBlockprobe){
            //cancel or submit pressed
            draftBlockprobe = {
                title:'',
                summary:''
            };
            if(showToolTips.createStory){
                showToolTips.createStory = false;
                showToolTips.clickOnStory = true;
            }
        }

        
        this.setState({
            addBlockprobe: !addBlockprobe,
            draftBlockprobe: draftBlockprobe,
            showToolTips: showToolTips
        });
        
    }

    render(){

        const scope = this;
        //console.log(this.props.blockprobes)
        const blockprobeListRender = Object.keys(this.props.blockprobes).
        map((blockprobeId) => (
            scope.renderSingleBlockprobeItem(scope.props.blockprobes[blockprobeId], scope)
        ));

        //console.log(blockprobeListRender);

        return (
            <div>
                <Joyride
                steps={this.state.createStoryStep}
                run = {this.state.showToolTips.createStory}
                />
                <h2 style={{textAlign:'center'}}>My stories</h2>
                <div>
                    <button 
                            className="addBlockprobeButton" 
                            id="createBlockprobe"
                            onClick={this.addCancelBlockprobe}>
                            {!this.state.addBlockprobe?
                            <div>Create new story</div>
                            :
                            <div>Cancel</div>
                            }
                    </button>
                    {this.state.addBlockprobe?
                        this.renderDraftBlockprobe()
                        :
                        null
                    }
                </div>
                <Joyride
                    steps={this.state.clickOnStoryStep}
                    run = {this.state.showToolTips.clickOnStory}
                    />  
                <List className="blockprobeListTooltip">
                                     
                    {blockprobeListRender}
                </List>
            </div>
        );
    }


}
export default UserBlockprobesComponent;