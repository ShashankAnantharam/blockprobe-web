import React, { Component } from 'react';
import * as firebase from 'firebase';
import SingleBlock from '../view/SingleBlock';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

////var uIdHash = crypto.createHash('sha256').update(`${userId}`).digest('hex');

class UserBlocksComponent extends React.Component {
    
    constructor(props){
        super(props);

        this.state={
            uIdHash:'',
            shajs:null,
            draftBlocks:{},
            successBlocks:{},
            toReviewBlocks:{},
            inReviewBlocks:{},
            blockStateMap:{}
        }
        //props include bpId, uId
        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        this.modifyBlockList = this.modifyBlockList.bind(this);
        this.modifyBlockListWrapper = this.modifyBlockListWrapper.bind(this);
        this.selectBlock = this.selectBlock.bind(this);
        this.renderSingleBlock = this.renderSingleBlock.bind(this);
    }


    modifyBlockList(block, add){
        if(block.blockState=="SUCCESSFUL"){
            var currMap = this.state.successBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                successBlocks:currMap
            });
        }
        else if(block.blockState=="UNDER REVIEW"){
            var currMap = this.state.inReviewBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                inReviewBlocks:currMap
            });
            console.log(block.blockState);
            console.log(block);
            console.log(add);
        }
        else if(block.blockState=="TO REVIEW"){
            var currMap = this.state.toReviewBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                toReviewBlocks:currMap
            });
        }
        else if(block.blockState=="DRAFT"){
            var currMap = this.state.draftBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                draftBlocks:currMap
            });
        }
    }


    modifyBlockListWrapper(doc, add){
        var block = doc.data();
        var blockId = doc.id;
        var blockStateMap = this.state.blockStateMap;
        if(blockId in blockStateMap){
            var prevState = blockStateMap[blockId];
            var oldBlock = {
                key:block.key,
                blockState: prevState
            };
            //delete old block
            this.modifyBlockList(oldBlock,false);

            if(add){
                //add new block
                this.modifyBlockList(block,true);

                //Update blockstate
               blockStateMap[blockId] = block.blockState;
            }
        }
        else if(add){
            //First time block gets added
            blockStateMap[blockId] = block.blockState;
            this.modifyBlockList(block,true);
        }
    }

    componentDidMount(){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").onSnapshot(
            querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        //console.log('New block: ', change.doc.data());
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'modified') {
                        //console.log('Modified block: ', change.doc.data());
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'removed') {
                        //console.log('Removed block: ', change.doc.data());
                        this.modifyBlockListWrapper(change.doc,false);
                      }
                });

                console.log(this.state.successBlocks);
                console.log(this.state.inReviewBlocks);
                console.log(this.state.toReviewBlocks);
                console.log(this.state.draftBlocks);
            }
        );    
    }

    renderSingleBlock(block, scope){
        return(
            <SingleBlock 
            block={block} 
            selectBlock={this.selectBlock}/>
        );
    }

    selectBlock(block){
        this.props.selectBlock(block);
    }

    render(){

        const scope = this;
        //console.log(this.props.blockprobes)
        const successBlocksListRender = Object.keys(this.state.successBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.successBlocks[blockId], scope)
        ));


        return(
            <div>
                <div>DRAFT</div>

                <div>IN REVIEW</div>

                <div>TO REVIEW</div>

                <div>SUCCESSFUL</div>
                <div>
                    <List>{successBlocksListRender}</List>
                </div>

            </div>
        );
    }


}
export default UserBlocksComponent;