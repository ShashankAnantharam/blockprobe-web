import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import './ViewBlockprobePrivate.css';
import TimelineComponent from '../viso/TimelineComponent';
import GraphComponent from '../viso/GraphComponent';
import FindConnectionsComponent from '../viso/FindConnectionsComponent';
import ViewBlockComponent from '../viso/ViewBlock';
import Sidebar from "react-sidebar";
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/More';
import VisualizeOptionsList from '../viso/VisoList';
import VisualizeOptionsListComponent from '../viso/VisoList';
import { red } from '@material-ui/core/colors';
import { timingSafeEqual } from 'crypto';
import { isNullOrUndefined } from 'util';
import UserBlocksComponent from '../user-session/UserBlocksComponent';

class ViewBlockprobePrivateComponent extends React.Component {

    constructor(props){
        super(props);

        this.state={
            genesisBlockId: "",
            blockprobeTitle: "",
            blockprobeSummary: "",
            selectedBlock:"", 
            blockTree: {},
            investigationGraph: {},
            timeline: [],
            selectedBlockSidebarOpen: false,
            menuBarOpen: false,
            selectedVisualisation: "timeline",
            testList: []
        }

        this.changeSelectedBlock = this.changeSelectedBlock.bind(this);
        this.onSetSelectedBlockSidebarOpen = this.onSetSelectedBlockSidebarOpen.bind(this);
        this.onSetMenuBlockSidebarOpen = this.onSetMenuBlockSidebarOpen.bind(this);
        this.renderVisualisation = this.renderVisualisation.bind(this);
        this.setNewVisualisation = this.setNewVisualisation.bind(this);
        this.addEdge = this.addEdge.bind(this);
        this.createInvestigationGraph = this.createInvestigationGraph.bind(this);
    }

    setNewVisualisation(newVisualisation){
        if(this.state.visualisation != newVisualisation){
            this.setState({
                selectedVisualisation: newVisualisation
            });
            console.log(newVisualisation);
        }
    }

    onSetSelectedBlockSidebarOpen(open) {
        this.setState({ selectedBlockSidebarOpen: open });
    }

    onSetMenuBlockSidebarOpen(open) {
        this.setState({ menuBarOpen: open });
        console.log(this.state.menuBarOpen);
    }

    addBlocksToProbe(doc){      
        var block  = doc.data();

        var tempState = this.state.blockTree;
        
        //If empty block exists
        if(block.key in tempState){

            //If children is not null or undefined, then add children to block
            if(!isNullOrUndefined(tempState[block.key].children)){        
                block.children = [...tempState[block.key].children];
            }
        }

        tempState[block.key] = block;

        
        //add parent if not there
        var prevBlockId = block.previousKey;
        if(prevBlockId in tempState){

            //If parent does not have list
            if(isNullOrUndefined(tempState[prevBlockId].children)){
                tempState[prevBlockId].children = [];
            }

        }
        else{
            tempState[prevBlockId]= {
                children:[]
            };
        }
        tempState[prevBlockId].children.push(block.key);


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
         
    }

    traverseBlockTree(nodeId, timelineList, timelineBlockStatus, blockList, blockStatus){
        var currBlock = this.state.blockTree[nodeId];

        // console.log(nodeId);

        //Generic block
        if(currBlock.actionType!="REMOVE"){
            blockList.push(currBlock.key);
            blockStatus[currBlock.key]=true;
        }
        else{
            blockStatus[currBlock.referenceBlock]=false;
        }

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
        if(!isNullOrUndefined(currBlock.children)){
            currBlock.children.forEach((childBlockId) => {
                this.traverseBlockTree(childBlockId,timelineList,timelineBlockStatus,blockList,blockStatus);
            });
        }
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

    addEdge(graph, block, entity_i, entity_j){

        // edge from i to j
        if(!(entity_j in graph[entity_i].edges)){
            graph[entity_i].edges[entity_j]=[];
        }
        graph[entity_i].edges[entity_j].push(block.key);
    }

    createInvestigationGraph(blockList){
        var graph = {};

        blockList.forEach((blockKey) => {
            var block = this.state.blockTree[blockKey];
            if(block.entities!=null){

                for(var i=0;i<block.entities.length;i++){
                    var entityKey = block.entities[i].title;
                    if(!(entityKey in graph)){
                        graph[entityKey]={
                            char: [],
                            edges: {}
                        }
                    }
                }

                if(block.entities.length == 1){

                    var entityKey = block.entities[0].title;
                    graph[entityKey].char.push(block.key);
                }
                else if(block.entities.length > 1){

                    for(var i=0;i<block.entities.length;i++){
                        for(var j=i+1;j<block.entities.length;j++){
                            this.addEdge(graph, block, 
                                block.entities[i].title, block.entities[j].title);
                            this.addEdge(graph, block, 
                                block.entities[j].title, block.entities[i].title);
                        }
                    }
                    
                }
            }
        });
 
        this.setState({
            investigationGraph: graph
        });
        console.log(this.state.investigationGraph);
    }

    createBlockprobe(snapshot){
        snapshot.forEach((doc) => ( this.addBlocksToProbe(doc)));        
        var timelineList = [];
        var timelineBlockStatus = {};
        var blockList = [];
        var blockStatus = {};

        console.log(this.state.blockTree);
        this.traverseBlockTree(
            this.state.genesisBlockId, 
            timelineList, 
            timelineBlockStatus,
            blockList,
            blockStatus);

        // console.log(blockList);
        // console.log(blockStatus);
        
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

        var finalBlockList = [];
        blockList.forEach((id) => {
            if(blockStatus[id])
            {
                finalBlockList.push(id);
            }
        });

        this.createInvestigationGraph(finalBlockList);

        // console.log(finalBlockList);
        
    }

    changeSelectedBlock = (block) =>{
        // console.log(block);        
        this.setState({
            selectedBlock:block
        }); 
        this.onSetSelectedBlockSidebarOpen(true);
    }

    componentDidMount(){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("fullBlocks").get().then((snapshot) => (
            this.createBlockprobe(snapshot)
         ));
    }

    renderVisualisation(){
        if(this.state.selectedVisualisation == "timeline")
        {
            return (
                <div className="blockprobe-body">
                    <TimelineComponent 
                    timeline={this.state.timeline} 
                    selectBlock={this.changeSelectedBlock}/>
                </div>
            );
        }
        else if(this.state.selectedVisualisation == "graph"){
            return(
                <div>
                    <GraphComponent blockTree={this.state.blockTree} 
                        investigationGraph={this.state.investigationGraph}
                        selectBlock={this.changeSelectedBlock}/>
                </div>
            );
        }
        else if(this.state.selectedVisualisation == "find_connections"){
            return(
                <div>
                    <FindConnectionsComponent blockTree={this.state.blockTree} 
                        investigationGraph={this.state.investigationGraph}
                        selectBlock={this.changeSelectedBlock}
                    />
                </div>
            );
        }
        else if(this.state.selectedVisualisation == "contributions"){
            return(
                <div>
                    <UserBlocksComponent 
                    uId={this.props.uId}
                    bId={this.props.bId}
                    selectBlock={this.changeSelectedBlock}
                    investigationGraph = {this.state.investigationGraph}
                    />
                </div>
            );
        }

        return (
            <div style={{textAlign:"center"}}>
                FEATURE TO BE IMPLEMENTED
            </div>
        );
    }

    render(){
        return (
            <div>

            <Sidebar
                sidebar={<div style={{width:'30vw'}}>
                <ViewBlockComponent 
                selectedBlock={this.state.selectedBlock}
                uId={this.props.uId}
                bpId={this.props.bId}
                />
                </div>}
                open={this.state.selectedBlockSidebarOpen}
                onSetOpen={this.onSetSelectedBlockSidebarOpen}
                pullRight={true}
                defaultSidebarWidth='200px'
                styles={{ sidebar: { background: "lightcyan", position:'fixed' } }}
            >

            </Sidebar>

            <Sidebar
                sidebar={<div style={{width:'40vw'}}>
                    <VisualizeOptionsListComponent 
                    selectVisualisation={this.setNewVisualisation}
                    selectedVisualisation={this.state.selectedVisualisation}
                    isViewOnly={false}/>
                </div>}
                open={this.state.menuBarOpen}
                onSetOpen={this.onSetMenuBlockSidebarOpen}
                pullRight={false}
                defaultSidebarWidth='200px'
                styles={{ sidebar: { background:"white", position:'fixed' } }}
            >

                <div>
                <button onClick={() => { this.onSetMenuBlockSidebarOpen(true)}}
                className="menu-button">
                        <MenuIcon/>
                    </button>
                </div>
                <div className="blockprobe-header"> 
                    <h2>{this.state.blockprobeTitle}</h2>
                    <h4>{this.state.blockprobeSummary}</h4>
                </div>

                {this.renderVisualisation()}
            </Sidebar>


            </div>
        );
    }


}
export default ViewBlockprobePrivateComponent;