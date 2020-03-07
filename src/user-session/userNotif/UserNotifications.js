import React, { Component } from 'react';
import './UserNotifications.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { isNullOrUndefined } from 'util';

class UserNotifications extends React.Component {
    constructor(props) {
      super(props);
      //notifications
      //console.log(props.notifications);

      this.renderSingleNotification = this.renderSingleNotification.bind(this);
      this.renderStoryInviteNotifications = this.renderStoryInviteNotifications.bind(this);
      this.clickOnNotification = this.clickOnNotification.bind(this);
    }

    renderStoryInviteNotifications(notifications){

        let renderStr = null;
        if(!isNullOrUndefined(notifications)){
            renderStr = Object.keys(notifications).map((key) => {
                let notification = notifications[key];
                let title = notification.title;
                let summary = "You have been invited to contribute to this story as admin."
                return this.renderSingleNotification(title, summary, 'storyInvite');
            });
        }
        return (
            <div>
                {renderStr}
            </div>
        )
    }

    clickOnNotification(type){

    }

    renderSingleNotification(title, summary, type){


       return(
            <ListItem button 
                onClick={() => { this.clickOnNotification(type)}}
                style={{width:'100%'}}
                >
                <ListItemText 
                 primary={title} 
                 secondary={summary}/>
            </ListItem>                    
        );
        
    }

    render(){

        return (
            <div>
                <h2 style={{textAlign:'center'}}>Notifications</h2>
                <Tabs className="notificationsTab">
                    <TabList>
                        <Tab>Story invites</Tab>
                    </TabList>

                    <TabPanel>
                        <List>{this.renderStoryInviteNotifications(this.props.notifications)}</List>
                    </TabPanel>
                </Tabs>
            </div>
        )
    }
}
export default UserNotifications;
