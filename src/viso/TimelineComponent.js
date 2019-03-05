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

       //TODO add function here to get DateTime
       const blockDateTime = "2019";
       var backgroundColor = 'rgb(33, 150, 243)';
   
       if(index%3==1)
       {
            backgroundColor = 'rgb(243, 33, 150)';
       }
       else if(index%3==2)
       {
            backgroundColor = 'rgb(243, 33, 25)';
       }

       return (
         <VerticalTimelineElement
         className="vertical-timeline-element--work"
         date={blockDateTime}
         iconStyle={{ background: backgroundColor, color: '#fff' }}
       >
        <h3 className="vertical-timeline-element-title">{timelineBlock.title}</h3>
        <div>
            {renderBlockEntities}
        </div>
        <p>
            {timelineBlock.summary}
        </p>
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