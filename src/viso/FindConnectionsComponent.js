import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import { Button, withStyles } from '@material-ui/core';
import Graph from "react-graph-vis";
import './GraphComponent.css';
import { timingSafeEqual } from 'crypto';
import { isNullOrUndefined } from 'util';
import { thatReturnsThis } from 'fbjs/lib/emptyFunction';

class FindConnectionsComponent extends React.Component {

    constructor(props){
      super(props);
      this.state={
        graph: {
            nodes: [
              ],
            edges: [
              ]
          },
        graphHelperMap: {
            nodes:{

            },
            edges:{

            }
          },
        graphOptions: {
            layout: {
                hierarchical: false
            },
            edges: {
                arrows: {
                    to:     {enabled: false, scaleFactor:1, type:'arrow'},
                    middle: {enabled: false, scaleFactor:1, type:'arrow'},
                    from:   {enabled: false, scaleFactor:1, type:'arrow'}
                  },
                color: "#000000"
            }        
        },
        graphEvents: {
        },
        firstEntitySelectList: [
            {
                value: true, 
                label: "None", 
                id: -1
            }
        ],
        secondEntitySelectList: [
            {
                value: true, 
                label: "None", 
                id: -1
            }
        ],
        currentSelectedBlocks: [
        ],
        wasAllOptionSelected: true,
        wasNoneOptionSelected:false,
        testVar: -1
        }

        this.initializeGraphEvents = this.initializeGraphEvents.bind(this);
        this.generateEntityLists = this.generateEntityLists.bind(this);
        this.generateGraph = this.generateGraph.bind(this);
        this.getPathViaBfs = this.getPathViaBfs.bind(this);
        this.findConnections = this.findConnections.bind(this);
        this.onSelectGraph = this.onSelectGraph.bind(this);
        this.addBlocksForNodeCharacteristic = this.addBlocksForNodeCharacteristic.bind(this);
        this.addBlocksForEdge = this.addBlocksForEdge.bind(this);
        this.isValidBlock = this.isValidBlock.bind(this);
        this.clickBlockFromList = this.clickBlockFromList.bind(this);
    }

    isValidBlock(block){
        if(isNullOrUndefined(block.title) || block.title=='')
            return false;
        return true;
    }

    addBlocksForEdge(edge, blocksToBeSelected, blocksAdded){
        var edgeBlockList = this.props.investigationGraph[edge.from].edges[edge.to];

        for(var i=0;i<edgeBlockList.length;i++){
            const blockKey = edgeBlockList[i];
            if(!(blockKey in blocksAdded)){

                // Add block if it is not already in list
                const newBlock = this.props.blockTree[blockKey];

                if(this.isValidBlock(newBlock))
                {
                    blocksToBeSelected.push(newBlock);
                }
                blocksAdded[blockKey]=true;
            }
        }

    }

    addBlocksForNodeCharacteristic(node, blocksToBeSelected, blocksAdded){
        var charBlockList = this.props.investigationGraph[node].char;

        for(var i=0;i<charBlockList.length;i++){
            const blockKey = charBlockList[i];

            if(!(blockKey in blocksAdded)){

                // Add block if it is not already in list
                const newBlock = this.props.blockTree[blockKey];

                if(this.isValidBlock(newBlock))
                {
                    blocksToBeSelected.push(newBlock);
                }
                blocksAdded[blockKey]=true;
            }
        }
    }

    onSelectGraph(event){
        var { nodes, edges } = event;
        var blocksToBeSelected = [];
        var blocksAdded = {};

        if(!isNullOrUndefined(edges)){
            for(var i=0;i<edges.length;i++){
                var edgeKey = edges[i];
                var edge = this.state.graphHelperMap.edges[edgeKey];
                this.addBlocksForEdge(edge, blocksToBeSelected, blocksAdded);
            }
        }

        if(!isNullOrUndefined(nodes)){
            for(var i=0;i<nodes.length;i++){
                var nodeKey = nodes[i];
                var node = this.state.graphHelperMap.nodes[nodeKey];
                this.addBlocksForNodeCharacteristic(node, blocksToBeSelected, blocksAdded);
            }
        }

        this.setState({
            currentSelectedBlocks: blocksToBeSelected
        });
    }

    initializeGraphEvents(){
        const context = this;
        var events = {
            
            select: function(event) {
                context.onSelectGraph(event);
            }
    
        }

        this.setState({
            graphEvents: events
        })
    }

    getPathViaBfs(startNode, destNode){
        
        //st has attributes 
        var st=[];

        //blocksVisited has detail here such as blockCount, hops and prevDetail
        var blocksVisited = {};

        //init map and st
        blocksVisited[startNode]={
            id: startNode,
            blockCount: 0,
            hops: 0,
            prevNode: ''
        };
        st.push(startNode);

        var invGraph = this.props.investigationGraph;
        var i =0;
        while(1){
            if(i >= st.length || st[i]==destNode)
                break;

            
            var currNodeKey = st[i];
            var currNode = blocksVisited[currNodeKey];
            var currHops = currNode.hops;
            var currblockCount = currNode.blockCount;

            //get edges
            var edgeMap = invGraph[currNodeKey].edges;
            Object.keys(edgeMap).forEach(function(edgeKey) {

                var shouldUpdateEdgeNode = false;

                if(!(edgeKey in blocksVisited)){
                    shouldUpdateEdgeNode = true;

                    //first time visiting Node. push to stack 
                    st.push(edgeKey);
                }
                else{
                    if( (
                        //New hops is lesser than existing
                        blocksVisited[edgeKey].hops > currHops+1
                        ) || 
                        (
                            //Hops equal but new block count more than existing
                            (blocksVisited[edgeKey].hops == currHops+1)
                            &&
                            (currblockCount + 
                                invGraph[currNodeKey].edges[edgeKey].length 
                                > blocksVisited[edgeKey].blockCount) 
                        )
                    ){
                        shouldUpdateEdgeNode = true;
                    }
                }

                if(shouldUpdateEdgeNode){
                    blocksVisited[edgeKey] = {
                        id: edgeKey,
                        blockCount: currblockCount + invGraph[currNodeKey].edges[edgeKey].length,
                        hops: currHops + 1,
                        prevNode: currNodeKey
                    };
                }
                
            });
            
            i++;
        }

        var pathNodeKeys = {};;
        var curr = destNode;
        while((curr in blocksVisited) && (curr!=startNode)){
            pathNodeKeys[curr]=true;
            curr = blocksVisited[curr].prevNode;
        }

        //console.log("PathNodeKeys");
        //console.log(pathNodeKeys);

        var list=[];
        if(curr==startNode){
            //path found

            pathNodeKeys[startNode]=true;

            for(var i=1; i<this.state.firstEntitySelectList.length;i++){
                if(this.state.firstEntitySelectList[i].label in pathNodeKeys){
                    //Entity in path
                    var pathEntity = {
                        value: true,
                        label: this.state.firstEntitySelectList[i].label,
                        id: this.state.firstEntitySelectList[i].id
                    };
                    list.push(pathEntity);
                }
            }
        }

        return list;

    }

    findConnections(){

        var rootElement = {};
        var destElement = {};
        var list = [];
        for(var i=1; i<this.state.firstEntitySelectList.length;i++){
            if(this.state.firstEntitySelectList[i].value){
                rootElement = this.state.firstEntitySelectList[i];
            }
        }

        for(var i=1; i<this.state.secondEntitySelectList.length;i++){
            if(this.state.secondEntitySelectList[i].value){
                destElement = this.state.secondEntitySelectList[i];
            }
        }

        //do bfs here
        list = this.getPathViaBfs(rootElement.label, destElement.label);

        if(list.length == 0){
            list.push(rootElement);
            list.push(destElement);
        }

        return list;

    }

    async generateGraph(){
        var newGraph = {
            nodes: [],
            edges: []
        };
        var nodesMap = {};

        var selectedEntityList = this.findConnections();

        if(selectedEntityList.length >= 2)
        {
            //If None is not selected only display graph
            var selectedEntityLabels = {};

            var count=0;
            for(var i=0; i<selectedEntityList.length;i++){
                var currEntity = selectedEntityList[i];
                if(currEntity.value){
                    //selected Node
                    selectedEntityLabels[currEntity.label]=count;
                    
                    //Add Node
                    newGraph.nodes.push({
                        id:count,
                        label:currEntity.label
                    });
                    nodesMap[count] = currEntity.label;

                    //Add edge
                    var currEntityKey = currEntity.label;
                    var edgeMap = this.props.investigationGraph[currEntityKey].edges;
                    Object.keys(edgeMap).forEach(function(edgeKey) {
                        if(edgeKey in selectedEntityLabels){
                            //edge is a selection, add it
                            newGraph.edges.push({
                                from: selectedEntityLabels[edgeKey],
                                to: count,
                                id: selectedEntityLabels[edgeKey]+'-'+count
                            });
                        }
                    });
                    count++;
                }
            }
        }

        var newGraphHelper = {
            nodes: nodesMap,
            edges: {}
        }

        for(var i=0;i<newGraph.edges.length;i++){
            var edge = newGraph.edges[i];
            var to_id = nodesMap[edge.to];
            var from_id = nodesMap[edge.from];
            newGraphHelper.edges[edge.id] = {from:from_id, to:to_id};
        }

        await this.setState({
            graph: newGraph,
            graphHelperMap: newGraphHelper 
        });

    }

    generateEntityLists(){
        var count = 1;
        var firstEntityList = this.state.firstEntitySelectList;
        var secondEntityList = this.state.secondEntitySelectList;
        Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
            firstEntityList.push({                
                    value: false, 
                    label: entityLabel, 
                    id: count             
            });
            secondEntityList.push({                
                value: false, 
                label: entityLabel, 
                id: count             
            });
            count++;
        });
        this.setState({
            firstEntitySelectList: firstEntityList,
            secondEntitySelectList: secondEntityList
        });
    }

    BlockEntity(entity){
        return(
        <span className="graph-block-entity">
            {entity.title}
        </span>
        );  
    }

    SingleBlock(singleBlock){
        
        /*
         Create render template for the entities
         */
        var renderBlockEntities = '';
        if(singleBlock.entities!=null && singleBlock.entities.length>0){            
            renderBlockEntities = singleBlock.entities.map((blockEntity) => 
               this.BlockEntity(blockEntity)
           );            
       }
       /*
       */

        return(
        <div className="graph-block-div"
        onClick={() => { this.clickBlockFromList(singleBlock)}}>
            <h4 className="graph-block-title">{singleBlock.title}</h4>
            <p className="graph-block-text">
                {singleBlock.summary}
            </p>
            <div>
                {renderBlockEntities}
            </div>
            
        </div>
        );
    }



    firstEntityClicked(entityList) {
        this.setState({ firstEntitySelectList: entityList });
    }
    
    firstSelectedBadgeClicked(entityList) {
        this.setState({ firstEntitySelectList: entityList });
    }

    secondEntityClicked(entityList) {
        this.setState({ secondEntitySelectList: entityList });
    }
    
    secondSelectedBadgeClicked(entityList) {
        this.setState({ secondEntitySelectList: entityList });
    }

    clickBlockFromList(block){
        this.props.selectBlock(block);
    }

    componentDidMount(){
        this.initializeGraphEvents();
        this.generateEntityLists();
        this.generateGraph();

    }

    render(){


        const selectedOptionsStyles = {
            color: "white",
            backgroundColor: "rgb(117, 106, 214)",
            borderRadius:"20px",
            fontSize:'0.6em',
            padding:'10px'
        };
        const optionsListStyles = {
            backgroundColor: "darkcyan",
            color: "white",

        };

        var renderBlocks = this.state.currentSelectedBlocks.map((selectedBlock) => 
               this.SingleBlock(selectedBlock)
           );            
        
        return (
            <div>
                <div className='filter-container'>                
                
                    <div className="find-connections-dropdown-container">
                        <MultiSelectReact 
                        options={this.state.firstEntitySelectList}
                        optionClicked={this.firstEntityClicked.bind(this)}
                        selectedBadgeClicked={this.firstSelectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={selectedOptionsStyles}
                        optionsListStyles={optionsListStyles} 
                        isSingleSelect={true}
                        isTextWrap={false} 
                        />
                        
                    </div>

                    <div className="find-connections-dropdown-container">
                        <MultiSelectReact 
                        options={this.state.secondEntitySelectList}
                        optionClicked={this.secondEntityClicked.bind(this)}
                        selectedBadgeClicked={this.secondSelectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={selectedOptionsStyles}
                        optionsListStyles={optionsListStyles} 
                        isSingleSelect={true}
                        isTextWrap={false} 
                        />    
                    </div>

                    <button className="filterButton" onClick={this.generateGraph}>Find Connection</button>
                </div>
                <div className='graph-container'>
                    <Graph 
                        graph={this.state.graph} 
                        options={this.state.graphOptions} 
                        events={this.state.graphEvents} 
                        style={{ height: "780px", minWidth:'50%', maxWidth:'80%', 
                        border: '1px solid lightgrey' }} 
                        />

                      <div className="graph-block-list"  id="graph-selected-block-list">
                            {renderBlocks}
                      </div>  
                      
                </div>
            </div>
        );
    }

}
export default FindConnectionsComponent;
