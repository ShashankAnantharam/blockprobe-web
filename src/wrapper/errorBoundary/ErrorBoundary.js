import React, { Component } from 'react';
import ReactGA from 'react-ga';

class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);

      ReactGA.initialize('UA-143383035-1');  
    }
  
    componentDidCatch(error, info) {
      ReactGA.exception({
        description: error.toString(),
        fatal: true
      });

      ReactGA.event({
        category: 'error',
        action: error.toString(),
        label: error.toString()
      });
    }
  
    render() {
      return this.props.children;
    }
  }
  export default ErrorBoundary;