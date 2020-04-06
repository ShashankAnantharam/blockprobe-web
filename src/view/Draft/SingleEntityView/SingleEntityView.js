import React, { Component } from 'react';
import Textarea from 'react-textarea-autosize';
import  * as Utils from '../../../common/utilSvc';
import './SingleEntityView.css';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { isNull, isNullOrUndefined } from 'util';

class SingleEntityView extends React.Component {

    constructor(props){
        super(props);
        //entity, bpId, uIdHash

        this.state={
            entityName: null,
            label: null
        }

        if(!isNullOrUndefined(props.entity) && !isNullOrUndefined(props.entity.label)){
            this.state.entityName = JSON.parse(JSON.stringify(props.entity.label));
            this.state.label = JSON.parse(JSON.stringify(props.entity.label));
        }

        this.handleChange = this.handleChange.bind(this);
        this.isEntityNameChanged = this.isEntityNameChanged.bind(this);
        this.renameEntity = this.renameEntity.bind(this);
        this.deleteEntity = this.deleteEntity.bind(this);
        this.createBlockForEntityChange = this.createBlockForEntityChange.bind(this);
    }

    handleChange(event, type) {
        let str = event.target.value;
        var shouldUpdate = true;
        shouldUpdate = Utils.shouldUpdateText(str, ['\n','\t']);
        if(shouldUpdate){
            if(type=="entity-name"){
                this.setState({entityName: event.target.value});
            }
        }
      }

    isEntityNameChanged(){
        let entityName = this.state.entityName;
        if(!isNullOrUndefined(entityName) && !isNullOrUndefined(this.props.entity.label) 
            && entityName.length>0 && entityName!=this.props.entity.label)
            return true;
        return false;
    }

    componentWillReceiveProps(newProps){
        if(newProps.entity != this.props.entity){
            let entityName = JSON.parse(JSON.stringify(newProps.entity.label));
            let label = JSON.parse(JSON.stringify(newProps.entity.label));
            this.setState({
                entityName:entityName,
                label: label}
            );
        }
    }

    createBlockForEntityChange(currEntity, newEntity){
        let entityMap = {
            curr: currEntity,
            new: newEntity
        };

        let fullBlock = {
            title: '',
            summary: '',
            entities: [],
            evidences: [],
            referenceBlock: null,
            timestamp: Date.now(),
            actionType: 'entityChange',
            entityMap: entityMap
        };

        this.props.commitBlockToBlockprobe(fullBlock);

    }

    renameEntity(){
        let newName = this.state.entityName;
        let oldName = JSON.parse(JSON.stringify(this.props.entity.label));

        this.createBlockForEntityChange(oldName,newName);
    }

    deleteEntity(){
        let newName = null;
        let oldName = JSON.parse(JSON.stringify(this.props.entity.label));

        this.createBlockForEntityChange(oldName,newName);
    }

    render(){
        return(
            <div>
                <h4 className="manageSingleEntityTitle"> Manage entity {this.state.label}</h4>
                <div className="entityEditLabelContainer">
                    <div style={{marginBottom:'6px'}}>Edit Name</div>
                    <Textarea 
                                type="text"
                                value={this.state.entityName}
                                onChange={(e) => { this.handleChange(e,"entity-name")}}
                                placeholder = "Entity name"
                                maxRows="3"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderRadius:'5px',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'black',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    minWidth:'40%',
                                    maxWidth: '50%',
                                    color: 'darkBlue',
                                    fontWeight:'600'
                                    }}/>
                </div>
                <div className="entityOptionsContainer">
                    {this.isEntityNameChanged()?
                        <button 
                            className="renameEntityButton" 
                            onClick={this.renameEntity}>
                                <div>Rename</div>
                        </button>
                        :
                        null
                    }

                    <button 
                        className="deleteEntityButton" 
                        onClick={this.deleteEntity}>
                            <div>Delete</div>
                    </button>
                        
                </div>

            </div>
        )
    }
}
export default SingleEntityView;