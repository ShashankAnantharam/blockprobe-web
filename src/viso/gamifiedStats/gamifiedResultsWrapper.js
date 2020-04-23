import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import GamifiedResultsComponent from './gamifiedResults';
import './gamifiedResults.css';

class GamifiedResultsWrapper extends React.Component {
    constructor(props) {
      super(props);
      //gameId 
    
    }


    render(){
        return (
            <div>
                {!isNullOrUndefined(this.props.match.params.gameId)? 
                    <GamifiedResultsComponent
                        gameId = {this.props.match.params.gameId}
                        userId = {'shashank95.a@gmail.com'}
                        />
                    :
                    null
                }                
            </div>
        )
    }
}
export default GamifiedResultsWrapper;