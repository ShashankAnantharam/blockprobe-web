import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import { Button } from '@material-ui/core';
import Graph from "react-graph-vis";
import './GraphComponent.css';

class GraphComponent extends React.Component {

    constructor(props){
      super(props);
      this.state={
        graph: {
            nodes: [
                {id: 1, label: 'Node 1'},
                {id: 2, label: 'Node 2'},
                {id: 3, label: 'Node 3'},
                {id: 4, label: 'Node 4'},
                {id: 5, label: 'Node 5'}
              ],
            edges: [
                {from: 1, to: 2},
                {from: 1, to: 3},
                {from: 2, to: 4},
                {from: 2, to: 5}
              ]
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
            select: function(event) {
                var { nodes, edges } = event;
                console.log("Selected nodes:");
                console.log(nodes);
                console.log("Selected edges:");
                console.log(edges);
            }
    
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
            },
          {
            value: false, 
            label: "aaa", 
            id: 1
          },
        {
            value: false, 
            label: "bbb", 
            id: 2
          },
          {
              value: false, 
              label: "ccc", 
              id: 3
            },
            {
              value: false, 
              label: "bbb", 
              id: 4
            },
            {
                value: false, 
                label: "ccc", 
                id: 5
              }
        ]
        }
    }

    entityClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
    }
    
    selectedBadgeClicked(entityList) {
        this.setState({ multiSelectEntityList: entityList });
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

        
        return (
            <div>
                <div className='filter-container'>                
                
                    <div className="dropdown-container">
                        <MultiSelectReact 
                        options={this.state.multiSelectEntityList}
                        optionClicked={this.entityClicked.bind(this)}
                        selectedBadgeClicked={this.selectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={selectedOptionsStyles}
                        optionsListStyles={optionsListStyles} 
                        isTextWrap={false} 
                        />
                    </div>

                    <button className="filterButton">Filter Graph</button>
                </div>
                <div className='graph-container'>
                    <Graph 
                        graph={this.state.graph} 
                        options={this.state.graphOptions} 
                        events={this.state.graphEvents} 
                        style={{ height: "780px", width:'50%', border: '1px solid lightgrey' }} 
                        />
                </div>
            </div>
        );
    }

}  
export default GraphComponent;