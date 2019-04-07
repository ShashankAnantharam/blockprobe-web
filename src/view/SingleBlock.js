import React, { Component } from 'react';
import * as firebase from 'firebase';
import './SingleBlock.css';

class SingleUserBlock extends React.Component {

    constructor(props){
        super(props);

        this.state={
            isBlockClicked: false
        }
        this.BlockEntity = this.BlockEntity.bind(this);
        this.clickBlockInDraft = this.clickBlockInDraft.bind(this);
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
        <div className="user-block-div"
        onClick={() => { this.clickBlockNotInDraft(this.props.block)}}>
            <h4 className="user-block-title">{this.props.block.title}</h4>
            <p className="user-block-text">
                {this.props.block.summary}
            </p>
            <div>
                {renderBlockEntities}
            </div>
            
        </div>
        );
        
    }

    clickBlockInDraft(){
        this.setState({
            isBlockClicked: !this.state.isBlockClicked
        });
    }

    renderDraftBlock(){
        return(
            <div onClick={this.clickBlockInDraft}>
                {this.state.isBlockClicked?
                    <div>Clicked</div>:
                    <div>NotClicked</div>}
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