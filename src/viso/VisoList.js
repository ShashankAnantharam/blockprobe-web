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
import ListIcon from '@material-ui/icons/List';
import './VisoList.css';

class VisualizeOptionsListComponent extends React.Component {

    constructor(props){
      super(props);

      this.state={
          shouldShowOptions:false
      }

      this.renderOptions = this.renderOptions.bind(this);

      if(!props.isViewOnly){
          //View only
            this.setState({
                shouldShowOptions:true
            })
      }

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
                    {!this.props.isViewOnly? 
                        this.renderOptions()
                        :
                        null    
                    }
            </div>
        );
    }


}
export default VisualizeOptionsListComponent;