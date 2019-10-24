import React, { Component } from 'react';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';
import ViewBlockprobePublicComponent from '../../view/ViewBlockprobePublic';

class ViewBlockprobePublicWrapper extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        selectedVisualisation: 'dashboard'
      }

      if(props.match.params.viewType && 
        props.match.params.viewType == 'graph'){
            this.state.selectedVisualisation = 'graph';
      }   
    }
     
    render() {
      return (
        <ErrorBoundary>
          <ViewBlockprobePublicComponent 
          visulationType = {this.state.selectedVisualisation}
          bId = {this.props.match.params.bId}/>
        </ErrorBoundary>
      );
    }
  }
  export default ViewBlockprobePublicWrapper;