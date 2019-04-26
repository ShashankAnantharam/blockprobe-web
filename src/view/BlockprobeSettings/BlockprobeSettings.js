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
import './BlockprobeSettings.css';


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
        //details, permit, uId

        this.state={
            uIdHash:'',
            shajs:null,
            newCriterion: JSON.parse(JSON.stringify(props.details.criterion)),
            step: 1,
            min: 0,
            viewerId: ''
        }

        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        this.changeCriterion = this.changeCriterion.bind(this);
        this.renderBlockprobeSettings = this.renderBlockprobeSettings.bind(this);
        this.modifyBlockProbeSettings = this.modifyBlockProbeSettings.bind(this);
        this.renderAddViewers = this.renderAddViewers.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    changeCriterion = (event, value) => {
        this.setState({ newCriterion: value });
    };

    modifyBlockProbeSettings(change, shouldModify){
        if(shouldModify){
            //Modify change in db
        }
        else{
            //Clear change here in the "change" variable
        }
    }

    renderBlockprobeSettings(){

        const { classes } = this.props;

        if(this.props.permit == 'CREATOR'){
            return (
                <div style={{marginLeft:'10px', marginBottom:'5em'}}>
                    <h3>Upvote Criteria</h3>
                    <h5>Number of reviewer upvotes for any block to accepted.</h5>
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
                                <DoneAllIcon/>
                            </button>
                            <button 
                            className="cancelBlockProbeSettingsButton" 
                            onClick={(e) => this.modifyBlockProbeSettings("criterion",false)}>
                                <ClearIcon/>
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

        var shouldUpdate = true;
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t'){
            shouldUpdate=false;
        }
        

        if(shouldUpdate){
            
            if(type=="viewer"){
                var id = event.target.value;
                this.setState({viewerId: id});
            }
            

        }
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
                                <DoneAllIcon/>
                            </button>
                            <button 
                            className="cancelBlockProbeSettingsButton" 
                            style={{marginTop:'1em'}}
                            onClick={(e) => this.modifyBlockProbeSettings("viewer",false)}>
                                <ClearIcon/>
                            </button>
                        </div>
                        :
                        null
                    }           
            </div>
        )
    }


    render(){
        return (
            <div>
                {this.renderBlockprobeSettings()}
                {this.renderAddViewers()}
            </div>
        );
    }


}
export default BlockprobeSettingsComponent;