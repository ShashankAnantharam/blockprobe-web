import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import './gamifiedResults.css';

class GamifiedResultsComponent extends React.Component {
    constructor(props) {
      super(props);
      //gameId, userId 

      this.state={
          topPerformance: [],
          latestPerformances: []
      }

    }

    componentDidMount(){
        let bpId = this.props.gameId;
        let userId = this.props.userId;

        let db = firebase.firestore();
        let allScores = db.collection("Users").doc(userId)
        .collection('gameScores');

        let queryTop = allScores.where('bpId', '==', bpId).orderBy('score','desc').limit(1).get();
        let queryLatest = allScores.where('bpId', '==', bpId).orderBy('ts','desc').limit(5).get();

        let promises = [queryTop, queryLatest];
        let scope = this;
        Promise.all(promises).then(results => {
            const [resultTop, resultLatest] = results;
            let topScores = [];
            resultTop.forEach((doc) => {
                let scoreDetails = doc.data();
                topScores.push(scoreDetails);
            });

            let latestPerformances = [];
            resultTop.forEach((doc) => {
                let scoreDetails = doc.data();
                latestPerformances.push(scoreDetails);
            }); 

            console.log(topScores);
            console.log(latestPerformances);

            scope.setState({
                topPerformance: topScores,
                latestPerformances: latestPerformances
            });
        });

    }

    render(){
        return (
            <div>
                RESULTS
            </div>
        )
    }
}
export default GamifiedResultsComponent;