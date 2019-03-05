import React, { Component } from 'react';
import './TimelineComponent.css';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

class TimelineComponent extends React.Component {

    constructor(props){
      super(props);        
    }

    BlockEntity(entity){
      return(
      <span className="timeline-block-entity">
          {entity.title}
      </span>
      );  
     }
   
     
     renderTimeline(timelineBlock){
         /*
         Create render template for the entities
         */
        var renderBlockEntities = '';
        if(timelineBlock.entities!=null && timelineBlock.entities.length>0){            
             renderBlockEntities = timelineBlock.entities.map((blockEntity) => 
                this.BlockEntity(blockEntity)
            );            
        }        

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