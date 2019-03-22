import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import { Button } from '@material-ui/core';
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
        multiSelectEntityList: [
            {
                value: true, 
                label: "All", 
                id: 0
            },
            {
                value: false, 
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

        this.handleAllAndNoneOptions = this.handleAllAndNoneOptions.bind(this);
        this.initializeGraphEvents = this.initializeGraphEvents.bind(this);
        this.generateMultiSelectEntityList = this.generateMultiSelectEntityList.bind(this);
        this.generateGraph = this.generateGraph.bind(this);
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
            // console.log(blockKey);
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
        
        /*
        console.log("Selected nodes:");
        console.log(nodes);        
        console.log("Selected edges:");
        console.log(edges);
        */
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

    async generateGraph(){
        var isAllSelected = this.state.multiSelectEntityList[0].value;
        var newGraph = {
            nodes: [],
            edges: []
        };
        var nodesMap = {};

        if(!this.state.multiSelectEntityList[1].value)
        {
            //If None is not selected only display graph
            var selectedEntityLabels = {};

            var count=0;
            for(var i=2; i<this.state.multiSelectEntityList.length;i++){
                var currEntity = this.state.multiSelectEntityList[i];
                if(currEntity.value || isAllSelected){
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
        console.log(this.state.graphHelperMap);

    }

    generateMultiSelectEntityList(){
        var count = 1;
        var entityList = this.state.multiSelectEntityList;
        Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
            entityList.push({                
                    value: false, 
                    label: entityLabel, 
                    id: count             
            });
            count++;
        });
        this.setState({
            multiSelectEntityList: entityList
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

    handleAllAndNoneOptions(){
        var prevAllOption = this.state.wasAllOptionSelected;
        var prevNoneOption = this.state.wasNoneOptionSelected;
        var showAll = false;
        var showNone = false;
        var someOptionIsEnabled = false;
        var tempList = this.state.multiSelectEntityList;

        for(var i=0; i<tempList.length; i++){
            if(tempList[i].value==true){
                if(tempList[i].id == 0){
                    // All
                    showAll = true;
                }
                else if(tempList[i].id == -1){
                    //None
                    showNone = true;
                }
                else{
                    //Other element
                    someOptionIsEnabled = true;

                    if((showAll && prevAllOption) || (showNone && prevNoneOption)){
                        //All/None option selected before, so no need now
                        showAll = false;
                        showNone = false;
                        break;
                    }
                    else if(showNone || showAll){
                        //All/None option not selected before but selected now, 
                        // remove all other values
                        tempList[i].value=false;                        
                    }
                }
            }
        }

        if(showAll && !prevAllOption){
            showNone = false;
        }
        if(showNone && !prevNoneOption){
            showAll = false;
        }
        if(!showAll && !showNone && !someOptionIsEnabled){
            
            //No option is clicked
            showNone = true;
        }

        tempList[0].value = showAll;
        tempList[1].value = showNone;
        this.setState({
            multiSelectEntityList: tempList,
            wasAllOptionSelected: showAll,
            wasNoneOptionSelected: showNone
        });
    }

    entityClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
        this.handleAllAndNoneOptions();
    }
    
    selectedBadgeClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
        this.handleAllAndNoneOptions();
    }

    clickBlockFromList(block){
        this.props.selectBlock(block);
    }

    componentDidMount(){
        this.initializeGraphEvents();
        this.generateMultiSelectEntityList();
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
                        options={this.state.multiSelectEntityList}
                        optionClicked={this.entityClicked.bind(this)}
                        selectedBadgeClicked={this.selectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={selectedOptionsStyles}
                        optionsListStyles={optionsListStyles} 
                        isTextWrap={false} 
                        />
                    </div>

                    <button className="filterButton" onClick={this.generateGraph}>Filter Graph</button>
                </div>
                <div className='graph-container'>
                    <Graph 
                        graph={this.state.graph} 
                        options={this.state.graphOptions} 
                        events={this.state.graphEvents} 
                        style={{ height: "780px", width:'50%', border: '1px solid lightgrey' }} 
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
