import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';
import { timingSafeEqual } from 'crypto';

// /view/3a30893249f6952e26de1ce709094e6952731beb9e37c244c07e542e81f52227

class ViewBlockprobePublicComponent extends React.Component {

    constructor(props){
        super(props);
        this.state={
            blockTree: {}
        }
    }

    addBlocksToProbe(doc){      
         doc.data().blocks.forEach(block => {
             var tempState = this.state.blockTree;
             tempState[block.key] = block;
             this.setState({
                 blockTree:tempState
             })
         });
    }

    createBlockprobe(snapshot){
        snapshot.forEach((doc) => ( this.addBlocksToProbe(doc)));
    }

    componentDidMount(){
        firebase.firestore().collection("public").doc(this.props.match.params.bId)
        .collection("aggBlocks").get().then((snapshot) => (
            this.createBlockprobe(snapshot)
         ));
    }

    render(){
        const mapItems = Object.keys(this.state.blockTree).map((key, index) => 
        <li>{key}</li>);
        return (
            <div>
          <div>{this.props.match.params.bId}</div>
            <div>{Object.keys(this.state.blockTree).length}</div>           
            <div>{mapItems}</div>
            </div>
            );
    }


}

export default ViewBlockprobePublicComponent;