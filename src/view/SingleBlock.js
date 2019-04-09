import React, { Component } from 'react';
import * as firebase from 'firebase';
import './SingleBlock.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DraftBlockComponent from './DraftBlock';

class SingleUserBlock extends React.Component {

    constructor(props){
        super(props);

        this.state={
            isBlockClicked: false
        }
        this.BlockEntity = this.BlockEntity.bind(this);
        this.clickBlockInDraft = this.clickBlockInDraft.bind(this);
        this.revertBlockInDraft = this.revertBlockInDraft.bind(this);
        this.clickBlockNotInDraft = this.clickBlockNotInDraft.bind(this);
    }

    BlockEntity(entity){
        return(
        <span className="user-block-entity">
            {entity.title}
        </span>
        );  
    }

    clickBlockNotInDraft(block){
        this.props.selectBlock(block);
    }

    renderViewOnlyBlock(){

        var renderBlockEntities = '';
        if(this.props.block.entities!=null && this.props.block.entities.length>0){            
            renderBlockEntities = this.props.block.entities.map((blockEntity) => 
               this.BlockEntity(blockEntity)
           );            
       }

       return(
            <ListItem button 
                    onClick={() => { this.clickBlockNotInDraft(this.props.block)}}
                    style={{width:'100%'}}
                    >
                    <ListItemText 
                    primary={this.props.block.title} 
                    secondary={this.props.block.summary}/>
                </ListItem>        
        );
        
    }

    clickBlockInDraft(){
            if(!this.state.isBlockClicked){
            this.setState({
                isBlockClicked: true
            });
        }
    }

    revertBlockInDraft(){
        if(this.state.isBlockClicked){
            this.setState({
                isBlockClicked: false
            });
        }
    }

    renderDraftBlock(){
        return(
            <div onClick={this.clickBlockInDraft}>
                {this.state.isBlockClicked?
                    <div>
                        <DraftBlockComponent 
                        draftBlock={this.props.block}
                        investigationGraph = {this.props.investigationGraph}
                        />
                    </div>                    
                    :
                    <div>
                        <ListItem button 
                            onClick={() => { this.clickBlockInDraft()}}
                            style={{width:'100%'}}
                            >
                            <ListItemText 
                            primary={this.props.block.title} 
                            secondary={this.props.block.summary}/>
                        </ListItem>
                    </div>
                }
            </div>
        )
    }

    render(){

        return(
            <div>
                {this.props.block.blockState=="DRAFT"?
                this.renderDraftBlock():
                this.renderViewOnlyBlock()
                }
            </div>
        )

    }
}
export default SingleUserBlock;