import React, { Component } from 'react';
import './TimelineComponent.css';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import Img from 'react-image';
import 'react-vertical-timeline-component/style.min.css';

class TimelineComponent extends React.Component {

    constructor(props){
      super(props);
      
      this.selectTimelineBlock = this.selectTimelineBlock.bind(this);
      this.removeHashedIndex = this.removeHashedIndex.bind(this);
    }

    BlockEvidence(evidence, index){
        const WebView = require('react-electron-web-view');
        var evidenceList = [evidence.evidenceLink];
        return(
            <div >
                <Img src={evidenceList}
                style={{width:'80%',marginLeft: '10%', marginRight: '10%'}}></Img>
            </div>
        );
    } 

    BlockEntity(entity){
      return(
      <span className="timeline-block-entity">
          {entity.title}
      </span>
      );  
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

     selectTimelineBlock(block){
        //console.log(block);
        this.props.selectBlock(block);

     }
     
     renderTimeline(timelineBlock, index){
         /*
         Create render template for the entities
         */
        var renderBlockEntities = '';
        if(timelineBlock.entities!=null && timelineBlock.entities.length>0){            
             renderBlockEntities = timelineBlock.entities.map((blockEntity) => 
                this.BlockEntity(blockEntity)
            );            
        } 
        
        var renderBlockEvidences="";
        if(timelineBlock.evidences && timelineBlock.evidences.length>0){            
            renderBlockEvidences = timelineBlock.evidences.map((blockEvidence, index) => 
            this.BlockEvidence(blockEvidence, index)
        );            
        }

       //TODO add function here to get DateTime
       const blockDateTime = this.getDateTimeString(timelineBlock);
       var backgroundColor = 'rgb(33, 150, 243)';
   
       if(index%3===1)
       {
            backgroundColor = 'rgb(243, 33, 150)';
       }
       else if(index%3===2)
       {
            backgroundColor = 'rgb(243, 33, 25)';
       }

       return (
         <VerticalTimelineElement
         className="vertical-timeline-element--work"
         date={blockDateTime}
         iconStyle={{ background: backgroundColor, color: '#fff' }}
       >
        <h4 className="vertical-timeline-element-title timeline-block-title timeline-block-text">{this.removeHashedIndex(timelineBlock.title)}</h4>
        <p className="timeline-block-text">
            {timelineBlock.summary}
        </p>
        
        <div>
            {renderBlockEvidences}
        </div>
        <div>
        <button onClick={() => { this.selectTimelineBlock(timelineBlock)}}>
            View Block
        </button>    

        </div>
          
       </VerticalTimelineElement>
       );
     }

    render() {

      const timelineView = this.props.timeline.map((timelineBlock, index) => 
      this.renderTimeline(timelineBlock, index)
    );
      return (
        <div style={{background:'lightblue'}}>
            <VerticalTimeline> 
                {timelineView}
                <VerticalTimelineElement
                    iconStyle={{ background: 'rgb(16, 204, 82)', color: '#fff' }}
                />
            </VerticalTimeline>
       </div>
      );
    }
  }
  export default TimelineComponent;