import React, { Component } from 'react';


class ViewBlockComponent extends React.Component {

    constructor(props){
        super(props);
    }


    render(){
        return (
            <div style={{
                maxHeight:'100%',
                overflow:'auto',
                textAlign:'center',
                padding:'5px',
                background: 'lightgreen'            
                }}>
            <h2>{this.props.selectedBlock.title}</h2>
            <h5>{this.props.selectedBlock.summary}</h5>


            
            </div>
        );
    }
}
export default ViewBlockComponent;