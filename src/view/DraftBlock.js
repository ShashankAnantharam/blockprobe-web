import React, { Component } from 'react';
import * as firebase from 'firebase';
import './DraftBlock.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Textarea from 'react-textarea-autosize';
import  MultiSelectReact  from 'multi-select-react';
import { isNullOrUndefined } from 'util';

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


    constructor(props){
        super(props);

        //props:draftBlock, bpId, uId 
        this.state={
            newBlock: this.props.draftBlock,
            newEntity: '',
            multiSelectEntityList: []
        }

        this.handleChange = this.handleChange.bind(this);
        this.generateMultiSelectEntityList = this.generateMultiSelectEntityList.bind(this);
        this.addEntityToList = this.addEntityToList.bind(this);
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
        Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
            entityList.push({                
                    value: false, 
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
                newBlock: block
            });
        }       
    }
    
    handleChange(event, type) {
        var shouldUpdate = true;
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t'){
            shouldUpdate=false;
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

        }
      }

      
    EditSingleBlock(listItem, index){
        return(

            <div className="draft-block-container">
                <form>
                <label>
                    <Textarea 
                        type="text"
                        value={this.state.newBlock.title}
                        onChange={(e) => { this.handleChange(e,"title")}}
                        maxRows="2"
                        minRows="1"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'lightgrey',
                            borderBottomWidth:'0px',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'95%'
                            }}/>
                    <Textarea 
                    type="text"
                    value={this.state.newBlock.summary}
                    onChange={(e) => { this.handleChange(e,"summary")}}
                    maxRows="13"
                    minRows="3"
                    style={{
                        background: 'white',
                        borderWidth:'2px', 
                        borderStyle:'solid', 
                        borderColor:'lightgrey',
                        borderTopWidth:'0px',
                        paddingTop:'6px',
                        paddingBottom:'6px',
                        width:'95%'
                        }}/>
                </label>
                </form>

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
                                    borderColor:'lightgrey',
                                    borderBottomWidth:'0px',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    width:'40%'
                                    }}/>
                        <button 
                        className="addEntityButton" 
                        onClick={this.addEntityToList}>
                        Add New Entity
                        </button>            
                    </div>       
                </div>
            </div>

        );
    }

    componentDidMount(){
        this.generateMultiSelectEntityList();
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