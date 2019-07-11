import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import TimelineIcon from '@material-ui/icons/Timeline';
import AcUnitIcon from '@material-ui/icons/AcUnit'; 
import GroupIcon from '@material-ui/icons/Group'; 
import BuildIcon from '@material-ui/icons/Build'; 
import CreateIcon from '@material-ui/icons/Create'; 
import DashboardIcon from '@material-ui/icons/Dashboard';
import ShareIcon from '@material-ui/icons/Share';
import Joyride from 'react-joyride';
import ListIcon from '@material-ui/icons/List';
import './VisoList.css';

class VisualizeOptionsListComponent extends React.Component {

    constructor(props){
      super(props);
      //role, dashboardTooltip

      this.state={
          tooltipText:{
              dashboard:[
                  {
                    title: 'Visualize your story dashboard!',
                    target: '.dashboard-menu',
                    content: 'Click on dashboard and visualize your story. If you followed the steps as specified, you will see a summary view, a graph view and a timeline view.',
                    disableBeacon: false
                  },
                  {
                    title: 'Share your story dashboard!',
                    target: '.shareOption',
                    content: 'After seeing the dashboard, share it with friends on social media by clicking on share story and using the public link.',
                    disableBeacon: true
                  }
              ]
          },
          showTooltip:{
              dashboard: JSON.parse(JSON.stringify(props.dashboardTooltip))
          }
      }

      this.renderOptions = this.renderOptions.bind(this);


      /* Add later if needed
      <ListItem button
                    selected={this.props.selectedVisualisation == "list"}
                    onClick={() => { this.selectNewVisualisation("list")}}                    
                    >
                    <Avatar>
                        <ListIcon />
                        </Avatar>
                        <ListItemText primary="List" />
                    </ListItem>
                    */
    }

    selectNewVisualisation(newVisualisation){
        this.props.selectVisualisation(newVisualisation);
    }

    renderOptions(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>OPTIONS</h3>
                <List className="">
                    <ListItem button 
                    selected={this.props.selectedVisualisation == "contributions"}
                    onClick={() => { this.selectNewVisualisation("contributions")}}
                    >
                    <Avatar>
                        <CreateIcon />
                    </Avatar>
                        <ListItemText primary="My Contributions"/>
                    </ListItem>

                    <ListItem button 
                    selected={this.props.selectedVisualisation == "manage_blockprobe"}
                    onClick={() => { this.selectNewVisualisation("manage_blockprobe")}}
                    >
                    <Avatar>
                        <BuildIcon />
                    </Avatar>
                        <ListItemText primary="Manage Blockprobe"/>
                    </ListItem>

                    {this.props.permit == "CREATOR"?
                        <div className='shareOption'>
                            <ListItem button 
                                selected={this.props.selectedVisualisation == "publish_blockprobe"}
                                onClick={() => { this.selectNewVisualisation("publish_blockprobe")}}
                                >
                                <Avatar>
                                    <ShareIcon />
                                </Avatar>
                                    <ListItemText primary="Share my story dashboard"/>
                            </ListItem>
                        </div>
                        :
                        null}
                </List>
            </div>
        )
    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render

        if (nextProps.dashboardTooltip !== this.state.showTooltip.dashboard) {
            var showTooltip = this.state.showTooltip;
            showTooltip.dashboard = JSON.parse(JSON.stringify(nextProps.dashboardTooltip));
            this.setState({ startTime: nextProps.startTime });
        }
    }

    render(){
        return(
            <div>
                <Joyride
                    steps={this.state.tooltipText.dashboard}
                    run = {this.state.showTooltip.dashboard}                    
                    />
                <h3 style={{textAlign:"center"}}>VISUALISE</h3>
                <List className="">
                    <div className='dashboard-menu'>
                                <ListItem button 
                                    selected={this.props.selectedVisualisation == "dashboard"}
                                    onClick={() => { this.selectNewVisualisation("dashboard")}}
                                    >
                                    <Avatar>
                                        <DashboardIcon />
                                    </Avatar>
                                        <ListItemText primary="Dashboard"/>
                                </ListItem>
                    </div>                    

                    <ListItem button 
                    selected={this.props.selectedVisualisation == "timeline"}
                    onClick={() => { this.selectNewVisualisation("timeline")}}
                    >
                    <Avatar>
                        <TimelineIcon />
                    </Avatar>
                        <ListItemText primary="Timeline"/>
                    </ListItem>

                    <ListItem button
                    selected={this.props.selectedVisualisation == "graph"}
                    onClick={() => { this.selectNewVisualisation("graph")}}
                    >
                    <Avatar>
                        <AcUnitIcon />
                    </Avatar>
                        <ListItemText primary="Graph" />
                    </ListItem>
                    
                    <ListItem button
                    selected={this.props.selectedVisualisation == "find_connections"}
                    onClick={() => { this.selectNewVisualisation("find_connections")}}
                    >      
                    <Avatar>
                        <GroupIcon />
                    </Avatar>
                        <ListItemText primary="Find Connections" />
                    </ListItem>

                    </List>
                    {(!this.props.isViewOnly && this.props.permit != "VIEWER")? 
                        this.renderOptions()
                        :
                        null    
                    }
            </div>
        );
    }


}
export default VisualizeOptionsListComponent;