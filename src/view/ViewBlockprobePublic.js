import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import { timingSafeEqual } from 'crypto';
import TimelineComponent from '../viso/TimelineComponent';

// /view/3a30893249f6952e26de1ce709094e6952731beb9e37c244c07e542e81f52227
// /view/d2160725641bbdbcc2d46bb0a278b44e6176e977c61b53fcde4299dcf1ac1184

class ViewBlockprobePublicComponent extends React.Component {

    constructor(props){
        super(props);
        this.state={
            genesisBlockId: "",
            blockTree: {},
            timeline: [],
            testList: []
        }
    }

    addBlocksToProbe(doc){      
         doc.data().blocks.forEach(block => {
             var tempState = this.state.blockTree;
             tempState[block.key] = block;
             this.setState({
                 blockTree:tempState
             });
             if(block.actionType == "genesis"){
                 this.setState({
                     genesisBlockId: block.key
                 })
             }
         });
    }

    traverseBlockTree(nodeId, timelineList, timelineBlockStatus){
        var currBlock = this.state.blockTree[nodeId];

        console.log(nodeId);

        if(currBlock.blockDate!=null || currBlock.blockTime!=null){
            if(currBlock.actionType!="REMOVE"){
                timelineList.push(currBlock.key);
                timelineBlockStatus[currBlock.key]=true;
                console.log("ADD "+ nodeId);
            }
            else{
                timelineBlockStatus[currBlock.referenceBlock]=false;
                console.log("REM "+ nodeId);
            }
        }
        this.setState({
            timeline:timelineList
        });
        currBlock.children.forEach((childBlockId) => {
            this.traverseBlockTree(childBlockId,timelineList,timelineBlockStatus);
        });
    }

    createBlockprobe(snapshot){
        snapshot.forEach((doc) => ( this.addBlocksToProbe(doc)));        
        var timelineList = [];
        var timelineBlockStatus = {};
        this.traverseBlockTree(this.state.genesisBlockId, timelineList, timelineBlockStatus);

        console.log(timelineList);
        console.log(timelineBlockStatus);
        
        var finalTimelineList = [];
        timelineList.forEach((id) => {
            if(timelineBlockStatus[id]==true)
            {
                finalTimelineList.push(this.state.blockTree[id]);
            }
        })
        this.setState({
            timeline:[...finalTimelineList]
        });
        console.log(this.state.timeline);
    }

    componentDidMount(){
        firebase.firestore().collection("public").doc(this.props.match.params.bId)
        .collection("aggBlocks").get().then((snapshot) => (
            this.createBlockprobe(snapshot)
         ));
    }

    render(){
        const mapItems = Object.keys(this.state.blockTree).map((key, index) => 
        <li>{key}</li>);

        const timelineItems = this.state.timeline.map((item) => <li>{item.title}</li>);
        return (
            <div>
            <div> Timeline</div>
            <TimelineComponent timeline={this.state.timeline} />
            </div>
            );
    }


}

export default ViewBlockprobePublicComponent;