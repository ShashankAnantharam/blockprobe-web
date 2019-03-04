import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import * as firebase from 'firebase';
import 'firebase/firestore';
import {ArrayObj} from './arrayObj';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

class TimelineComponent extends React.Component {

    constructor(props){
      super(props);        
    }

    BlockEntity(entity){
      return(
      <span 
            style={{
               borderRadius: '20px', 
               padding: '10px',
               backgroundColor: 'rgb(140, 180, 250)',
               marginLeft: '10px',
               marginTop: '10px',
               display:'inline-block',
               color:'white'}}>
            {entity.title}
      </span>
      );  
     }
   
     
     renderTimeline(timelineBlock){
         /*
         Create render template for the entities
         */
        var blockEntitiesList = [...timelineBlock.entities];       
        const renderBlockEntities = blockEntitiesList.map((blockEntity) => 
         this.BlockEntity(blockEntity)
       );

       //TODO add function here to get DateTime
       const blockDateTime = "2019";
   
       return (
         <VerticalTimelineElement
         className="vertical-timeline-element--work"
         date={blockDateTime}
         iconStyle={{ background: 'rgb(33, 150, 243)', color: '#fff' }}
       >
        <div     
                style={{ 
                 borderTopWidth:'6px', 
                 borderTopColor:'red'}}
        >
            <h3 className="vertical-timeline-element-title">{timelineBlock.title}</h3>
            <div>
            {renderBlockEntities}
            </div>
            <p>
            {timelineBlock.summary}
            </p>
         </div>
       </VerticalTimelineElement>
       );
     }

    render() {

      const timelineView = this.props.timeline.map((timelineBlock) => 
      this.renderTimeline(timelineBlock)
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