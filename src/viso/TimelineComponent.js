import React, { Component } from 'react';
import './TimelineComponent.css';
import { VerticalTimeline, VerticalTimelineElement }  from 'react-vertical-timeline-component';
import Img from 'react-image';
import ReactGA from 'react-ga';
import  * as  Utils from '../common/utilSvc';
import 'react-vertical-timeline-component/style.min.css';
import { isNullOrUndefined } from 'util';

class TimelineComponent extends React.Component {

    constructor(props){
      super(props);
      
      this.selectTimelineBlock = this.selectTimelineBlock.bind(this);
      this.removeHashedIndex = this.removeHashedIndex.bind(this);
      ReactGA.initialize('UA-143383035-1');  
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

     selectTimelineBlock(block){
        //console.log(block);

        ReactGA.event({
            category: 'select_timeline_block',
            action: 'Select ' + JSON.stringify(block),
            label: JSON.stringify(block)
          });
          
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
       const blockDateTime = Utils.getDateTimeString(timelineBlock);
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
       <div onClick={() => { this.selectTimelineBlock(timelineBlock)}} className="timeline-block-container">
            
            {this.removeHashedIndex(timelineBlock.title).length > 0? 
                        <h4 className="vertical-timeline-element-title timeline-block-title timeline-block-text">{this.removeHashedIndex(timelineBlock.title)}</h4>
                        :
                        null
            }
            <p className="timeline-block-text">
                {timelineBlock.summary}
            </p>
            
            {renderBlockEvidences.length !== ''?
                        <div>
                            {renderBlockEvidences}
                        </div>
                        :
                        null}        

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