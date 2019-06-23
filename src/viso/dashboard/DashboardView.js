import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import './DashboardView.css';
import SummaryViewComponent from "../summary/SummaryView";
import GraphComponent from "../GraphComponent";
import FindConnectionsComponent from "../FindConnectionsComponent";
import TimelineComponent from "../TimelineComponent";

class DashboardViewComponent extends React.Component {

    constructor(props){
      super(props);
      this.state={
          key: 'graph'
      }
    }

    render(){
        return (
            <div>
                <div className="dashboard-section-heading graph-heading">Summary</div>
                <SummaryViewComponent
                        summaryBlocks = {this.props.summaryBlocks}/>

                <div className="dashboard-section-heading graph-heading">Graph</div>
                <Tabs>
                    <TabList>
                    <Tab>Overview</Tab>
                    <Tab>Find Connections</Tab>
                    </TabList>
                
                    <TabPanel>
                        <GraphComponent blockTree={this.props.blockTree} 
                            investigationGraph={this.props.investigationGraph}
                            selectBlock={this.props.selectBlock}
                            multiSelectEntityList = {this.props.multiSelectEntityList}/>
                    </TabPanel>
                    <TabPanel>
                        <FindConnectionsComponent blockTree={this.props.blockTree} 
                            investigationGraph={this.props.investigationGraph}
                            selectBlock={this.props.selectBlock}
                        />
                    </TabPanel>
                </Tabs>
          
                <div className="dashboard-section-heading timeline-heading" style={{marginBottom:'0 !important'}}>Timeline</div> 
                <TimelineComponent 
                    timeline={this.props.timeline} 
                    selectBlock={this.props.selectBlock}/>

            </div>
        );
    }
}
export default DashboardViewComponent;