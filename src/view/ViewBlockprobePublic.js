import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import * as firebase from 'firebase';
import 'firebase/firestore';

// /view/3a30893249f6952e26de1ce709094e6952731beb9e37c244c07e542e81f52227

class ViewBlockprobePublicComponent extends React.Component {

    constructor(props){
        super(props);
        this.state={
            testList:[]
        }
    }

    addBlocksToProbe(doc){
        this.setState((prevState) => ({
            testList: [...prevState.testList, ...doc.data().blocks]
         }));
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
        return (
            <div>
          <div>{this.props.match.params.bId}</div>
            <div>{this.state.testList.length}</div>
            </div>
            );
    }


}

export default ViewBlockprobePublicComponent;