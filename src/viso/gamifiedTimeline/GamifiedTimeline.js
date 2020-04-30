import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import GridListTileBar from '@material-ui/core/GridListTileBar';
import * as Utils from '../../common/utilSvc';
import Card from '@material-ui/core/Card';
import './GamifiedTimeline.css';
import Paper from '@material-ui/core/Paper';
import { isNullOrUndefined } from 'util';
import { time } from '@amcharts/amcharts4/core';

class GamifiedTimelineComponent extends React.Component {

    constructor(props){
      super(props);

      this.state = {
      }
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

    render(){
        let times = this.seperateTimeline(this.props.timeline);
        let timeDisplay = times.map((time, index) => (this.singleTimelineCard(time,index)));

        return (
            <div>
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