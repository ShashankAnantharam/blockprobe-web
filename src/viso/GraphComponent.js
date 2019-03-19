import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import { Button } from '@material-ui/core';
import './GraphComponent.css';

class GraphComponent extends React.Component {

    constructor(props){
      super(props);
      this.state={
        graph: {},
        options: {},
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
                <div className='rowC'>                
                
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
            </div>
        );
    }

}  
export default GraphComponent;