import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import './ViewBlockprobePublic.css';
import TimelineComponent from '../viso/TimelineComponent';

// /view/3a30893249f6952e26de1ce709094e6952731beb9e37c244c07e542e81f52227
// /view/d2160725641bbdbcc2d46bb0a278b44e6176e977c61b53fcde4299dcf1ac1184

class ViewBlockprobePublicComponent extends React.Component {

    constructor(props){
        super(props);
        this.state={
            genesisBlockId: "",
            blockprobeTitle: "",
            blockprobeSummary: "",
            selectedBlock:"", 
            blockTree: {},
            timeline: [],
            testList: []
        }
        this.changeSelectedBlock = this.changeSelectedBlock.bind(this);
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
                     genesisBlockId: block.key,
                     blockprobeTitle: block.title,
                     blockprobeSummary: block.summary
                 })
             }
         });
    }

    traverseBlockTree(nodeId, timelineList, timelineBlockStatus){
        var currBlock = this.state.blockTree[nodeId];

        // console.log(nodeId);

        if(currBlock.blockDate!=null || currBlock.blockTime!=null){
            if(currBlock.actionType!="REMOVE"){
                timelineList.push(currBlock.key);
                timelineBlockStatus[currBlock.key]=true;
                // console.log("ADD "+ nodeId);
            }
            else{
                timelineBlockStatus[currBlock.referenceBlock]=false;
                // console.log("REM "+ nodeId);
            }
        }
        this.setState({
            timeline:timelineList
        });
        currBlock.children.forEach((childBlockId) => {
            this.traverseBlockTree(childBlockId,timelineList,timelineBlockStatus);
        });
    }

    sortTimeline(timelineList){
        timelineList.sort(function(a,b){
            if(a.blockDate.year!==b.blockDate.year)
            return a.blockDate.year - b.blockDate.year;        

        if(a.blockDate.month!==b.blockDate.month)
            return a.blockDate.month - b.blockDate.month;        

        if(a.blockDate.date!==b.blockDate.date)
            return a.blockDate.date - b.blockDate.date;
         
         if(b.blockTime == null){
             return 1;
             //a is greater than or equal to if b has no time
         }
         
         if(a.blockTime!==null){
             if(a.blockTime.hours!==b.blockTime.hours){
                 return a.blockTime.hours - b.blockTime.hours;
             }
             if(a.blockTime.minutes!==b.blockTime.minutes){
                return a.blockTime.minutes - b.blockTime.minutes;
            }
         }

         //a is null but b is not null OR both are fully equal, a is less than equal to b
         return -1;
        });
        timelineList.reverse();
    }

    createBlockprobe(snapshot){
        snapshot.forEach((doc) => ( this.addBlocksToProbe(doc)));        
        var timelineList = [];
        var timelineBlockStatus = {};
        this.traverseBlockTree(this.state.genesisBlockId, timelineList, timelineBlockStatus);

       // console.log(timelineList);
       // console.log(timelineBlockStatus);
        
        var finalTimelineList = [];
        timelineList.forEach((id) => {
            if(timelineBlockStatus[id]==true)
            {
                finalTimelineList.push(this.state.blockTree[id]);
            }
        });
        this.sortTimeline(finalTimelineList);
        this.setState({
            timeline:[...finalTimelineList]
        });
        // console.log(this.state.timeline);
    }

    changeSelectedBlock = (block) =>{
        console.log(block);
        this.setState({
            selectedBlock:block
        }); 
    }

    componentDidMount(){
        firebase.firestore().collection("public").doc(this.props.match.params.bId)
        .collection("aggBlocks").get().then((snapshot) => (
            this.createBlockprobe(snapshot)
         ));
    }

    render(){
        return (
            <div>
            <div className="blockprobe-header"> 
                <h2>{this.state.blockprobeTitle}</h2>
                <h4>{this.state.blockprobeSummary}</h4>
                <h5>{this.state.selectedBlock.title}</h5>
            </div>
            <TimelineComponent timeline={this.state.timeline} selectBlock={this.changeSelectedBlock}/>
            </div>
            );
    }


}

export default ViewBlockprobePublicComponent;