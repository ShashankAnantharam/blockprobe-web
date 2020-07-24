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

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class LeaderboardView extends React.Component {
    constructor(props) {
      super(props);
      //gameId 

      this.state = {          
          playerIds: [],
          fileResults: []
      }

      this.getPlayers = this.getPlayers.bind(this);
      this.getFullTable = this.getFullTable.bind(this);
      this.getData = this.getData.bind(this);
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

            let mtt = 0, ftd = 0;
            if(timelineTopScores && timelineTopScores.length > 0 && 
                !isNullOrUndefined(timelineTopScores[0].score)){
                ftd = timelineTopScores[0].score;                
            }
            if(topScores && topScores.length > 0 && 
                !isNullOrUndefined(topScores[0].score)){
                mtt = topScores[0].score;                
            }
            return {id: userId, mtt: mtt, ftd: ftd};
        },
        error => {
            return {id: userId, mtt: 0, ftd: 0};
        });
    }

    async getFullTable(userIdData){
        let allPromises = [], scope=this;
        for(let i=0; i<userIdData.length; i++){
            if(!isNullOrUndefined(userIdData[i]) && userIdData[i].id.trim().length>0){
                allPromises.push(this.getData(userIdData[i].id));
            }
        }
        Promise.all(allPromises).then(results => {
            scope.setState({
                fileResults: results
            });
        });
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
                    </div>
                    :
                    null
                }         
            </div>
        )
    }
}
export default LeaderboardView;