import React, { Component } from 'react';
import * as firebase from 'firebase';
import SingleBlock from '../view/SingleBlock';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AddIcon from '@material-ui/icons/Add'
import './UserBlocksComponent.css';
import { isNullOrUndefined } from 'util';

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
            blockStateMap:{},
            newBlock: {
                title:'',
                summary:'',
                blockState:'DRAFT',
                entities:[]
            },
            isCreateBlockClicked:false
        }
        //props include bpId, uId
        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        this.modifyBlockList = this.modifyBlockList.bind(this);
        this.modifyBlockListWrapper = this.modifyBlockListWrapper.bind(this);
        this.selectBlock = this.selectBlock.bind(this);
        this.renderSingleBlock = this.renderSingleBlock.bind(this);
        this.createBlock = this.createBlock.bind(this);
        this.deleteNewBlock = this.deleteNewBlock.bind(this);
        this.deleteDraftBlock = this.deleteDraftBlock.bind(this);
        this.addDraftBlock = this.addDraftBlock.bind(this);
        this.updateDraftBlock = this.updateDraftBlock.bind(this);
        this.getRandomReviewer = this.getRandomReviewer.bind(this);
        this.giveBlockToFirstReviewer = this.giveBlockToFirstReviewer.bind(this);
        this.submitDraftBlock = this.submitDraftBlock.bind(this);        
    }

    getRandomReviewer(reviewerList, revMap)
    {
        if(!isNullOrUndefined(reviewerList)){
            var val = (Date.now()%reviewerList.length);
            
            for(var i=0;i<reviewerList.length;i++)
            {
                var curr=(val+i)%(reviewerList.length);
                // console.log(reviewerList[i]);
                if(!(reviewerList[curr].id in revMap))
                {
                    return reviewerList[curr];
                }
            }
        }

        return null;
    }

    giveBlockToFirstReviewer(block)
    {
        var revMap={};

        //Deepcopy of reviewerList
        const reviewersStr = JSON.stringify(this.props.bpDetails.reviewers);
        var reviewersList = JSON.parse(reviewersStr);
        var randomReviewer = this.getRandomReviewer(reviewersList, revMap);

        if(randomReviewer!=null) {

            block.blockState = "TO REVIEW";

            revMap[randomReviewer.id]="-";
            firebase.firestore().collection("Blockprobes").
                doc(block.bpID).
                collection("users").doc(randomReviewer.id).
                collection("userBlocks").
                doc(block.key+"_r").set(block);

        }
        else{
            console.log("No other reviewers left!");
        }



        var newBlock = {
            actionType: block.actionType,
            blockAuthor: this.state.uIdHash,
            entities: isNullOrUndefined(block.entities)?null:block.entities,
            evidences: isNullOrUndefined(block.evidences)?null:block.evidences,
            reviewers:revMap,
            summary: block.summary,
            timestamp: block.timestamp,
            title: block.title,
        }

        firebase.database().ref("Blockprobes/"+block.bpID
                        +"/reviewBlocks/"+block.key).set(newBlock);

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

    deleteDraftBlock(blockKey){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(blockKey).delete();
    }

    updateDraftBlock(blockKey, newBlock){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(blockKey).set(newBlock);

    }

    addDraftBlock(block){
        block.timestamp = Date.now();
        var newDraftBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(block.timestamp)).digest('hex');

        //(uidHash + time)
        block.key = newDraftBlockId;
        block.actionType = "ADD";
        block.bpID = this.props.bId;       
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(block.key).set(block);

        this.setState({isCreateBlockClicked:false});
    }

    submitDraftBlock(block){
        if(isNullOrUndefined(block.key)){
            block.timestamp = Date.now();
           var newDraftBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(block.timestamp)).digest('hex');

            //(uidHash + time)
            block.key = newDraftBlockId;
            block.actionType = "ADD";
        }
        block.bpID = this.props.bId;

        block.blockState = "UNDER REVIEW";
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(block.key).set(block);

        this.giveBlockToFirstReviewer(block);

        this.setState({isCreateBlockClicked:false});

    }

    componentDidMount(){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").onSnapshot(
            querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'modified') {
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'removed') {
                        this.modifyBlockListWrapper(change.doc,false);
                      }
                });

            
            }
        );    
    }

    renderSingleBlock(block, scope, isNewBlock){

        if(isNullOrUndefined(block)){
            return null;
        }

        return(
            <SingleBlock 
            block={block} 
            selectBlock={this.selectBlock}
            investigationGraph={this.props.investigationGraph}
            isNewBlock={isNewBlock}
            deleteNewBlock={this.deleteNewBlock}
            deleteDraftBlock = {this.deleteDraftBlock}
            addDraftBlock = {this.addDraftBlock}
            updateDraftBlock = {this.updateDraftBlock}
            submitDraftBlock = {this.submitDraftBlock}
            />
        );
    }

    selectBlock(block){
        this.props.selectBlock(block);
    }

    createBlock(){
        // var newDraftBlockId = this.state.shajs('sha256').update(this.props.uId+String(Date.now())).digest('hex');
        this.setState({isCreateBlockClicked:true});
    }

    deleteNewBlock(){
        this.setState({isCreateBlockClicked:false});
    }

    render(){

        const scope = this;
        const successBlocksListRender = Object.keys(this.state.successBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.successBlocks[blockId], scope, false)
        ));

        const toReviewBlocksListRender = Object.keys(this.state.toReviewBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.toReviewBlocks[blockId], scope, false)
        ));

        const inReviewBlocksListRender = Object.keys(this.state.inReviewBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.inReviewBlocks[blockId], scope, false)
        ));

        const draftBlocksListRender = Object.keys(this.state.draftBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.draftBlocks[blockId], scope, false)
        ));


        return(
            <div>
                {!this.state.isCreateBlockClicked?
                    <button 
                    className="addBlockButton" 
                    onClick={this.createBlock}>
                        <AddIcon/>
                    </button>
                    :
                    <div>
                        {this.renderSingleBlock(this.state.newBlock,this, true)}
                    </div> 
                }
                                
                {Object.keys(this.state.draftBlocks).length>0?
                <div>
                    <h4 className="block-list-title">DRAFT</h4>
                    <div className="block-list-content">
                        <List>{draftBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.inReviewBlocks).length>0?
                <div>
                    <h4 className="block-list-title">IN REVIEW</h4>
                    <div className="block-list-content">
                        <List>{inReviewBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.toReviewBlocks).length>0?
                <div>
                    <h4 className="block-list-title">TO REVIEW</h4>
                    <div className="block-list-content">
                        <List>{toReviewBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.successBlocks).length>0?
                <div>
                    <h4 className="block-list-title">SUCCESSFUL</h4>
                    <div className="block-list-content">
                        <List>{successBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

            </div>
        );
    }


}
export default UserBlocksComponent;