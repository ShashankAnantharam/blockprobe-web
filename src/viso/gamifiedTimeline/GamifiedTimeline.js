import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import * as Utils from '../../common/utilSvc';
import Alert from '@material-ui/lab/Alert';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import Speedometer from '../speedoMeter/Speedometer';
import Typography from '@material-ui/core/Typography';
import UIfx from 'uifx';
import WellDoneMp3 from  '../../media/well_done.mp3';
import TryAgainMp3 from '../../media/try_again.mp3';
import './GamifiedTimeline.css';
import Paper from '@material-ui/core/Paper';
import { isNullOrUndefined } from 'util';
import { time } from '@amcharts/amcharts4/core';

const wellDone = new UIfx(
    WellDoneMp3,
    {
      volume: 0.65, // number between 0.0 ~ 1.0
      throttleMs: 100
    }
);
const tryAgain = new UIfx(
    TryAgainMp3,
    {
      volume: 0.65, // number between 0.0 ~ 1.0
      throttleMs: 100
    }
);

class GamifiedTimelineComponent extends React.Component {

    constructor(props){
      super(props);
      //timeline  should always  be there

      this.state = {
        currentTimelineIndex: 0,
        message: null,
        gameMessageFinished: 'Congratulations! You did it!',
        score: 0,
        totalScore: 0,
        finishedBlocks: {},
        stopGame: false
      }

      if(props.timeline){
          this.state.currentTimelineIndex = Math.floor(Math.random()*(props.timeline.length-1));
          this.state.totalScore = this.props.timeline.length;
      }

      this.incrementTimelineIndex = this.incrementTimelineIndex.bind(this);
      this.clickChevron = this.clickChevron.bind(this);
      this.removeHashedIndex = this.removeHashedIndex.bind(this);
      this.selectTime = this.selectTime.bind(this);
      this.incrementScore = this.incrementScore.bind(this);
    }

    clickChevron(increment){
        this.incrementTimelineIndex();
    }

    seperateTimeline(timeline){
        let times = [];
        for(let i=0; i<timeline.length; i++){
            times.push({
                date: timeline[i].blockDate,
                time: timeline[i].blockTime,
                timeStr: Utils.getDateTimeString(timeline[i])
            });
        }
        return times;
    }

    incrementScore(timelineBlockIndex){
        let finishedBlocks = this.state.finishedBlocks;
        finishedBlocks[timelineBlockIndex] = '';
        let stopGame = this.state.stopGame;
        if(this.state.score + 1 >= this.state.totalScore)
            stopGame = true;
        this.setState({
            score: this.state.score + 1,
            finishedBlocks: finishedBlocks        
        });
        if(!stopGame)
            this.incrementTimelineIndex();
    }

    selectTime(time, index){
        let currBlock = this.props.timeline[this.state.currentTimelineIndex];
        if((JSON.stringify(currBlock.blockDate) != JSON.stringify(time.date)) || 
        (JSON.stringify(currBlock.blockTime) != JSON.stringify(time.time))){
            // Is false
            this.setState({
                message: 'Please try again!'
            });
            if(this.props.playSound)
                tryAgain.play();
        }
        else{
            this.setState({
                message: 'Well done'
            });
            this.incrementScore(index);
            if(this.props.playSound)
                wellDone.play();
        }
    }

    singleTimelineCard(time, index){
        return (
                <Paper className="singleTimeOption" onClick={() => this.selectTime(time,index)}>
                    <div style={{margin: 'auto', width:'50%'}}>
                        {time.timeStr}
                    </div>                    
                </Paper>
        )
    }

    removeHashedIndex(a){
        if(a){        
            a = a.trim();
            var startI = 0;
            if(a.length>0 && a[0]=='#'){
                for(var i=1; i<a.length; i++){
                    startI = i;
                    if(a.charAt(i)==' '){
                        return a.substring(startI).trim();
                    }
                } 
                return '';   
            }
            return a;
        }
        return '';
    }

    singleBlockCard(timelineBlock){
        return (
                <div className="gamifiedTimelineBlockContainer">
                    
                    <div className="gamifiedTimelineBlock horizontallyCentered">
                        <div className="horizontallyCentered width-40">
                            <KeyboardArrowUp className='gamifiedTimelineBlockNav' 
                            onClick={() => { this.clickChevron(true)}}/>
                        </div>
                        <Card>
                            <CardContent>
                                {!isNullOrUndefined(timelineBlock.title)?
                                    <Typography variant="h5" component="h2">{this.removeHashedIndex(timelineBlock.title)}</Typography>
                                    :
                                    null
                                }                                        
                                <Typography variant="body2" component="p">
                                    {timelineBlock.summary}
                                </Typography>
                            </CardContent>
                        </Card>
                    </div>
                </div>
        );
    }

    incrementTimelineIndex(){
        if(!isNullOrUndefined(this.props.timeline)){
            let increment= Math.floor(Math.random()*(this.props.timeline.length-1));
            let index = this.state.currentTimelineIndex;
            index = (index + increment)%(this.props.timeline.length);

            let finishedBlocks = this.state.finishedBlocks;
            while(index in finishedBlocks){
                index = (index + 1)%(this.props.timeline.length);
            }
            this.setState({
                currentTimelineIndex: index
            });
        }
    }

    componentWillReceiveProps(newProps){
        if(this.props.timeline != newProps.timeline){
            let index = Math.floor(Math.random()*(newProps.timeline.length-1));
            this.setState({
                currentTimelineIndex: index,
                totalScore: this.props.timeline.length
            });
        }
    }

    render(){
        let times = this.seperateTimeline(this.props.timeline);
        let timeDisplay = times.map((time, index) => (this.singleTimelineCard(time,index)));

        return (
            <div>
                {!this.state.stopGame?
                            <div className="specialViewMargin">                            
                                <div className="scoreAmchartContainer">
                                    <Speedometer 
                                        id="speedometer_timeline_ingame"
                                        val={this.state.score}
                                        min={0}
                                        max={this.state.totalScore}/>
                                </div>

                                <div className="scoreText">Score: <span className="scoreVal">{this.state.score}</span>
                                <span className="totalScoreVal">/{this.state.totalScore}</span></div>
                                {this.state.score == this.state.totalScore?
                                    <Alert severity="success" className="gameTimelineMessage">{this.state.gameMessageFinished}</Alert>
                                    :
                                    <div>
                                        {this.state.message == "Well done"?
                                            <Alert severity="success" className="gameTimelineMessage">{this.state.message}</Alert>
                                            :
                                            null 
                                        }
                                        {this.state.message == "Please try again!"?
                                            <Alert severity="error" className="gameTimelineMessage">{this.state.message}</Alert>
                                            :
                                            null
                                        }
                                    </div>
                                }
                                
                            </div>
                            :
                            null
                        }
                 {(this.props.timeline.length > this.state.score)?
                    <div>
                        <div className="specialViewMargin">
                            {this.singleBlockCard(this.props.timeline[this.state.currentTimelineIndex])}
                        </div>
                        <div className="specialViewMargin timelineTimesContainer">
                            <Grid xs={24} className="timesViewGrid" id="gamifiedTimesViewGrid">
                                {timeDisplay}
                            </Grid>
                        </div>
                    </div>
                    :
                    null
                 }                       
            </div>
        )
    }
}
export default GamifiedTimelineComponent;