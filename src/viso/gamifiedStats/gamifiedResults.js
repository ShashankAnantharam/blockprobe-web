import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import * as firebase from 'firebase';
import GamifiedGraphStats from './gamifiedGraphStats';
import './gamifiedResults.css';

class GamifiedResultsComponent extends React.Component {
    constructor(props) {
      super(props);
      //gameId, userId 

      this.state={
          topPerformance: [],
          latestPerformances: [],
          title: null
      }
      this.formatEntityStats = this.formatEntityStats.bind(this);
      this.renderSinglePerformance = this.renderSinglePerformance.bind(this);
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
            resultLatest.forEach((doc) => {
                let scoreDetails = doc.data();
                latestPerformances.push(scoreDetails);
            }); 

            console.log(topScores);
            console.log(latestPerformances);
            if(latestPerformances.length > 0){
                let title = latestPerformances[0].bpTitle;
                scope.setState({
                    title: title
                });
            }

            scope.setState({
                topPerformance: topScores,
                latestPerformances: latestPerformances
            });
        });

    }

    formatEntityStats(entityStats){
        //Get rid  of  this function later
        let newEntityStats = {};
        for(let entity in entityStats){
            newEntityStats[entity] = entityStats[entity].mistakes;
        }
        return newEntityStats;
    }

    renderSinglePerformance(stats, type){
        if(stats.entityStats)
            stats.entityStats = this.formatEntityStats(stats.entityStats);
        return (
            <div>
                <GamifiedGraphStats
                    stats = {stats}
                    bpId={this.props.gameId}
                    title={this.state.title}
                    id = {String(stats.ts) + "_" + type}
                    ts = {stats.ts}
                    canSave = {false}
                    />
            </div>
        )
    }


    render(){
        let scope = this;
        let latestPerformanceRender = this.state.latestPerformances.map(performance => {
            return scope.renderSinglePerformance(performance,'latest');
        })
        let topPerformanceRender = this.state.topPerformance.map(performance => {
            return scope.renderSinglePerformance(performance,'top');
        })
        return (
            <div>
                <h4 className="gamePerformanceHeader">Top performance</h4>
                <div className="gamePerformanceContent">
                    {topPerformanceRender}
                </div>
                <h4 className="gamePerformanceHeader">Latest performances</h4>
                <div className="gamePerformanceContent">
                    {latestPerformanceRender}
                </div>
            </div>
        )
    }
}
export default GamifiedResultsComponent;