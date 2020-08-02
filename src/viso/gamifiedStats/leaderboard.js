import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import TextField from '@material-ui/core/TextField';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import GamifiedResultsComponent from './gamifiedResults';
import GameTable from './gamifiedResultTable/gamifiedResultTable';
import * as firebase from 'firebase';
import * as XLSX from 'xlsx';
import * as Utils from '../../common/utilSvc';
import AmPieChart from '../charts/amPieChart';
import * as AmConst from '../../common/amConst';
import { Grid } from '@material-ui/core';
import ReactExport from "react-export-excel";
import './gamifiedResults.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class LeaderboardView extends React.Component {
    constructor(props) {
      super(props);
      //gameId 

      this.state = {          
          playerIds: [],
          fileResults: [],
          fileStats: {
            agg_mttEntityStats: {},
            agg_mttRawStats: {},
            agg_mttCorrectStats: {},
            agg_mttWrongStats: {}
          }
      }

      this.getPlayers = this.getPlayers.bind(this);
      this.getFullTable = this.getFullTable.bind(this);
      this.getData = this.getData.bind(this);
      this.aggregateMttStats = this.aggregateMttStats.bind(this);
      this.getRemainingEdges = this.getRemainingEdges.bind(this);
      this.shouldShowStats = this.shouldShowStats.bind(this);
      this.formatEntityStats = this.formatEntityStats.bind(this);
      this.isEntityStatsNewType = this.isEntityStatsNewType.bind(this);
    }

    getRemainingEdges(remainingEdges, correctEdges){
        for(let key in correctEdges){
            if(key in remainingEdges){
                delete remainingEdges[key];
            }
        }
        return remainingEdges;
    }

    componentDidMount(){
        this.getPlayers();
    }

    getPlayers(){
        let scope = this;
        let bpId = this.props.match.params.gameId;
        firebase.firestore().collection('publicStatus').doc(bpId).get().then(
            snapshot => {
                let viewerList = [];
                if(snapshot.data().userList)
                    viewerList = snapshot.data().userList;
                scope.setState({
                    playerIds: viewerList
                });
                scope.getFullTable(viewerList);
            }
        );
    }

    async getData(userId){
        if(isNullOrUndefined(userId) || userId.trim().length==0)
            return;

        let bpId = this.props.match.params.gameId;

        let db = firebase.firestore();
        let allScores = db.collection("Users").doc(userId)
        .collection('gameScores');

        let queryTop = allScores.where('bpId', '==', bpId).orderBy('score','desc').limit(1).get();
        let queryTimelineTop = allScores.where('bpId', '==', String(bpId + '_ts')).orderBy('score','desc').limit(1).get();

        let promises = [queryTop, queryTimelineTop];
        let scope = this;
        return Promise.all(promises).then(results => {
            const [resultTop, resultTimelineTop] = results;
            let topScores = [];
            resultTop.forEach((doc) => {
                let scoreDetails = doc.data();
                topScores.push(scoreDetails);
            });

            let timelineTopScores = [];
            resultTimelineTop.forEach((doc) => {
                let scoreDetails = doc.data();
                timelineTopScores.push(scoreDetails);
            });

            let mtt = 0, ftd = 0, mtt_stats={}, ftd_stats={};
            let mtt_rawStats={}, mtt_missedStats={}, mtt_correctStats={};
            if(timelineTopScores && timelineTopScores.length > 0 && 
                !isNullOrUndefined(timelineTopScores[0].score)){
                ftd = timelineTopScores[0].score;
                ftd_stats = timelineTopScores[0].entityStats;               
            }
            if(topScores && topScores.length > 0 && 
                !isNullOrUndefined(topScores[0].score)){
                mtt = topScores[0].score;                
                mtt_stats = topScores[0].entityStats;
                mtt_rawStats = topScores[0].rawStats;
                if(topScores[0].correctEdges)
                    mtt_correctStats = topScores[0].correctEdges;
                if(topScores[0].remainingEdges)
                    mtt_missedStats = scope.getRemainingEdges(topScores[0].remainingEdges,mtt_correctStats);
            }
            return {
                id: userId, mtt: mtt, ftd: ftd,
                mtt_stats: mtt_stats, ftd_stats: ftd_stats,
                mtt_rawStats: mtt_rawStats, mtt_correctStats: mtt_correctStats,
                mtt_missedStats: mtt_missedStats
            };
        },
        error => {
            return {id: userId, mtt: 0, ftd: 0, ftd_stats:{}, mtt_stats:{},
        mtt_rawStats: {}, mtt_missedStats:{}, mtt_correctStats:{}};
        });
    }

    formatEntityStats(entityStats){
        //Get rid  of  this function later
        let newEntityStats = {};
        if(isNullOrUndefined(entityStats))
            return {};
        for(let entity in entityStats){
            if(entityStats[entity])
                newEntityStats[entity] = {
                    entity: entity,
                    mistakes: entityStats[entity]
                };
        }
        return newEntityStats;
    }

    isEntityStatsNewType(entityStats){
        if(isNullOrUndefined(entityStats))
            return false;
        for(let key in entityStats){
            if(isNullOrUndefined(entityStats[key].mistakes))
                return false;
        }
        return true;
    }

    aggregateMttStats(listMap, type){
        let aggStats = {};
        for(let i=0; listMap && i<listMap.length; i++){
            let currMap = listMap[i][type];
            if(currMap){
                for(let key in currMap){
                    if(type=='mtt_rawStats'){
                        let newKey = currMap[key].e1 + "---" + currMap[key].e2;
                        let value = 'count';
                        if(!(newKey in aggStats)){
                            aggStats[newKey] = 0;
                        }
                        aggStats[newKey] += currMap[key][value];
                    }
                    else if(type=='mtt_stats'){
                        if(!this.isEntityStatsNewType(currMap))
                            currMap = this.formatEntityStats(currMap);
                        let newKey = currMap[key]['entity'];
                        let value = 'mistakes';
                        if(!(newKey in aggStats)){
                            aggStats[newKey] = 0;
                        }
                        aggStats[newKey] += currMap[key][value];
                    }
                    else if(type=='mtt_correctStats' || type=='mtt_missedStats'){
                        let newKey = key;
                        if(!(newKey in aggStats)){
                            aggStats[newKey] = 0;
                        }
                        aggStats[newKey]++;
                    }
                }
            }
        }
        return aggStats;
    }

    async getFullTable(userIdData){
        let allPromises = [], scope=this;
        for(let i=0; i<userIdData.length; i++){
            if(!isNullOrUndefined(userIdData[i]) && userIdData[i].id.trim().length>0){
                allPromises.push(this.getData(userIdData[i].id));
            }
        }
        Promise.all(allPromises).then(results => {
            let agg_entityStats = scope.aggregateMttStats(results,'mtt_stats');
            let agg_rawMttStats = scope.aggregateMttStats(results,'mtt_rawStats');
            let agg_correctMttStats = scope.aggregateMttStats(results,'mtt_correctStats');
            let agg_wrongMttStats = scope.aggregateMttStats(results,'mtt_missedStats');

            let fileStats= scope.state.fileStats;
            fileStats.agg_mttRawStats = agg_rawMttStats;
            fileStats.agg_mttEntityStats = agg_entityStats;
            fileStats.agg_mttCorrectStats = agg_correctMttStats;
            fileStats.agg_mttWrongStats = agg_wrongMttStats;

            scope.setState({
                fileResults: results,
                fileStats: fileStats
            });
        });
    }

    shouldShowStats(){
        return (Object.keys(this.state.fileStats.agg_mttEntityStats).length + 
        Object.keys(this.state.fileStats.agg_mttCorrectStats).length + 
        Object.keys(this.state.fileStats.agg_mttWrongStats).length + 
        Object.keys(this.state.fileStats.agg_mttRawStats).length > 0)
    }

    render(){
        return (
            <div>
                <h3 style={{textAlign:'center'}}>Leaderboard</h3>
                {this.state.fileResults.length>0?
                    <div className="input-userId-getScore-container">
                        <div>
                            <GameTable
                                data={this.state.fileResults}
                            />
                        </div>
                        <div>                  
                            <ExcelFile element={
                                <Button 
                                    variant="contained"
                                    className="downloadButton" 
                                    onClick={(e) => {}}>
                                        <div>Download</div>
                                </Button>
                            }
                            filename="Results">
                                <ExcelSheet data={this.state.fileResults} name="Results">
                                    <ExcelColumn label="UserId" value="id"/>
                                    <ExcelColumn label="Match the topics" value="mtt"/>
                                    <ExcelColumn label="Fill the dates" value="ftd"/>
                                </ExcelSheet>
                            </ExcelFile>
                        </div>
                        <div style={{display:'flex', flexWrap:'wrap'}}>
                            {Object.keys(this.state.fileStats.agg_mttEntityStats).length>0?
                                <Grid md={6} xs={12}>
                                    <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Mistakes (topic-wise)</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttEntityStats)}
                                                    id = {"pie_mtt_aggEntityStats"}
                                                    category = {"key"}
                                                    value = {"value"}
                                                    colorSet = {AmConst.redShade}  
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                                :
                                null
                            }
                            {Object.keys(this.state.fileStats.agg_mttRawStats).length>0?
                                <Grid md={6} xs={12}>
                                    <div style={{paddingLeft:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Mistakes (connections)</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttRawStats)}
                                                    id = {"pie_mtt_aggRawStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
                                                    colorSet = {AmConst.redShade}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Grid>  
                                :
                                null
                            }
                            {Object.keys(this.state.fileStats.agg_mttCorrectStats).length>0?
                                <Grid md={6} xs={12}>
                                    <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Correct connections</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttCorrectStats)}
                                                    id = {"pie_mtt_aggCorrectMttStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
                                                    colorSet = {AmConst.greenShade}  
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Grid>  
                                :
                                null
                            }
                            {Object.keys(this.state.fileStats.agg_mttWrongStats).length>0?
                                <Grid md={6} xs={12}>
                                    <div style={{paddingLeft:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Missed connections</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttWrongStats)}
                                                    id = {"pie_mtt_aggWrongMttStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
                                                    colorSet = {AmConst.blueShade}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Grid>  
                                :
                                null
                            }
                        </div>
                        {this.shouldShowStats()?                        
                            <div>                  
                                <ExcelFile element={
                                    <Button 
                                        variant="contained"
                                        className="downloadButton" 
                                        onClick={(e) => {}}>
                                            <div>Download statistics</div>
                                    </Button>
                                }
                                filename="Statistics">
                                    <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_mttRawStats)} name="Mistakes (connections)">
                                        <ExcelColumn label="Connection" value="key"/>
                                        <ExcelColumn label="Count" value="value"/>
                                    </ExcelSheet>
                                    <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_mttEntityStats)} name="Mistakes (Topic)">
                                        <ExcelColumn label="Topic" value="key"/>
                                        <ExcelColumn label="Count" value="value"/>
                                    </ExcelSheet>
                                    <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_mttCorrectStats)} name="Correct connections">
                                        <ExcelColumn label="Connection" value="key"/>
                                        <ExcelColumn label="Count" value="value"/>
                                    </ExcelSheet>
                                    <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_mttWrongStats)} name="Missed connections">
                                        <ExcelColumn label="Connection" value="key"/>
                                        <ExcelColumn label="Count" value="value"/>
                                    </ExcelSheet>
                                </ExcelFile>
                            </div>
                            :
                            null
                        }
                    </div>
                    :
                    null
                }         
            </div>
        )
    }
}
export default LeaderboardView;