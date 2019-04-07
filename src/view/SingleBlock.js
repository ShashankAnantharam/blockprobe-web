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
        <span className="graph-block-entity">
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
        <div className="block-div"
        onClick={() => { this.clickBlockNotInDraft(this.props.block)}}>
            <h4 className="block-title">{this.props.block.title}</h4>
            <p className="block-text">
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
            isBlockClicked: !isBlockClicked
        });
    }

    renderDraftBlock(){
        return(
            <div onClick={clickBlockInDraft}>
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
                this.renderViewOnlyBlock():
                this.renderDraftBlock()
                }
            </div>
        )

    }
}
export default SingleUserBlock;