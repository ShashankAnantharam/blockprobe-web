import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import TimelineIcon from '@material-ui/icons/Timeline';
import AcUnitIcon from '@material-ui/icons/AcUnit'; 
import GroupIcon from '@material-ui/icons/Group'; 
import ListIcon from '@material-ui/icons/List';
import './VisoList.css';

class VisualizeOptionsListComponent extends React.Component {

    constructor(props){
      super(props);
    }

    selectNewVisualisation(newVisualisation){
        this.props.selectVisualisation(newVisualisation);
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

                    <ListItem button
                    selected={this.props.selectedVisualisation == "list"}
                    onClick={() => { this.selectNewVisualisation("list")}}                    
                    >
                    <Avatar>
                        <ListIcon />
                        </Avatar>
                        <ListItemText primary="List" />
                    </ListItem>

                    </List>
            </div>
        );
    }


}
export default VisualizeOptionsListComponent;