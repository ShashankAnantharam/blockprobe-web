import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import * as Utils from '../../common/utilSvc';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import Typography from '@material-ui/core/Typography';
import './GamifiedTimeline.css';
import Paper from '@material-ui/core/Paper';
import { isNullOrUndefined } from 'util';
import { time } from '@amcharts/amcharts4/core';

class GamifiedTimelineComponent extends React.Component {

    constructor(props){
      super(props);
      //timeline  should always  be there

      this.state = {
        currentTimelineIndex: 0
      }

      if(props.timeline){
          this.state.currentTimelineIndex = Math.floor(Math.random()*(props.timeline.length-1));
      }

      this.incrementTimelineIndex = this.incrementTimelineIndex.bind(this);
      this.clickChevron = this.clickChevron.bind(this);
      this.removeHashedIndex = this.removeHashedIndex.bind(this);
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

    singleTimelineCard(time, index){
        return (
                <Paper className="singleTimeOption">
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
            this.setState({
                currentTimelineIndex: index
            });
        }
    }

    componentWillReceiveProps(newProps){
        if(this.props.timeline != newProps.timeline){
            let index = Math.floor(Math.random()*(newProps.timeline.length-1));
            this.setState({
                currentTimelineIndex: index
            });
        }
    }

    render(){
        let times = this.seperateTimeline(this.props.timeline);
        let timeDisplay = times.map((time, index) => (this.singleTimelineCard(time,index)));

        return (
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
        )
    }
}
export default GamifiedTimelineComponent;