import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import Textarea from 'react-textarea-autosize';
import Joyride from 'react-joyride';
import './EntityPane.css';
import * as firebase from 'firebase';
import 'firebase/firestore';

class EntityPaneView extends React.Component {

    constructor(props){
        super(props);
        // closeEntityPane, this.props.investigationGraph, bId, uIdHash, finishTooltip

        this.state={
            entities:[],
            haveEntitiesLoaded: false,
            newEntity: '',
            entityPresent: {},
            tooltipText:{
                entityPane:[                    
                    {                    
                        title: 'Copy paste the following text and press enter',
                        target: '.createNewEntitiesPane',
                        content: 'Ironman, Thor, Rogers, Asgard, Thanos',
                        disableBeacon: true
                    }             
                ],
                cancelButton:[                    
                    {                    
                        title: 'Your entities have been defined!',
                        target: '.cancelEntityPaneButton',
                        content: 'The characters of your story are Ironman, Thor, Rogers, Asgard, Thanos.\n Click on cancel to go back now.',
                        disableBeacon: false
                    }             
                ]
            },
            showTooltip:{
                cancel: false
            }
        }

        this.addEntityToList = this.addEntityToList.bind(this);
        this.initEntities = this.initEntities.bind(this);
        this.getEntities = this.getEntities.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidUpdate(){

    }

    initEntities(snapshot, scope){
        var entities = snapshot.data().entities;
        // console.log(entities);
        var isEntityPresent = scope.state.entityPresent;
        for(var i=0; i<entities.length;i++){
            isEntityPresent[entities[i].label] = true;
        }
        scope.props.updateEntityPaneList(entities);
        scope.setState({
            entityPresent: isEntityPresent,
            entities: entities,
            haveEntitiesLoaded: true
        });
    }

    componentDidMount(){
        //Get data for entities
        var scope = this;
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.props.uIdHash).collection("session")
        .doc("entityPane").get().then((snapshot) => {
            if(snapshot.exists)
                scope.initEntities(snapshot,scope);
        });
    }

    handleKeyDown(event){
        if (event.key === 'Enter') {
            var totalStr= event.target.value;
            var entityArr = totalStr.split(',');
            for(var i=0; i<entityArr.length; i++){
                var str = entityArr[i].trim();
                if(str.length > 0)
                    this.addEntityToList(str);
            }
            str = '';
            var showTooltip = this.state.showTooltip;

            console.log('here1');
            if(entityArr.length > 0){
                console.log(entityArr);
                if(this.props.entityPaneTooltip){
                   
                    showTooltip.cancel = true;
                    console.log(showTooltip);
                }                
            }               
            this.setState({
                newEntity: str,
                showTooltip: showTooltip
            }); 
          }
    }


    handleChange(event, type) {

        var shouldUpdate = true;
        if(type!="date" && type!="time"){
            var lastChar = event.target.value[event.target.value.length-1];
            if(lastChar=='\n' || lastChar=='\t'){
                shouldUpdate=false;
            }          
        }

        if(shouldUpdate){
            if(type=="new-entity"){
                this.setState({newEntity: event.target.value});
            }

        }
      }

    addEntityToList(entityLabel){
        var entityList = this.state.entities;
        var isEntityPresent = this.state.entityPresent;
        
        if(!(entityLabel in isEntityPresent)){
            entityList.push({                
                canRemove: true, 
                label: entityLabel, 
            });
            isEntityPresent[entityLabel] = true;

            firebase.firestore().collection("Blockprobes").doc(this.props.bId)
            .collection("users").doc(this.props.uIdHash).collection("session")
            .doc("entityPane").set({
                entities:entityList
            });

            this.props.updateEntityPaneList(this.getEntities());
            this.setState({
                entities: entityList,
                newEntity: '',
                entityPresent: isEntityPresent
            });
        }       
    }

    removeEntity(entity){
        var entityList = this.state.entities.filter(e => e.label!=entity.label);
        var isEntityPresent = this.state.entityPresent;
        delete isEntityPresent[entity.label];
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
            .collection("users").doc(this.props.uIdHash).collection("session")
            .doc("entityPane").set({
                entities:entityList
            });
        this.setState({
            entities: entityList,
            entityPresent: isEntityPresent
        });
    }

    BlockEntity(entity){
        return(
        <span className="block-entity">
            {entity.label}
            {entity.canRemove? 
            <a style={{marginLeft:'5px', color: 'black', cursor: 'pointer'}} 
            onClick={() => { this.removeEntity(entity)}}>X</a>
            : 
            null}
        </span>
        );   
    }

    getEntities(){

        var entities = this.state.entities;
        var isEntityPresent = this.state.entityPresent;
        if(this.props.investigationGraph !=null){
            Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
                if(!(entityLabel in isEntityPresent)){
                    entities.push({                
                        canRemove: false, 
                        label: entityLabel, 
                    });
                }
                isEntityPresent[entityLabel] = false;
            });
        }

        for(var i=0;i<entities.length;i++){
            entities[i].canRemove = isEntityPresent[entities[i].label];
        }

        return entities;
    }

    render(){

        /*
         Create render template for the entities
         */
        var renderBlockEntities = '';
        var entities = this.getEntities();
        if(entities!=null && entities.length>0){            
            renderBlockEntities = entities.map((blockEntity) => 
               this.BlockEntity(blockEntity)
           );            
       }

        return(
            <div style={{marginBottom:'20px'}}>
                <div>
                    {renderBlockEntities}
                </div>
                <Joyride
                    steps={this.state.tooltipText.entityPane}
                    run = {this.props.entityPaneTooltip}                    
                    /> 
                <Textarea 
                                type="text"
                                className="createNewEntitiesPane"
                                value={this.state.newEntity}
                                onChange={(e) => { this.handleChange(e,"new-entity")}}
                                onKeyDown={(e) => { this.handleKeyDown(e)}}
                                placeholder = "Input entity names seperated by ',' and press 'Enter key'"
                                maxRows="2"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'darkgrey',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    minWidth:'60%',
                                    maxWidth: '80%',
                                    marginLeft:'1em'
                                    }}/>
                <Joyride
                    steps={this.state.tooltipText.cancelButton}
                    run = {this.state.showTooltip.cancel}                    
                    />                                     
                <div className="draft-add-new-entity-container">                                       
                        <button 
                            className="cancelBlockButton cancelEntityPaneButton" 
                            onClick={this.props.closeEntityPane}>
                                <div>Cancel</div>
                        </button>          
                </div>   
            </div>
        );
    }
}
export default EntityPaneView;