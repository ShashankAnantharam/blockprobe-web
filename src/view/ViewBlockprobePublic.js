import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import './ViewBlockprobePublic.css';
import TimelineComponent from '../viso/TimelineComponent';
import ViewBlockComponent from '../viso/ViewBlock';
import Sidebar from "react-sidebar";
import MenuIcon from '@material-ui/icons/Menu';
import HeaderComponent from './HeaderComponent';


// /view/3a30893249f6952e26de1ce709094e6952731beb9e37c244c07e542e81f52227
// /view/d2160725641bbdbcc2d46bb0a278b44e6176e977c61b53fcde4299dcf1ac1184
// /view/ad9e355e747a6a11741fdfdd62b2c040aa8d985afddc43fbfa8202d21d7d986e

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
            selectedBlockSidebarOpen: false,
            menuBarOpen: false,
            testList: []
        }
        this.changeSelectedBlock = this.changeSelectedBlock.bind(this);
        this.onSetSelectedBlockSidebarOpen = this.onSetSelectedBlockSidebarOpen.bind(this);
        this.onSetMenuBlockSidebarOpen = this.onSetMenuBlockSidebarOpen.bind(this);

    }

    onSetSelectedBlockSidebarOpen(open) {
        this.setState({ selectedBlockSidebarOpen: open });
    }

    onSetMenuBlockSidebarOpen(open) {
        this.setState({ menuBarOpen: open });
        console.log(this.state.menuBarOpen);
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
        this.onSetSelectedBlockSidebarOpen(true);
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
                <HeaderComponent/>

                <div>
                <button onClick={() => { this.onSetMenuBlockSidebarOpen(true)}}>
                        <MenuIcon/>
                    </button>
                </div>

                <div className="blockprobe-header"> 
                    <h2>{this.state.blockprobeTitle}</h2>
                    <h4>{this.state.blockprobeSummary}</h4>
                </div>

            <Sidebar
                sidebar={<div style={{width:'40vw'}}>
                    Menu
                </div>}
                open={this.state.menuBarOpen}
                onSetOpen={this.onSetMenuBlockSidebarOpen}
                pullRight={false}
                defaultSidebarWidth='200px'
                styles={{ sidebar: { background:"white", position:'fixed' } }}
            >

            </Sidebar>

            <Sidebar
                sidebar={<div style={{width:'30vw'}}>
                <ViewBlockComponent selectedBlock={this.state.selectedBlock}/>
                </div>}
                open={this.state.selectedBlockSidebarOpen}
                onSetOpen={this.onSetSelectedBlockSidebarOpen}
                pullRight={true}
                defaultSidebarWidth='200px'
                styles={{ sidebar: { background: "lightcyan", position:'fixed' } }}
            >


            </Sidebar>
            <TimelineComponent timeline={this.state.timeline} selectBlock={this.changeSelectedBlock}/>
            </div>
            );
    }


}

export default ViewBlockprobePublicComponent;