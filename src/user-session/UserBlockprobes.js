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
import Joyride,{ ACTIONS, EVENTS, STATUS } from 'react-joyride';

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
            toolTipSteps:{
                createStoryStep: [
                    {
                        title: 'The blockprobe tutorial!',
                        target: '.addBlockprobeButton',
                        content: 'This is a directed tutorial to show you how to use Blockprobe tool. In this tutorial, you will build, visualise and share your work using blockprobe!',
                        placement: 'center',
                        disableBeacon: true
                    },
                    {
                        title: 'Get started!',
                        target: '.addBlockprobeButton',
                        content: 'Click to create new story and get started! A story could be an investigation of a crime, an article for a newspaper or a policy proposal.',
                        placementBeacon: 'left',
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
                ]
            },
            showToolTips:{
                createStory: JSON.parse(JSON.stringify(props.buildStorytooltip)),
                addTitleAndSummary: false,
                clickOnStory: false,
                buildStory: false
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
        this.startTooltipTour = this.startTooltipTour.bind(this);
        this.createBlockprobe = this.createBlockprobe.bind(this);
        this.handleCreateStoryJoyrideCallback = this.handleCreateStoryJoyrideCallback.bind(this);
        
    }

    selectBlockprobe(blockprobeId){
        this.props.selectBlockprobe(blockprobeId, this.state.showToolTips.buildStory);
    }

    handleCreateStoryJoyrideCallback(data){
        const {action,index,status,type} = data;
        if([STATUS.FINISHED, STATUS.SKIPPED].includes(status)){
            var showToolTips = this.state.showToolTips;
            showToolTips.createStory = false;
            showToolTips.addTitleAndSummary = true;
            showToolTips.clickOnStory = false;
            this.setState({ showToolTips: showToolTips });
            ReactGA.event({
                category: 'read_initial_tooltip',
                action: 'Closed initial tooltip',
                label: 'close initial tooltip'
              });
        }
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
                content: 'Give a title and brief summary to your story!',
                disableBeacon: true                    
            }];
        if(this.state.addBlockprobe){
            return (
                <div style={{}}>
                    <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(1, 79, 61, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={draftBlockprobeSteps}
                    run = {this.state.showToolTips.addTitleAndSummary}
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
            if(showToolTips.addTitleAndSummary){
                showToolTips.createStory = false;
                showToolTips.addTitleAndSummary = false;
                showToolTips.clickOnStory = true;
            }
        }
        else{
            if(showToolTips.createStory){
                showToolTips.createStory = false;
                showToolTips.addTitleAndSummary = true;
                showToolTips.clickOnStory = false;
            }
        }

        
        this.setState({
            addBlockprobe: !addBlockprobe,
            draftBlockprobe: draftBlockprobe,
            showToolTips: showToolTips
        });
        
    }

    startTooltipTour(){
        var showToolTips = this.state.showToolTips;
        if(!showToolTips.createStory){
            //start tooltips
            showToolTips.createStory = true;
            showToolTips.addTitleAndSummary = false;
            showToolTips.clickOnStory = false;
            showToolTips.buildStory = true;
            this.setState({
                showToolTips: showToolTips
            });
        }
    }

    componentWillReceiveProps(newProps){
        if(newProps.buildStorytooltip){
            var showTooltips = this.state.showToolTips;
            showTooltips.createStory = JSON.parse(JSON.stringify(newProps.buildStorytooltip));
            this.setState({showToolTips:showTooltips});
        }
    }

    componentDidMount(){
        /*
        <!-- Event snippet for Blockprobe signup conversion page -->
        <script>
        gtag('event', 'conversion', {'send_to': 'AW-734513637/5XMVCJjI2qUBEOWTn94C'});
        </script>

        */
        const script = document.createElement("script");
        const scriptText = document.createTextNode("gtag('event', 'conversion', {'send_to': 'AW-734513637/5XMVCJjI2qUBEOWTn94C'});");
        script.appendChild(scriptText);
        document.head.appendChild(script);;
    }

    render(){

        const scope = this;
        //console.log(this.props.blockprobes)
        const blockprobeListRender = Object.keys(this.props.blockprobes).
        map((blockprobeId) => (
            scope.renderSingleBlockprobeItem(scope.props.blockprobes[blockprobeId], scope)
        ));

        return (
            <div>
                <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(1, 79, 61, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}                
                steps={this.state.toolTipSteps.createStoryStep}
                run = {this.state.showToolTips.createStory}                
                  callback = {this.handleCreateStoryJoyrideCallback}
                />
                <h2 style={{textAlign:'center'}}>My stories</h2>
                <div>
                    <div>
                        <button 
                                className="addBlockprobeButton" 
                                onClick={this.addCancelBlockprobe}>
                                {!this.state.addBlockprobe?
                                <div>Create new story</div>
                                :
                                <div>Cancel</div>
                                }
                        </button>
                        <button
                            className="startTooltipsButton" 
                            onClick={() => this.startTooltipTour()}>
                            Guided tutorial
                        </button>
                    </div>
                    {this.state.addBlockprobe?
                        this.renderDraftBlockprobe()
                        :
                        null
                    }
                </div>
                <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(1, 79, 61, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={this.state.toolTipSteps.clickOnStoryStep}
                    run = {this.state.showToolTips.clickOnStory}                    
                    />  

                    {Object.keys(this.props.blockprobes).length == 0?
                        <div style={{padding:'15px'}}>
                        <p className="emptyListText">
                            If you want to understand the tool, click on the Guided Tutorial button and follow the steps.<br/><br/>
                            Your work will be saved as <span className="emptyListTextEmphasisStory">stories</span>.<br/>
                            If you are a <span className="emptyListTextEmphasisPersona">police officer</span>, the <span className="emptyListTextEmphasisStory">story</span> could be the <span className="emptyListTextEmphasisStoryType">case that you are investigating</span>.<br/>
                            If you are a <span className="emptyListTextEmphasisPersona">politician</span>, the <span className="emptyListTextEmphasisStory">story</span> could be your <span className="emptyListTextEmphasisStoryType">policy proposal</span>.<br/>
                            If you are a <span className="emptyListTextEmphasisPersona">journalist</span>, the <span className="emptyListTextEmphasisStory">story</span> could be your <span className="emptyListTextEmphasisStoryType">article or investigation</span>.<br/>
                        </p>
                        </div>                    
                        :
                        <List className="blockprobeListTooltip">                                     
                            {blockprobeListRender}
                        </List>
                        }
                
                
            </div>
        );
    }


}
export default UserBlockprobesComponent;