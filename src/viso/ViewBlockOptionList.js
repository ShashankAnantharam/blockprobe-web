import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PeopleIcon from '@material-ui/icons/People';
import UndoIcon from '@material-ui/icons/Undo'; 
import ThumbUpIcon from '@material-ui/icons/ThumbUp'; 
import DoneAllIcon from '@material-ui/icons/DoneAll';
import './ViewBlock.css';

class ViewBlockListComponent extends React.Component {

    constructor(props){
        super(props);
        //props: blockState, clickOption, canCommit
        this.selectOption = this.selectOption.bind(this);
        this.renderReviewOptionList = this.renderReviewOptionList.bind(this);
        this.renderSubmitterOptionList = this.renderSubmitterOptionList.bind(this);
    }

    selectOption(option){

    }

    renderReviewOptionList(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>OPTIONS</h3>
                <List className="view-block-option-list">
                    <ListItem button 
                    onClick={() => { this.selectOption("upvote")}}
                    >
                    <Avatar >
                        <ThumbUpIcon/>
                    </Avatar>
                        <ListItemText primary="Upvote and Pass On"/>
                    </ListItem>

                </List>
            </div>
        );
    }

    renderSubmitterOptionList(){
        return(
            <div>
                <h3 style={{textAlign:"center"}}>OPTIONS</h3>
                <List className="view-block-option-list">

                    {this.props.canCommit?
                        <ListItem button 
                        onClick={() => { this.selectOption("can_commit")}}
                        >
                        <Avatar>
                            <DoneAllIcon />
                        </Avatar>
                            <ListItemText primary="Commit Block to Investigation"/>
                        </ListItem>
                        :
                        null}

                    <ListItem button 
                    onClick={() => { this.selectOption("revert")}}
                    >
                    <Avatar>
                        <UndoIcon />
                    </Avatar>
                        <ListItemText primary="Revert to Draft"/>
                    </ListItem>

                    <ListItem button 
                    onClick={() => { this.selectOption("reassign_reviewer")}}
                    >
                    <Avatar>
                        <PeopleIcon />
                    </Avatar>
                        <ListItemText primary="Reassign Reviewer"/>
                    </ListItem>

                </List>
            </div>
        );
    }

    render(){
        return (
            <div>
                {this.props.blockState == 'TO REVIEW'?
                this.renderReviewOptionList():
                null}

                {this.props.blockState == 'UNDER REVIEW'?
                this.renderSubmitterOptionList():
                null}

            </div>
        );
    }


}
export default ViewBlockListComponent;