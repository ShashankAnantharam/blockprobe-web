import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

class UserBlockprobesComponent extends React.Component {

    constructor(props){
        
        //Probs include blockprobes, selectBlockprobe, selectedBlockprobe
        super(props);
        this.renderSingleBlockprobeItem = this.renderSingleBlockprobeItem.bind(this);
    }

    selectBlockprobe(blockprobeId){
        this.props.selectBlockprobe(blockprobeId);
    }

    renderSingleBlockprobeItem(blockprobe, scope){
        //console.log(blockprobe);
        return (
                <ListItem button 
                    selected={scope.props.selectedBlockprobe == blockprobe.id}
                    onClick={() => { scope.selectBlockprobe(blockprobe.id)}}
                    style={{width:'100%'}}
                    >
                    <ListItemText primary={blockprobe.title} secondary={blockprobe.summary}/>
                </ListItem>
        );
    }

    render(){

        const scope = this;
        //console.log(this.props.blockprobes)
        const blockprobeListRender = Object.keys(this.props.blockprobes).
        map((blockprobeId) => (
            scope.renderSingleBlockprobeItem(scope.props.blockprobes[blockprobeId], scope)
        ));

        //console.log(blockprobeListRender);

        return (
            <div>
                <List>                   
                    {blockprobeListRender}
                </List>
            </div>
        );
    }


}
export default UserBlockprobesComponent;