import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import './DashboardView.css';
import SummaryViewComponent from "../summary/SummaryView";
import GraphComponent from "../GraphComponent";
import FindConnectionsComponent from "../FindConnectionsComponent";
import TimelineComponent from "../TimelineComponent";
import { isNullOrUndefined } from 'util';

class DashboardViewComponent extends React.Component {

    constructor(props){
      super(props);
      this.state={
          key: 'graph'
      }
      this.isSummaryBlocksAvailable = this.isSummaryBlocksAvailable.bind(this);
    }

    isSummaryBlocksAvailable(){
        if(isNullOrUndefined(this.props.summaryBlocks) || this.props.summaryBlocks.length==0)
            return false;
        return true;
    }

    render(){
        return (
            <div style={{paddingBottom:'15px'}}>

                {this.isSummaryBlocksAvailable()?
                    <div>
                        <SummaryViewComponent
                                summaryBlocks = {this.props.summaryBlocks}
                                selectBlock={this.props.selectBlock}/>
                    </div>
                            :
                    null
                }
                
                <div className="dashboard-section-heading graph-heading">Graph</div>
                <Tabs>
                    <TabList>
                    <Tab>Overview</Tab>
                    </TabList>
                
                    <TabPanel>
                        <GraphComponent blockTree={this.props.blockTree} 
                            investigationGraph={this.props.investigationGraph}
                            selectBlock={this.props.selectBlock}
                            imageMapping = {this.props.imageMapping}
                            setScrollToGraphList ={this.props.setScrollToGraphList}
                            multiSelectEntityList = {this.props.multiSelectEntityList}/>
                    </TabPanel>                  
                </Tabs>

                {this.props.timeline && this.props.timeline.length > 0?

                    <div>
                        <div className="dashboard-section-heading timeline-heading" style={{marginBottom:'0 !important'}}>Timeline</div> 
                            <TimelineComponent 
                                timeline={this.props.timeline} 
                                selectBlock={this.props.selectBlock}/>
                    </div>
                        :
                        null
                }
          
                

            </div>
        );
    }
}
export default DashboardViewComponent;

/*
 <TabPanel>
                        <FindConnectionsComponent blockTree={this.props.blockTree} 
                            investigationGraph={this.props.investigationGraph}
                            imageMapping = {this.props.imageMapping}
                            selectBlock={this.props.selectBlock}
                            setScrollToGraphList ={this.props.setScrollToGraphList}
                        />
                    </TabPanel>
                    */