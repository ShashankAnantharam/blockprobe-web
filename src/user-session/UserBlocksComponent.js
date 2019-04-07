import React, { Component } from 'react';
import * as firebase from 'firebase';


////var uIdHash = crypto.createHash('sha256').update(`${userId}`).digest('hex');

class UserBlocksComponent extends React.Component {
    
    constructor(props){
        super(props);

        this.state={
            uIdHash:'',
            shajs:null
        }
        //props include bpId, uId
        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

    }


    render(){
        return(
            <div>
                {this.state.uIdHash}
            </div>
        );
    }


}
export default UserBlocksComponent;