import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import Textarea from 'react-textarea-autosize';
import './EntityPane.css';

class EntityPaneView extends React.Component {

    constructor(props){
        super(props);
        // closeEntityPane

        this.state={
            entities:[],
            haveEntitiesLoaded: false,
            newEntity: ''
        }

        this.addEntityToList = this.addEntityToList.bind(this);
        this.getEntities = this.getEntities.bind(this);
        this.removeEntity = this.removeEntity.bind(this);
    }

    componentDidMount(){
        //Get data for entities
        this.setState({haveEntitiesLoaded:true});

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

    addEntityToList(){
        var isEntityAlreadyPresent = false;
        var entityList = this.state.entities;
        var entityLabel = this.state.newEntity;
        for( var i=0; i<entityList.length; i++){
            var entityItem = entityList[i]
            if(entityItem.label == entityLabel){
                isEntityAlreadyPresent=true;
                break;
            }
        }
        if(!isEntityAlreadyPresent){
            var count = entityList.length;
            count = count + 1;
            entityList.push({                
                canRemove: true, 
                label: entityLabel, 
            });

            this.setState({
                entities: entityList,
                newEntity: ''
            });
        }       
    }

    removeEntity(entity){
        var entityList = this.state.entities.filter(e => e.label!=entity.label);
        this.setState({entities:entityList});
    }

    BlockEntity(entity){
        return(
        <span className="block-entity">
            {entity.label}
            {entity.canRemove? 
            <a style={{marginLeft:'5px', color: 'grey', cursor: 'pointer'}} 
            onClick={() => { this.removeEntity(entity)}}>X</a>
            : 
            null}
        </span>
        );   
    }

    getEntities(){
        return this.state.entities;
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
                                    width:'40%'
                                    }}/>
                <div className="draft-add-new-entity-container">                        
                        <button 
                        className="addEntityButton" 
                        onClick={this.addEntityToList}>
                            <AddIcon/>
                        </button>  
                        <button 
                            className="cancelBlockButton" 
                            onClick={this.props.closeEntityPane}>
                                <ClearIcon/>
                        </button>          
                </div>   
            </div>
        );
    }
}
export default EntityPaneView;