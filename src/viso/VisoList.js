import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import TimelineIcon from '@material-ui/icons/Timeline';
import AcUnitIcon from '@material-ui/icons/AcUnit'; 
import GroupIcon from '@material-ui/icons/Group'; 
import ListIcon from '@material-ui/icons/List';

class VisualizeOptionsListComponent extends React.Component {

    constructor(props){
      super(props);
    }

    render(){
        return(
            <div>
                <List className="">
                    <ListItem button selected={true}>
                    <Avatar>
                        <TimelineIcon />
                        </Avatar>
                        <ListItemText primary="Timeline"/>
                    </ListItem>
                    
                    <ListItem button>
                    <Avatar>
                        <ListIcon />
                        </Avatar>
                        <ListItemText primary="List" />
                    </ListItem>
                    
                    <ListItem button>
                    <Avatar>
                        <AcUnitIcon />
                        </Avatar>
                        <ListItemText primary="Graph" />
                    </ListItem>
                    
                    <ListItem button>      
                    <Avatar>
                        <GroupIcon />
                        </Avatar>
                        <ListItemText primary="Find Connections" />
                    </ListItem>

                    </List>
            </div>
        );
    }


}
export default VisualizeOptionsListComponent;