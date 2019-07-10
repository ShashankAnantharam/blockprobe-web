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
        //props: isNewBlock, deleteNewBlcok, addDraftBlock, entityPane, draftBlockTooltip, finishTooltip

        this.state={
            isBlockClicked: false
        }
        this.BlockEntity = this.BlockEntity.bind(this);
        this.clickBlockInDraft = this.clickBlockInDraft.bind(this);
        this.revertBlockInDraft = this.revertBlockInDraft.bind(this);
        this.clickBlockNotInDraft = this.clickBlockNotInDraft.bind(this);
        this.updateDraftBlock = this.updateDraftBlock.bind(this);

        if(props.block.title=='' && props.block.summary==''){
            this.state.isBlockClicked = true;
        }
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
                        updateBlock = {this.updateDraftBlock}
                        entityPane = {this.props.entityPane}
                        draftBlockTooltip = {this.props.draftBlockTooltip}
                        finishTooltip = {this.props.finishTooltip}
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

    updateDraftBlock(newBlock, oldBlock, updateType){
        if(updateType=='SAVE'){
            //SAVE
            if(this.props.isNewBlock){
                this.props.addDraftBlock(newBlock);
            }
            else{
                this.props.updateDraftBlock(newBlock.key, newBlock);
            }

            this.setState({
                isBlockClicked: false
            });
        }
        else if(updateType=='SUBMIT'){
            //SUBMIT

            this.props.submitDraftBlock(newBlock);

            this.setState({
                isBlockClicked: false
            });
        }
        else if(updateType=='CANCEL'){
            //CANCEL CHANGES
            if(!this.props.isNewBlock){
                
                //If block is an existing draft, then just revert to view state if changes cancelled
                this.setState({
                    isBlockClicked: false
                });
            }
            else{

                //If block is a new block, then delete it
                this.props.deleteNewBlock();
            }
        }
        else if(updateType=='DELETE'){
            //DELETE CHANGES

            if(this.props.isNewBlock){

                //If block is a new block, then delete it
                this.props.deleteNewBlock();
            }
            else{
                this.props.deleteDraftBlock(newBlock.key)
                this.setState({
                    isBlockClicked: false
                });
            }
        }
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