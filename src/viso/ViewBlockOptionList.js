import React, { Component } from 'react';
import * as firebase from 'firebase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PeopleIcon from '@material-ui/icons/People';
import UndoIcon from '@material-ui/icons/Undo'; 
import ThumbUpIcon from '@material-ui/icons/ThumbUp'; 
import DoneAllIcon from '@material-ui/icons/DoneAll';
import './ViewBlock.css';
import { isNullOrUndefined } from 'util';

class ViewBlockListComponent extends React.Component {

    constructor(props){
        super(props);
        //props: blockState, selectOption, canCommit, uId, selectedBlock, latestBlock, reviewersMap

        this.state={
            shajs: '',
            uIdHash: '',
        };

        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        this.selectOption = this.selectOption.bind(this);
        this.renderReviewOptionList = this.renderReviewOptionList.bind(this);
        this.renderSubmitterOptionList = this.renderSubmitterOptionList.bind(this);
        this.getRandomReviewer = this.getRandomReviewer.bind(this);
        this.giveBlockToNextReviewer = this.giveBlockToNextReviewer.bind(this);
    }

    selectOption(option){

        if(option == "revert"){

            //Deepcopy props to var
            const blockStr = JSON.stringify(this.props.selectedBlock);
            var newBlock = JSON.parse(blockStr);
            newBlock.blockState = "DRAFT";

           // console.log(newBlock);
           // console.log("Blockprobes/"+newBlock.bpID);

            firebase.firestore().collection("Blockprobes").doc(newBlock.bpID)
            .collection("users").doc(this.state.uIdHash).collection("userBlocks").
            doc(newBlock.key).set(newBlock);
            
            firebase.database().ref("Blockprobes/"+newBlock.bpID
                        +"/reviewBlocks/"+newBlock.key).remove();

            
        }
        else if(option == "upvote"){
            

            //Deepcopy of block
            const blockStr = JSON.stringify(this.props.selectedBlock);
            var newBlock = JSON.parse(blockStr);
            this.giveBlockToNextReviewer(newBlock);

            
            firebase.database().ref("Blockprobes/"+this.props.selectedBlock.bpID
                        +"/reviewBlocks/"+this.props.selectedBlock.key 
                        +"/reviewers/"+this.state.uIdHash).set("1");

            firebase.firestore().collection("Blockprobes").
                doc(this.props.selectedBlock.bpID).
                collection("users").doc(this.state.uIdHash).
                collection("userBlocks").
                doc(this.props.selectedBlock.key+"_r").delete();

                        
        }
        else if(option == "reassign_reviewer"){

            //Deepcopy of block
            const blockStr = JSON.stringify(this.props.selectedBlock);
            var newBlock = JSON.parse(blockStr);
            this.giveBlockToNextReviewer(newBlock);
        }
        else if(option == "can_commit"){
            console.log(this.props.latestBlock);

            const oldKey = this.props.selectedBlock.key;
            

            //Deepcopy of block
            const blockStr = JSON.stringify(this.props.selectedBlock);
            var newBlock = JSON.parse(blockStr);
            var newBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(newBlock.timestamp)).digest('hex');
            newBlock.timestamp = Date.now();
            newBlock.verificationHash = newBlockId;
            newBlock.previousKey = this.props.latestBlock.key;
            if(newBlock.actionType == "ADD"){
                newBlock.referenceBlock = null;
            }
            newBlock.key = this.state.shajs('sha256').update(newBlockId + newBlock.previousKey).digest('hex');            
            if(isNullOrUndefined(newBlock.blockDate)){
                newBlock.blockDate = null;
            }
            if(isNullOrUndefined(newBlock.blockTime)){
                newBlock.blockTime = null;
            }
            newBlock.blockState = "SUCCESSFUL";

            var committedBlock = JSON.parse(JSON.stringify(newBlock));
            delete committedBlock["blockState"];
            delete committedBlock["bpID"];
            console.log(newBlock);
            console.log(committedBlock);

            firebase.database().ref("Blockprobes/"+newBlock.bpID
            +"/reviewBlocks/"+oldKey).remove();

            firebase.firestore().collection("Blockprobes").
                doc(newBlock.bpID).
                collection("users").doc(this.state.uIdHash).
                collection("userBlocks").
                doc(oldKey).delete();
            
            firebase.firestore().collection("Blockprobes").
                doc(newBlock.bpID).
                collection("users").doc(this.state.uIdHash).
                collection("userBlocks").
                doc(newBlock.key).set(newBlock);
            
            firebase.firestore().collection("Blockprobes").
                doc(newBlock.bpID).
                collection("fullBlocks").
                doc(committedBlock.key).set(committedBlock);

            
        }

        this.props.selectOption(option);
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

    giveBlockToNextReviewer(block)
    {
        //Deepcopy of reviewerList
        const reviewersStr = JSON.stringify(this.props.bpDetails.reviewers);
        var reviewersList = JSON.parse(reviewersStr);
        var randomReviewer = this.getRandomReviewer(reviewersList, this.props.reviewersMap);

        if(randomReviewer!=null) {

            block.blockState = "TO REVIEW";

            firebase.firestore().collection("Blockprobes").
                doc(block.bpID).
                collection("users").doc(randomReviewer.id).
                collection("userBlocks").
                doc(block.key+"_r").set(block);

            firebase.database().ref("Blockprobes/"+block.bpID
                        +"/reviewBlocks/"+block.key 
                        +"/reviewers/"+randomReviewer.id).set("-");

        }
        else{
            console.log("No other reviewers left!");
        }

    }

    renderReviewOptionList(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>OPTIONS</h3>
                <List className="view-block-option-list">
                    <ListItem button 
                    onClick={() => { this.selectOption("upvote")}}
                    >
                    <Avatar >
                        <ThumbUpIcon/>
                    </Avatar>
                        <ListItemText primary="Upvote and Pass On"/>
                    </ListItem>

                </List>
            </div>
        );
    }

    renderSubmitterOptionList(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>OPTIONS</h3>
                <List className="view-block-option-list">

                    {this.props.canCommit?
                        <ListItem button 
                        onClick={() => { this.selectOption("can_commit")}}
                        >
                        <Avatar>
                            <DoneAllIcon />
                        </Avatar>
                            <ListItemText primary="Commit Block to Investigation"/>
                        </ListItem>
                        :
                        null}

                    <ListItem button 
                    onClick={() => { this.selectOption("revert")}}
                    >
                    <Avatar>
                        <UndoIcon />
                    </Avatar>
                        <ListItemText primary="Revert to Draft"/>
                    </ListItem>

                    <ListItem button 
                    onClick={() => { this.selectOption("reassign_reviewer")}}
                    >
                    <Avatar>
                        <PeopleIcon />
                    </Avatar>
                        <ListItemText primary="Reassign Reviewer"/>
                    </ListItem>

                </List>
            </div>
        );
    }

    render(){
        return (
            <div>
                {this.props.blockState == 'TO REVIEW'?
                this.renderReviewOptionList():
                null}

                {this.props.blockState == 'UNDER REVIEW'?
                this.renderSubmitterOptionList():
                null}

            </div>
        );
    }


}
export default ViewBlockListComponent;