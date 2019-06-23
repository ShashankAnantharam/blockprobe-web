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
import ListIcon from '@material-ui/icons/List';
import './VisoList.css';

class VisualizeOptionsListComponent extends React.Component {

    constructor(props){
      super(props);
      //role

      this.state={
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
                    <ListItem button 
                        selected={this.props.selectedVisualisation == "publish_blockprobe"}
                        onClick={() => { this.selectNewVisualisation("publish_blockprobe")}}
                        >
                        <Avatar>
                            <ShareIcon />
                        </Avatar>
                            <ListItemText primary="Share Blockprobe"/>
                    </ListItem>
                        :
                        null}
                </List>
            </div>
        )
    }

    render(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>VISUALISE</h3>
                <List className="">
                    <ListItem button 
                    selected={this.props.selectedVisualisation == "dashboard"}
                    onClick={() => { this.selectNewVisualisation("dashboard")}}
                    >
                    <Avatar>
                        <DashboardIcon />
                    </Avatar>
                        <ListItemText primary="Dashboard"/>
                    </ListItem>

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