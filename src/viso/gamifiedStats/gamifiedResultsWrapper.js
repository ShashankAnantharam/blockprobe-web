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
import ReactExport from "react-export-excel";
import './gamifiedResults.css';
import AmPieChart from '../charts/amPieChart';
import { Grid } from '@material-ui/core';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class GamifiedResultsWrapper extends React.Component {
    constructor(props) {
      super(props);
      //gameId 

      this.state = {
          userId: '',
          displayedUserId: '',
          file: null,
          fileResults: [],
          fileStats: {
            agg_mttEntityStats: {},
            agg_mttRawStats: {},
            agg_mttCorrectStats: {},
            agg_mttWrongStats: {}
          }
      }

      this.isValidUserId = this.isValidUserId.bind(this);
      this.handleChange = this.handleChange.bind(this);
      this.displayUserScore = this.displayUserScore.bind(this);
      this.getRemainingEdges = this.getRemainingEdges.bind(this);
    }


    isValidUserId(userId){
        if(!isNullOrUndefined(userId) && userId.length>0)
            return true;
        return false;
    }

    getRemainingEdges(remainingEdges, correctEdges){
        for(let key in correctEdges){
            if(key in remainingEdges){
                delete remainingEdges[key];
            }
        }
        return remainingEdges;
    }

    async getData(userId){
        if(isNullOrUndefined(userId))
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
            if(!isNullOrUndefined(userIdData[i]) && userIdData[i].trim().length>0){
                allPromises.push(this.getData(userIdData[i]));
            }
        }
        Promise.all(allPromises).then(results => {  
            //console.log(results);          
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

    handleChangeFile(event){
        let file = event.target.files[0];
        let reader = new FileReader();
        let scope = this;
        reader.onload = function() {
            const dataStr = reader.result;
            const wb = XLSX.read(dataStr, {type:'binary'});
            /* Get first worksheet */
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            /* Convert array of arrays */
            const data = XLSX.utils.sheet_to_csv(ws, {header:1});
            /* Update state */

            let userIdData = [];
            let dataArr = data.split('\n');
            for(let i=0;dataArr && i<dataArr.length; i++){
                let tempArr = dataArr[i].split(',');
                if(tempArr.length > 0 && !isNullOrUndefined(tempArr[0]) &&
                   tempArr[0].trim().length>0)
                {
                    userIdData.push(tempArr[0]);
                }
            }
            scope.getFullTable(userIdData);
          };
        reader.readAsBinaryString(file);

        //Done to remove earlier file and update with new file.
        event.target.value = null;
    }

    handleChange(event, type) {

        var shouldUpdate = false;
        let str = event.target.value;
        if(type=='userId' && Utils.shouldUpdateText(str,['\n','\t'])){
            shouldUpdate = true;
        }

        if(shouldUpdate){
            
            if(type=="userId"){
                let id = event.target.value;
                this.setState({
                    userId: id
                });
            }
        }
      }

    displayUserScore(){
        this.setState({
            displayedUserId: this.state.userId.trim()
        });
    }

    render(){
        return (
            <div>
                 <div className="input-userId-getScore-container">
                     <h3>Input userId</h3>
                    <form>
                    <label>
                        <TextField 
                            type="text"
                            variant="outlined"
                            multiline
                            placeholder = "Enter userId"
                            value={this.state.userId}
                            onChange={(e) => { this.handleChange(e,"userId")}}
                            rowsMax="1"
                            rows="1"
                            style={{
                                background: 'white',
                                marginTop:'6px',
                                marginBottom:'6px',
                                width:'30%'
                                }}/>
                    </label>
                    </form>
                    <div className="viewGameResultsOptionsContainer">
                        {this.isValidUserId(this.state.userId)?                        
                            <Button 
                                variant="contained"
                                className="displayUserGameScoreButton" 
                                style={{marginTop:'1em'}}
                                onClick={(e) => this.displayUserScore("creator",true)}>
                                    <div>Confirm</div>
                            </Button>
                            :
                            null
                        }
                    </div>
                 </div>

                {!isNullOrUndefined(this.props.match.params.gameId) && this.isValidUserId(this.state.displayedUserId)? 
                    <GamifiedResultsComponent
                        gameId = {this.props.match.params.gameId}
                        userId = {this.state.displayedUserId}
                        />
                    :
                    null
                }      

                <div className="input-userId-getScore-container">
                     <h3 style={{marginBottom: '10px'}}>Upload excel file</h3>
                     <h5 style={{marginTop: '0px'}}>User id must be the first column</h5>
                    <form>
                    <label>
                        <Input 
                            type="file"
                            variant="outlined"
                            value={this.state.file}
                            onChange={(e) => { this.handleChangeFile(e) }}
                            rows="1"
                            style={{
                                background: 'white',
                                marginTop:'6px',
                                marginBottom:'6px',
                                width:'30%'
                                }}/>
                    </label>
                    </form>                    
                 </div>    
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
                                    <div style={{padding:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Mistakes (topic-wise)</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttEntityStats)}
                                                    id = {"pie_mtt_aggEntityStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
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
                                    <div style={{padding:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Mistakes (connections)</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttRawStats)}
                                                    id = {"pie_mtt_aggRawStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
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
                                    <div style={{padding:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Correct connections</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttCorrectStats)}
                                                    id = {"pie_mtt_aggCorrectMttStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
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
                                    <div style={{padding:'10px'}}>
                                        <div style={{border:'1px black solid'}}>
                                            <h4 style={{textAlign:'center'}}>Missed connections</h4>
                                            <div style={{height:'300px'}}>
                                                <AmPieChart
                                                    data={Utils.convertMapToSimpleArr(this.state.fileStats.agg_mttWrongStats)}
                                                    id = {"pie_mtt_aggWrongMttStats"}
                                                    category = {"key"}
                                                    value = {"value"}  
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Grid>  
                                :
                                null
                            }
                        </div>
                    </div>
                    :
                    null
                 }                       
            </div>
        )
    }
}
export default GamifiedResultsWrapper;