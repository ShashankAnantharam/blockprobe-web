import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import Textarea from 'react-textarea-autosize';
import './EntityPane.css';
import * as firebase from 'firebase';
import 'firebase/firestore';

class EntityPaneView extends React.Component {

    constructor(props){
        super(props);
        // closeEntityPane, this.props.investigationGraph, bId, uIdHash

        this.state={
            entities:[],
            haveEntitiesLoaded: false,
            newEntity: '',
            entityPresent: {}
        }

        this.addEntityToList = this.addEntityToList.bind(this);
        this.initEntities = this.initEntities.bind(this);
        this.getEntities = this.getEntities.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
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


    handleChange(event, type) {

        var shouldUpdate = true;
        if(type!="date" && type!="time"){
            var lastChar = event.target.value[event.target.value.length-1];
            if(lastChar=='\n' || lastChar=='\t'){
                shouldUpdate=false;
            }

            if(lastChar == ','){
                //Add entity to list and clear everything else
                var str= event.target.value;
                str = str.substr(0,str.length-1);
                if(str.length > 0)
                    this.addEntityToList(str);
                str = '';
                this.setState({newEntity: str});
                return;
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
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
            .collection("users").doc(this.props.uIdHash).collection("session")
            .doc("entityPane").set({
                entities:entityList
            });
        this.setState({entities:entityList});
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
                                    width:'40%',
                                    marginLeft:'1em'
                                    }}/>
                <div className="draft-add-new-entity-container">                       
                        <button 
                            className="cancelBlockButton" 
                            onClick={this.props.closeEntityPane}>
                                <div>Cancel</div>
                        </button>          
                </div>   
            </div>
        );
    }
}
export default EntityPaneView;