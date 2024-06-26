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
import ReactGA from 'react-ga';
import './gamifiedResults.css';
import SimpleScoreTable from './gamifiedResultTable/simpleScoreTable';

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
            agg_mttWrongStats: {},
            agg_potpCorrect: {
                title: {},
                summary: {}
            },
            agg_potpMissed: {
                title: {},
                summary: {}
            },
            agg_potpMistakes:{
                title: {},
                summary: {}
            }
          },
          newScores: {
              'ftd': [],
              'mtt': []
          },
          renderNewScores: false
      }

      ReactGA.initialize('UA-143383035-1');

      this.getPlayers = this.getPlayers.bind(this);
      this.getFullTable = this.getFullTable.bind(this);
      this.getData = this.getData.bind(this);
      this.aggregateMttStats = this.aggregateMttStats.bind(this);
      this.aggregatePotpStats = this.aggregatePotpStats.bind(this);
      this.getMissedPartsAns = this.getMissedPartsAns.bind(this);
      this.getFormatedCorrectPotpStats = this.getFormatedCorrectPotpStats.bind(this);
      this.getRemainingEdges = this.getRemainingEdges.bind(this);
      this.shouldShowStats = this.shouldShowStats.bind(this);
      this.formatEntityStats = this.formatEntityStats.bind(this);
      this.isEntityStatsNewType = this.isEntityStatsNewType.bind(this);
      this.getLeadersForGame = this.getLeadersForGame.bind(this);
      this.getLeaders = this.getLeaders.bind(this);
      this.renderSingleLeaderboard = this.renderSingleLeaderboard.bind(this);
      this.renderAllLeaderboards = this.renderAllLeaderboards.bind(this);
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
        ReactGA.event({
            category: 'view_leaderboard',
            action: 'View leaderboard ' + this.props.match.params.gameId,
            label: this.props.match.params.gameId
          });
    }

    getPlayers(){
        let scope = this;
        let bpId = this.props.match.params.gameId;
        firebase.firestore().collection('publicStatus').doc(bpId).get().then(
            snapshot => {                
                if(snapshot.exists && snapshot.data().isUserLimited){
                    let viewerList = [];
                    if(snapshot.data().userList)
                    viewerList = snapshot.data().userList;
                    scope.setState({
                        playerIds: viewerList
                    });
                    scope.getFullTable(viewerList);
                }
                else{
                    scope.getLeaders(bpId);
                }
            }
        );
    }

    async getLeaders(bpId){
        let types = ['mtt','ftd','potp'];
        let leaderScores = {};
        for(let i=0; i<types.length; i++){
            let scores = await this.getLeadersForGame(types[i], bpId);
            leaderScores[types[i]] = scores;
        }
        let agg_entityStats = this.aggregateMttStats(leaderScores['mtt'],'mtt_stats');
        let agg_rawMttStats = this.aggregateMttStats(leaderScores['mtt'],'mtt_rawStats');
        let agg_correctMttStats = this.aggregateMttStats(leaderScores['mtt'],'mtt_correctStats');
        let agg_wrongMttStats = this.aggregateMttStats(leaderScores['mtt'],'mtt_missedStats');

        let agg_potpMistakes = this.aggregatePotpStats(leaderScores['potp'],'potp_wrongStats');
        let agg_potpCorrect = this.aggregatePotpStats(leaderScores['potp'],'potp_correctStats');
        let agg_potpMissed = this.aggregatePotpStats(leaderScores['potp'],'potp_missedStats');

        let fileStats= this.state.fileStats;
        fileStats.agg_mttRawStats = agg_rawMttStats;
        fileStats.agg_mttEntityStats = agg_entityStats;
        fileStats.agg_mttCorrectStats = agg_correctMttStats;
        fileStats.agg_mttWrongStats = agg_wrongMttStats;
        fileStats.agg_potpMistakes = agg_potpMistakes;
        fileStats.agg_potpCorrect = agg_potpCorrect;
        fileStats.agg_potpMissed = agg_potpMissed;
        //console.log(fileStats);

        this.setState({
            newScores: leaderScores,
            renderNewScores: true,
            fileStats: fileStats
        });
    }

    getMissedPartsAns(correct, total){
        let missed = {
            title: {},
            summary: {}
        };
        if(isNullOrUndefined(total)){
            total = {};
        }
        if(isNullOrUndefined(correct)){
            correct = {};
        }
        for(let key in total){
            let name = null;
            if(total[key].name){
                name = total[key].name;
            }
            if(!isNullOrUndefined(name)){
                if(total[key].title && !((key in correct) && (correct[key].title))){
                    if(!(key in missed.title)){
                        missed.title[key] = {
                            name: total[key].name,
                            count: 0
                        }
                    }
                    missed.title[key].count++;
                }
                if(total[key].summary && !((key in correct) && (correct[key].summary))){
                    if(!(key in missed.summary)){
                        missed.summary[key] = {
                            name: total[key].name,
                            count: 0
                        }
                    }
                    missed.summary[key].count++;
                }
            }

        }
        return missed;
    }

    getFormatedCorrectPotpStats(correct){
        //Correct

        let ans = {
            title: {},
            summary: {}
        }

        if(isNullOrUndefined(correct)){
           correct = {};
        }
        for(let key in correct){
            let name = null;
            if(correct[key].name){
                name = correct[key].name;
            }
            if(!isNullOrUndefined(name)){
                if(correct[key].title){
                    if(!(key in ans.title)){
                        ans.title[key] = {
                            name: name,
                            count: 0
                        };
                    }
                    ans.title[key].count++;
                }
                if(correct[key].summary){
                    if(!(key in ans.summary)){
                        ans.summary[key] = {
                            name: name,
                            count: 0
                        };
                    }
                    ans.summary[key].count++;
                }
            }
        }
        return ans;
    }

    async getLeadersForGame(type, bpId){
        //type = ftd,mtt
        let db = firebase.firestore();
        let allScores = db.collection('gameLeaderboards').doc(bpId).collection(type);
        let queryTop = allScores.orderBy('score','desc').limit(100).get();
        let topScores = await queryTop;

        let scores = [];
        if(topScores){
            topScores.forEach((doc) => {
                if(doc.exists){
                    let score = doc.data();
                    score['id'] = score['userId'];

                    if(type == 'mtt'){
                        score['mtt_stats'] = score.entityStats;
                        delete score['entityStats'];
                        score['mtt_rawStats'] = score.rawStats;
                        delete score['rawStats'];
                        score['mtt_correctStats'] = [];
                        score['mtt_missedStats'] = [];
                        if(score.correctEdges){
                            score['mtt_correctStats'] = score.correctEdges;
                            delete score['correctEdges'];
                        }
                        if(score.remainingEdges){
                            score['mtt_missedStats'] = this.getRemainingEdges(score.remainingEdges,score['mtt_correctStats']);
                            delete score['remainingEdges'];
                        }                        
                    }
                    else if(type == 'potp'){
                        score['potp_correctStats'] = {title:{},summary:{}};
                        score['potp_missedStats'] = {title:{},summary:{}};
                        score['potp_wrongStats'] = {title:{},summary:{}};
                        if(score.gameStats){
                            if(score.gameStats.correctAns){
                                score.potp_correctStats = this.getFormatedCorrectPotpStats(score.gameStats.correctAns);
                            }
                            if(score.gameStats.totalAns && score.gameStats.correctAns){
                                score.potp_missedStats = this.getMissedPartsAns(score.gameStats.correctAns,score.gameStats.totalAns);                                
                            }
                            if(score.gameStats.correctAns){
                                score.potp_wrongStats = score.gameStats.wrongAns;
                            }
                        }
                    }
                    scores.push(score);
                }
            });    
        }
        return scores;
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
        let queryPotpTop = allScores.where('bpId', '==', String(bpId + '_potp')).orderBy('score','desc').limit(1).get();

        let promises = [queryTop, queryTimelineTop, queryPotpTop];
        let scope = this;

        let potp_correctStats = {title:{},summary:{}};
        let potp_missedStats = {title:{},summary:{}};
        let potp_wrongStats = {title:{},summary:{}};
        return Promise.all(promises).then(results => {
            const [resultTop, resultTimelineTop, resultPotpTop] = results;
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

            let potpTopScores = [];
            resultPotpTop.forEach((doc) => {
                let scoreDetails = doc.data();
                potpTopScores.push(scoreDetails);
            });

            let mtt = 0, ftd = 0, potp=0, mtt_stats={}, ftd_stats={};
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
            if(potpTopScores && potpTopScores.length>0 && 
                !isNullOrUndefined(potpTopScores[0].score)){
                    potp = potpTopScores[0].score;
                    if(potpTopScores[0].gameStats){
                        if(potpTopScores[0].gameStats.correctAns){
                            potp_correctStats = this.getFormatedCorrectPotpStats(potpTopScores[0].gameStats.correctAns);
                        }
                        if(potpTopScores[0].gameStats.totalAns && potpTopScores[0].gameStats.correctAns){
                            potp_missedStats = this.getMissedPartsAns(potpTopScores[0].gameStats.correctAns,potpTopScores[0].gameStats.totalAns);                                
                        }
                        if(potpTopScores[0].gameStats.correctAns){
                            potp_wrongStats = potpTopScores[0].gameStats.wrongAns;
                        }
                    }
                }
            return {
                id: userId, mtt: mtt, ftd: ftd, potp:potp,
                mtt_stats: mtt_stats, ftd_stats: ftd_stats,
                mtt_rawStats: mtt_rawStats, mtt_correctStats: mtt_correctStats,
                mtt_missedStats: mtt_missedStats,
                potp_correctStats: potp_correctStats, potp_missedStats: potp_missedStats,
                potp_wrongStats: potp_wrongStats
            };
        },
        error => {
            return {id: userId, mtt: 0, ftd: 0, potp:0, ftd_stats:{}, mtt_stats:{},
        mtt_rawStats: {}, mtt_missedStats:{}, mtt_correctStats:{},
        potp_correctStats: potp_correctStats, potp_missedStats: potp_missedStats,
        potp_wrongStats: potp_wrongStats};
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

    aggregatePotpStats(listMap, type){
        //Aggregate here
        let aggStats = {
            title: {},
            summary: {}
        };
        for(let i=0; listMap && i<listMap.length; i++){
            let currMap_main = listMap[i][type];
            if(currMap_main){
                for(let answerType in currMap_main){
                    //answerType is title or summary
                    let currMap = currMap_main[answerType];
                    if(currMap){
                        for(let key in currMap){
                            let name = currMap[key].name;
                            if(!isNullOrUndefined(name)){
                                if(!(name in aggStats[answerType])){
                                    aggStats[answerType][name] = 0;
                                }
                                if(currMap[key].count){
                                    aggStats[answerType][name] += currMap[key].count;                                
                                }
                                if(currMap[key].mistakes){
                                    if(answerType=='summary')                                
                                    {
                                        aggStats[answerType][name] += currMap[key].mistakes;
                                    }
                                    else if(answerType=="title"){
                                        let countMistakes = 0;
                                        for(let mistakeVal in currMap[key].mistakes){
                                            countMistakes += currMap[key].mistakes[mistakeVal];
                                        }
                                        aggStats[answerType][name] += countMistakes;
                                    }
                                }
                                /*
                                if(answerType=='title' && type=='potp_wrongStats')
                                        console.log(key,i,currMap,aggStats,type,answerType);
                                */                                    
                            }
                        }
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

            let agg_potpMistakes = this.aggregatePotpStats(results,'potp_wrongStats');
            let agg_potpCorrect = this.aggregatePotpStats(results,'potp_correctStats');
            let agg_potpMissed = this.aggregatePotpStats(results,'potp_missedStats');

            let fileStats= scope.state.fileStats;
            fileStats.agg_mttRawStats = agg_rawMttStats;
            fileStats.agg_mttEntityStats = agg_entityStats;
            fileStats.agg_mttCorrectStats = agg_correctMttStats;
            fileStats.agg_mttWrongStats = agg_wrongMttStats;
            fileStats.agg_potpMistakes = agg_potpMistakes;
            fileStats.agg_potpCorrect = agg_potpCorrect;
            fileStats.agg_potpMissed = agg_potpMissed;

            scope.setState({
                fileResults: results,
                fileStats: fileStats
            });
        });
    }

    shouldShowStats(type){
        if(type=='mtt')
        {    
            return (Object.keys(this.state.fileStats.agg_mttEntityStats).length + 
            Object.keys(this.state.fileStats.agg_mttCorrectStats).length + 
            Object.keys(this.state.fileStats.agg_mttWrongStats).length + 
            Object.keys(this.state.fileStats.agg_mttRawStats).length > 0);
        }
        if(type=='potp'){
            return (
                Object.keys(this.state.fileStats.agg_potpCorrect.title).length + 
                Object.keys(this.state.fileStats.agg_potpCorrect.summary).length + 
                Object.keys(this.state.fileStats.agg_potpMistakes.title).length + 
                Object.keys(this.state.fileStats.agg_potpMistakes.summary).length + 
                Object.keys(this.state.fileStats.agg_potpMissed.title).length + 
                Object.keys(this.state.fileStats.agg_potpMissed.summary).length > 0
            );
        }
        return 0;
    }

    renderAllLeaderboards(){
        let types = ['mtt','ftd','potp'];
        let renderArr = types.map((type) => {
            if(this.state.newScores[type].length>0)
                return this.renderSingleLeaderboard(type);
            return null;
        })
        return (
            <div>
                {renderArr}
            </div>
        );
    }

    renderSingleLeaderboard(type){
        let table = this.state.newScores[type];
        let title = 'Match the topics';
        if(type == 'ftd')
            title = 'Fill the dates';
        if(type == 'potp')
            title = 'Parts of the picture';
        return (
            <div>
                <h4 style={{textAlign: 'center'}}>{title}</h4>
                <div className="input-userId-getScore-container">
                    <div>
                        <SimpleScoreTable
                            data = {table}
                            />
                    </div>
                    <div>                  
                        <ExcelFile element={
                            <Button 
                                variant="contained"
                                className="downloadButton" 
                                onClick={(e) => {
                                    ReactGA.event({
                                        category: 'Download leaderboard table',
                                        action: 'Download leaderboard table ' + this.props.match.params.gameId + ' ' + type,
                                        label: this.props.match.params.gameId
                                        });
                                }}>
                                    <div>Download</div>
                            </Button>
                        }
                        filename={title + ' Results'}>
                            <ExcelSheet data={table} name="Results">
                                <ExcelColumn label="UserId" value="id"/>
                                <ExcelColumn label="score" value="score"/>
                            </ExcelSheet>
                        </ExcelFile>
                    </div>
                    {type=='mtt'?
                    <div>
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
                        <div>
                                <div>                  
                                    <ExcelFile element={
                                        <Button 
                                            variant="contained"
                                            className="downloadButton" 
                                            onClick={(e) => {
                                                ReactGA.event({
                                                    category: 'Download leaderboard stats',
                                                    action: 'Download leaderboard stats ' + this.props.match.params.gameId +' '+ type,
                                                    label: this.props.match.params.gameId
                                                });
                                            }}>
                                                <div>Download statistics</div>
                                        </Button>
                                    }
                                    filename={title + " Statistics"}>
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
                        </div>
                    </div>
                    :
                    null
                    }
                    {type=='potp'?
                        <div>
                            <div style={{display:'flex', flexWrap:'wrap'}}>
                                {Object.keys(this.state.fileStats.agg_potpMistakes.title).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Mistakes (Name)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMistakes.title)}
                                                        id = {"pie_mtt_aggPotpMistakes_title"}
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
                                {Object.keys(this.state.fileStats.agg_potpMistakes.summary).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Mistakes (Details)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMistakes.summary)}
                                                        id = {"pie_mtt_aggPotpMistakes_summary"}
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
                                {Object.keys(this.state.fileStats.agg_potpCorrect.title).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Correct (Name)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpCorrect.title)}
                                                        id = {"pie_mtt_aggPotpCorrect_title"}
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
                                {Object.keys(this.state.fileStats.agg_potpCorrect.summary).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Correct (Details)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpCorrect.summary)}
                                                        id = {"pie_mtt_aggPotpCorrect_summary"}
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
                                {Object.keys(this.state.fileStats.agg_potpMissed.title).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Missed (Name)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMissed.title)}
                                                        id = {"pie_mtt_aggPotpMissed_title"}
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
                                {Object.keys(this.state.fileStats.agg_potpMissed.summary).length>0?
                                    <Grid md={6} xs={12}>
                                        <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                            <div style={{border:'1px black solid'}}>
                                                <h4 style={{textAlign:'center'}}>Missed (Details)</h4>
                                                <div style={{height:'300px'}}>
                                                    <AmPieChart
                                                        data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMissed.summary)}
                                                        id = {"pie_mtt_aggPotpMissed_summary"}
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
                            <div>
                                <div>                  
                                    <ExcelFile element={
                                        <Button 
                                            variant="contained"
                                            className="downloadButton" 
                                            onClick={(e) => {
                                                ReactGA.event({
                                                    category: 'Download leaderboard stats',
                                                    action: 'Download leaderboard stats ' + this.props.match.params.gameId +' '+ type,
                                                    label: this.props.match.params.gameId
                                                });
                                            }}>
                                                <div>Download statistics</div>
                                        </Button>
                                    }
                                    filename={title + " Statistics"}>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMistakes.title)} name="Mistakes (Name)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Mistakes" value="value"/>
                                        </ExcelSheet>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMistakes.summary)} name="Mistakes (Details)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Mistakes" value="value"/>
                                        </ExcelSheet>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpCorrect.title)} name="Correct (Name)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Count" value="value"/>
                                        </ExcelSheet>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpCorrect.summary)} name="Correct (Details)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Count" value="value"/>
                                        </ExcelSheet>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMissed.title)} name="Missed (Name)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Count" value="value"/>
                                        </ExcelSheet>
                                        <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMissed.summary)} name="Missed (Details)">
                                            <ExcelColumn label="Part" value="key"/>
                                            <ExcelColumn label="Count" value="value"/>
                                        </ExcelSheet>
                                    </ExcelFile>
                                </div>               
                            </div>
                        </div>
                        :
                        null
                    }
                </div>
            </div>
        );
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
                                    onClick={(e) => {
                                        ReactGA.event({
                                            category: 'Download leaderboard table',
                                            action: 'Download leaderboard table ' + this.props.match.params.gameId,
                                            label: this.props.match.params.gameId
                                          });
                                    }}>
                                        <div>Download</div>
                                </Button>
                            }
                            filename="Results">
                                <ExcelSheet data={this.state.fileResults} name="Results">
                                    <ExcelColumn label="UserId" value="id"/>
                                    <ExcelColumn label="Match the topics" value="mtt"/>
                                    <ExcelColumn label="Fill the dates" value="ftd"/>
                                    <ExcelColumn label="Parts of the picture" value="potp"/>
                                </ExcelSheet>
                            </ExcelFile>
                        </div>
                         {this.shouldShowStats('mtt')?         
                            <div>               
                                <h4 style={{textAlign: 'center'}}>Match the topics</h4>
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
                                <div>                  
                                    <ExcelFile element={
                                        <Button 
                                            variant="contained"
                                            className="downloadButton" 
                                            onClick={(e) => {
                                                ReactGA.event({
                                                    category: 'Download leaderboard stats',
                                                    action: 'Download leaderboard stats ' + this.props.match.params.gameId,
                                                    label: this.props.match.params.gameId
                                                });
                                            }}>
                                                <div>Download statistics</div>
                                        </Button>
                                    }
                                    filename="Match the topics Statistics">
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
                            </div>
                            :
                            null
                        }
                        {this.shouldShowStats('potp')?
                            <div>
                                <h4 style={{textAlign: 'center'}}>Parts of the picture</h4>
                                <div style={{display:'flex', flexWrap:'wrap'}}>
                                    {Object.keys(this.state.fileStats.agg_potpMistakes.title).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Mistakes (Name)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMistakes.title)}
                                                            id = {"pie_mtt_aggPotpMistakes_title"}
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
                                    {Object.keys(this.state.fileStats.agg_potpMistakes.summary).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Mistakes (Details)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMistakes.summary)}
                                                            id = {"pie_mtt_aggPotpMistakes_summary"}
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
                                    {Object.keys(this.state.fileStats.agg_potpCorrect.title).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Correct (Name)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpCorrect.title)}
                                                            id = {"pie_mtt_aggPotpCorrect_title"}
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
                                    {Object.keys(this.state.fileStats.agg_potpCorrect.summary).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Correct (Details)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpCorrect.summary)}
                                                            id = {"pie_mtt_aggPotpCorrect_summary"}
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
                                    {Object.keys(this.state.fileStats.agg_potpMissed.title).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Missed (Name)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMissed.title)}
                                                            id = {"pie_mtt_aggPotpMissed_title"}
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
                                    {Object.keys(this.state.fileStats.agg_potpMissed.summary).length>0?
                                        <Grid md={6} xs={12}>
                                            <div style={{paddingRight:'10px', paddingTop:'10px', paddingBottom:'10px'}}>
                                                <div style={{border:'1px black solid'}}>
                                                    <h4 style={{textAlign:'center'}}>Missed (Details)</h4>
                                                    <div style={{height:'300px'}}>
                                                        <AmPieChart
                                                            data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_potpMissed.summary)}
                                                            id = {"pie_mtt_aggPotpMissed_summary"}
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
                                <div>
                                    <ExcelFile element={
                                        <Button 
                                            variant="contained"
                                            className="downloadButton" 
                                            onClick={(e) => {
                                                ReactGA.event({
                                                    category: 'Download leaderboard stats',
                                                    action: 'Download leaderboard stats ' + this.props.match.params.gameId,
                                                    label: this.props.match.params.gameId
                                                });
                                            }}>
                                                <div>Download statistics</div>
                                        </Button>
                                    }
                                    filename="Parts of the picture Statistics">
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMistakes.title)} name="Mistakes (Name)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Mistakes" value="value"/>
                                            </ExcelSheet>
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMistakes.summary)} name="Mistakes (Details)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Mistakes" value="value"/>
                                            </ExcelSheet>
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpCorrect.title)} name="Correct (Name)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Count" value="value"/>
                                            </ExcelSheet>
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpCorrect.summary)} name="Correct (Details)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Count" value="value"/>
                                            </ExcelSheet>
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMissed.title)} name="Missed (Name)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Count" value="value"/>
                                            </ExcelSheet>
                                            <ExcelSheet data={Utils.convertMapToSimpleArrSortAsc(this.state.fileStats.agg_potpMissed.summary)} name="Missed (Details)">
                                                <ExcelColumn label="Part" value="key"/>
                                                <ExcelColumn label="Count" value="value"/>
                                            </ExcelSheet>
                                        </ExcelFile>
                                </div>
                            </div>
                            :
                            null
                        }
                    </div>
                    :
                    null
                }

                {this.state.renderNewScores?
                    <div>
                        {this.renderAllLeaderboards()}
                    </div>
                    :
                    null
                }         
            </div>
        )
    }
}
export default LeaderboardView;