import React, { Component } from 'react';
import './SummaryView.css';

class SummaryViewComponent extends React.Component {

    constructor(props){
      super(props);
      this.state = {
          summBlocks :[
              {
                  title:"test 1",
                  summary:"This is the test1 stuff."
              },
              {
                title:"test 2",
                summary:"This is the test2 stuff."
            }
          ],
          summBlockIdx: 0
      }
      this.getTitle = this.getTitle.bind(this);
      this.getSummary = this.getSummary.bind(this);
    }

    componentDidMount() {
        this.timeout = setInterval(() => {
          let currentIdx = this.state.summBlockIdx;
          let currArrSize = Math.max(1,this.state.summBlocks.length);
          this.setState({ 
                  summBlockIdx: (currentIdx + 1)%(currArrSize) 
                });
        }, 1500);
      }

      getTitle(){
          if(this.state.summBlocks.length==0)
            return '';
          return this.state.summBlocks[this.state.summBlockIdx].title;
      }

      getSummary(){
        if(this.state.summBlocks.length==0)
          return '';
        return this.state.summBlocks[this.state.summBlockIdx].summary;
    }

    render(){

        return (
            <div className="summaryView-container">
                <div className='summaryView-title'>{this.getTitle()}</div>
                <p style={{color:'white', textAligh: 'center',
              margin:'10px', fontSize:'1em'}}>{this.getSummary()}</p>    
            </div>
        );
    }
}
export default SummaryViewComponent;