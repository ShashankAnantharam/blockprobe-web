import React, { Component } from 'react';
import './ViewBlock.css';

class ViewBlockComponent extends React.Component {

    constructor(props){
        super(props);
    }

    getDateTimeString(timelineBlock){
        var ans = "";
        if(timelineBlock.blockDate!=null){
            ans = ans + timelineBlock.blockDate.date + "-";
            ans = ans + (timelineBlock.blockDate.month+1) + "-";
            ans = ans + timelineBlock.blockDate.year + "  ";


            // console.log(timelineBlock.blockDate);
            // console.log(ans);

            if(timelineBlock.blockTime!=null){
                var temp = "";
                if(timelineBlock.blockTime.hours < 10){
                    temp = "0"; 
                }
                temp = temp + timelineBlock.blockTime.hours;
                ans = ans + temp + ":";

                temp = "";
                if(timelineBlock.blockTime.minutes < 10){
                    temp = "0"; 
                }
                temp = temp + timelineBlock.blockTime.minutes;
                ans = ans + temp;


            }
        }
        return ans;
    }

    BlockEntity(entity){
        return(
        <span className="block-entity">
            {entity.title}
        </span>
        );  
       }

    render(){

        var renderBlockEntities="";
        var dateTimeString = "";

        if(this.props.selectedBlock.entities!=null && 
            this.props.selectedBlock.entities.length>0){            
            renderBlockEntities = this.props.selectedBlock.entities.map((blockEntity) => 
               this.BlockEntity(blockEntity)
           );            
       }
       
       if(this.props.selectedBlock.blockDate!=null){
           dateTimeString = this.getDateTimeString(this.props.selectedBlock);
       }

        return (
            <div class="block-div">
            <div class="block-text">
                <h2 class="block-title">{this.props.selectedBlock.title}</h2>
                <p class="block-summary">{this.props.selectedBlock.summary}</p>
            </div>
            
            <div class="block-datetime">{dateTimeString}</div>
            <div>{renderBlockEntities}</div>

            
            </div>
        );
    }
}
export default ViewBlockComponent;