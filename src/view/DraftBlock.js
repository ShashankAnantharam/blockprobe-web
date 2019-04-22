import React, { Component } from 'react';
import * as firebase from 'firebase';
import './DraftBlock.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Textarea from 'react-textarea-autosize';
import  MultiSelectReact  from 'multi-select-react';
import DraftBlockEvidenceView from './Draft/DraftBlockEvidenceView';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import { isNullOrUndefined } from 'util';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

class DraftBlockComponent extends React.Component {

    selectedOptionsStyles = {
        color: "white",
        backgroundColor: "rgb(117, 106, 214)",
        borderRadius:"20px",
        fontSize:'0.6em',
        padding:'5px'
    };
    optionsListStyles = {
        backgroundColor: "darkcyan",
        color: "white",

    };

    DAY = 24*60*60*1000;

    constructor(props){
        super(props);

        //props:draftBlock, bpId, uId 
        this.state={
            newBlock: {},
            newEntity: '',
            multiSelectEntityList: [],
            addDate: false,
            addTime: false,
            date: new Date()
        }

        this.handleChange = this.handleChange.bind(this);
        this.changeDateStatus = this.changeDateStatus.bind(this);
        this.changeTimeStatus = this.changeTimeStatus.bind(this);
        this.renderDate = this.renderDate.bind(this);
        this.renderTime = this.renderTime.bind(this);
        this.renderTimeOption = this.renderTimeOption.bind(this);
        this.generateMultiSelectEntityList = this.generateMultiSelectEntityList.bind(this);
        this.addEntityToList = this.addEntityToList.bind(this);
        this.updateEvidence = this.updateEvidence.bind(this);
        this.addEvidence = this.addEvidence.bind(this);
        this.singleBlockEvidence = this.singleBlockEvidence.bind(this);
        this.saveDraftBlock = this.saveDraftBlock.bind(this);
        this.submitDraftBlock = this.submitDraftBlock.bind(this);
        this.cancelDraftBlock = this.cancelDraftBlock.bind(this);
        this.removeDraftBlock = this.removeDraftBlock.bind(this);
        this.populateEntitiesAndEvidencesToBlock = this.populateEntitiesAndEvidencesToBlock.bind(this);
    }
    

    changeDateStatus(){
        var addDate = this.state.addDate;
        var block = this.state.newBlock;
        var ts = new Date();

        if(!addDate){
            //Add date
            block.blockDate = {
                date: ts.getDate(),
                month: ts.getMonth(),
                year: ts.getFullYear()
            }
            console.log(block);
        }
        else{
            //Remove date
            delete block["blockDate"];
            console.log(block);
        }
        this.setState({
            addDate: !addDate,
            newBlock: block
        });
    }

    changeTimeStatus(){
        var addTime = this.state.addTime;
        if(!(addTime)){
            //Set to true, add time
            
        }
        this.setState({addTime: !addTime});
    }

    entityClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
    }

    selectedBadgeClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
    }

    generateMultiSelectEntityList(){
        var count = 1;
        var entityList = this.state.multiSelectEntityList;
        var oldEntities = this.props.draftBlock.entities;
        var oldEntitiesDict = {};

        for(var i=0;i<oldEntities.length;i++){
            if(!(oldEntities[i].title in this.props.investigationGraph)){
                entityList.push({
                    value: true,
                    label: oldEntities[i].title,
                    id: count
                });
                count++;
            }
            oldEntitiesDict[oldEntities[i].title]="";
        }

        Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
            var val = false;
            if(entityLabel in oldEntitiesDict){
                val = true;
            }
            entityList.push({                
                    value: val, 
                    label: entityLabel, 
                    id: count             
            });
            count++;
        });
        this.setState({
            multiSelectEntityList: entityList
        });

        
    }

    addEntityToList(){
        var isEntityAlreadyPresent = false;
        var entityList = this.state.multiSelectEntityList;
        var block = this.state.newBlock;
        var entityLabel = this.state.newEntity;
        for( var i=0; i<entityList.length; i++){
            var entityItem = entityList[i]
            console.log(entityItem.title + ' ' + entityLabel);
            if(entityItem.label == entityLabel){
                isEntityAlreadyPresent=true;
                break;
            }
        }
        if(!isEntityAlreadyPresent){
            var count = entityList.length;
            count = count + 1;
            entityList.push({                
                value: true, 
                label: entityLabel, 
                id: count             
            });
            if(isNullOrUndefined(block.entities)){
                block.entities=[];
            }
            block.entities.push({
                title:entityLabel
            });
            console.log(entityList);
            console.log(block);
            this.setState({
                multiSelectEntityList: entityList,
                newBlock: block,
                newEntity: ''
            });
        }       
    }
    
    handleChange(event, type) {

        var shouldUpdate = true;
        if(type!="date"){
            var lastChar = event.target.value[event.target.value.length-1];
            if(lastChar=='\n' || lastChar=='\t'){
                shouldUpdate=false;
            }
        }

        if(shouldUpdate){
            var block = this.state.newBlock;
            if(type=="title"){
                block.title = event.target.value;
                this.setState({newBlock: block});
            }
            else if(type=="summary"){
                block.summary = event.target.value;
                this.setState({newBlock: block});
            }
            else if(type=="new-entity"){
                this.setState({newEntity: event.target.value});
            }
            else if(type == "date"){
                block.blockDate = {
                    date: event.getDate(),
                    month: event.getMonth(),
                    year: event.getFullYear()
                };
                console.log(block.blockDate);
                this.setState({
                    date: event,
                    newBlock: block
                });
            }

        }
      }

    updateEvidence(oldEvidence, newEvidence, isUpdate, isDelete){
          var block = this.state.newBlock;

          if(isNullOrUndefined(block.evidences)){
              block.evidences=[];
          }
          if(isDelete){
                block.evidences = block.evidences.filter(
                    ev => ((ev.evidenceLink != oldEvidence.evidenceLink) ||
                    (ev.supportingDetails != oldEvidence.supportingDetails))
                )
          }
          else if(isUpdate){
          for(var i=0;i<block.evidences.length;i++){
              if(block.evidences[i].supportingDetails == oldEvidence.supportingDetails
                 && block.evidences[i].evidenceLink == oldEvidence.evidenceLink){
                    
                    block.evidences[i] = newEvidence;
                 }
          }
        }

        this.setState({newBlock: block});
      }

    addEvidence(){
        var block = this.state.newBlock;
        var newEvidence={
            evidenceLink:'',
            evidenceType:'',
            supportingDetails:''
        }

        if(isNullOrUndefined(block.evidences))
            block.evidences = [];
        block.evidences.push(newEvidence);
        this.setState({newBlock: block});
      }

    singleBlockEvidence(blockEvidence){
        var isClicked = (blockEvidence.supportingDetails =='' && blockEvidence.evidenceLink == '');
        return(
                <DraftBlockEvidenceView
                    isClicked={isClicked}
                    evidence={blockEvidence}
                    updateEvidence = {this.updateEvidence} 
                />
        );
    }

    populateEntitiesAndEvidencesToBlock(){
        var block = this.state.newBlock;
        block.entities = [];
        var list = this.state.multiSelectEntityList;
        for(var i=0; i<list.length; i++){
            if(list[i].value){
                block.entities.push({
                    title: list[i].label,
                    type:"None"
                });
            }
        }  

        if(isNullOrUndefined(block.evidences)){
            block.evidences=[];
        }
        
        this.setState({
            newBlock: block
        });
    }

    saveDraftBlock(){
        this.populateEntitiesAndEvidencesToBlock();
        this.props.updateBlock(this.state.newBlock, this.props.draftBlock,'SAVE');
    }

    submitDraftBlock(){
        this.populateEntitiesAndEvidencesToBlock();
        this.props.updateBlock(this.state.newBlock, this.props.draftBlock,'SUBMIT');
    }

    cancelDraftBlock(){
        console.log(this.state.newBlock);
        console.log(this.props.draftBlock);
        this.props.updateBlock(this.state.newBlock, this.props.draftBlock,'CANCEL');
    }

    removeDraftBlock(){
        this.props.updateBlock(this.state.newBlock, this.props.draftBlock,'DELETE');
    }

    renderDate(){
        return (
            <div>
                {this.state.addDate?
                    <DatePicker
                    selected={this.state.date}
                    onChange={(date) => {this.handleChange(date,"date")}}
                    />
                    :
                    null
                }
            </div>
        );
    }

    renderTime(){
        return (
            <div>
                {this.state.addTime?
                    <div></div>
                    :
                    null
                }
            </div>
        )
    }

    renderTimeOption(){
        return (
                    <div style={{marginTop:'5px', marginBottom:'5px'}}>
                        <span style={{fontSize:'0.8em', fontWeight:'bold'}}> Time: </span>
                        <button 
                            className="addDateTimeButton" 
                            onClick={this.changeTimeStatus}>
                            {!this.state.addTime?
                            <AddIcon/>
                            :
                            <ClearIcon/>
                            }
                        </button>
                        {this.renderTime()}  
                    </div>
        );
    }
      
    EditSingleBlock(listItem, index){

        var renderEvidenceList = "";
        if(!isNullOrUndefined(this.state.newBlock.evidences)){
            console.log(this.state.newBlock.evidences);
            renderEvidenceList = this.state.newBlock.evidences.map((blockEvidence, index) => 
                this.singleBlockEvidence(blockEvidence)
            );            
        }

        return(

            <div className="draft-block-container">
                <div className="draft-options-container">
                    <button 
                        className="saveBlockButton" 
                        onClick={this.saveDraftBlock}>
                            <SaveIcon/>
                    </button>
                    <button 
                        className="submitBlockButton" 
                        onClick={this.submitDraftBlock}>
                            <DoneAllIcon/>
                    </button>
                    <button 
                        className="cancelBlockButton" 
                        onClick={this.cancelDraftBlock}>
                            <ClearIcon/>
                    </button>
                    <button 
                        className="deleteBlockButton" 
                        onClick={this.removeDraftBlock}>
                            <DeleteIcon/>
                    </button>    
                </div>
                <form>
                <label>
                    <Textarea 
                        type="text"
                        placeholder = "Title of your contribution."
                        value={this.state.newBlock.title}
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
                    placeholder = "Summary of your contribution."
                    value={this.state.newBlock.summary}
                    onChange={(e) => { this.handleChange(e,"summary")}}
                    maxRows="13"
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

                <div className="draft-box-datetime-container"> 
                    <h6 style={{marginBottom:'3px'}}>When did the event described here happen? (Only if your block describes an event)</h6>
                    <div style={{marginTop:'5px', marginBottom:'5px'}}>
                        <span style={{fontSize:'0.8em', fontWeight:'bold'}}> Date: </span>
                        <button 
                            className="addDateTimeButton" 
                            onClick={this.changeDateStatus}>
                            {!this.state.addDate?
                            <AddIcon/>
                            :
                            <ClearIcon/>
                            }
                        </button>
                        {this.renderDate()}  
                    </div>
                    {this.state.addDate?
                        this.renderTimeOption()
                        :
                        null}
                                       
                </div>

                <div className="draft-box-entity-dropdown-container">
                    <h6 style={{marginBottom:'3px'}}>Entities (Who all are involved?)</h6>
                    <MultiSelectReact 
                        options={this.state.multiSelectEntityList}
                        optionClicked={this.entityClicked.bind(this)}
                        selectedBadgeClicked={this.selectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={this.selectedOptionsStyles}
                        optionsListStyles={this.optionsListStyles} 
                        isTextWrap={false} 
                        />
                    <div className="draft-add-new-entity-container">
                        <Textarea 
                                type="text"
                                value={this.state.newEntity}
                                onChange={(e) => { this.handleChange(e,"new-entity")}}
                                placeholder = "New Entity"
                                maxRows="2"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'darkgrey',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    width:'40%'
                                    }}/>
                        <button 
                        className="addEntityButton" 
                        onClick={this.addEntityToList}>
                            <AddIcon/>
                        </button>            
                    </div>       
                </div>

                <div className="draft-box-evidence-container">
                    <h6 style={{marginBottom:'3px',marginTop:'3px'}}>Evidences</h6>
                    <div>
                        {renderEvidenceList}
                    </div>
                    <button 
                        className="addEvidenceButton" 
                        onClick={this.addEvidence}
                        >
                            <AddIcon />
                        </button>   
                </div>
            </div>

        );
    }

    componentDidMount(){
        this.generateMultiSelectEntityList();

        //Deepcopy props to state
        const blockStr = JSON.stringify(this.props.draftBlock);
        var block = JSON.parse(blockStr);
        var date = new Date();
        var addDate = false;
        if(("blockDate" in block) && block.blockDate!=null){
            date.setFullYear(block.blockDate.year);
            date.setMonth(block.blockDate.month);
            date.setDate(block.blockDate.date);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            addDate = true;
            console.log(block.blockDate);
            console.log(date);
            console.log(addDate);
        }
        this.setState({
            newBlock:JSON.parse(blockStr),
            date: date,
            addDate: addDate
        });
    }

    render(){
        return(
            <div>
                {this.EditSingleBlock()}
            </div>
        );
    }

}
export default DraftBlockComponent;