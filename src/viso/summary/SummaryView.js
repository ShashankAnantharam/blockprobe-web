import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
          summBlockIdx: 0,
          isContentActive: true
      }
      this.getTitle = this.getTitle.bind(this);
      this.getSummary = this.getSummary.bind(this);
    }

    componentDidMount() {
        this.timeout = setInterval(() => {
          let currentIdx = this.state.summBlockIdx;
          let currArrSize = Math.max(1,this.state.summBlocks.length);
          this.setState({isContentActive: false});
          const scope = this;
          this.timeout = setTimeout(function() {
            console.log("Here");
            scope.setState({ 
              summBlockIdx: (currentIdx + 1)%(currArrSize),
              isContentActive: true
            });

          },500);
                
        }, 11000);
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

    handleClick(){
      
    }

    

    render(){

        return (
          
            <div className="summaryView-container Ripple-parent">
            <ReactCSSTransitionGroup transitionName="summaryContent"
              transitionAppear={true}
              transitionAppearTimeout={500}
              transitionEnter={true}
              transitionEnterTimeout={500}
              transitionLeave={true}
              transitionLeaveTimeout={500}
              >
              {this.state.isContentActive?
                       <div>
                              <div className='summaryView-title'>{this.getTitle()}</div>
                              <p className='summaryView-desc'>{this.getSummary()}</p>
                       </div>
                              :
                              null              
              }
            </ReactCSSTransitionGroup>
            </div>
        );
    }
}
export default SummaryViewComponent;