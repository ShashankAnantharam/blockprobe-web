import React, { Component } from 'react';
import Textarea from 'react-textarea-autosize';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import  * as Utils from '../../../common/utilSvc';
import './AddEdgeView.css';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { isNull, isNullOrUndefined } from 'util';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

class AddEdgeView extends React.Component {

    constructor(props){
        super(props);

        this.state ={
            summary: '',
            entityA: '',
            entityB: ''
        }
    }

    handleChange(event, type) {
        let str = event.target.value;
        var shouldUpdate = true;
        shouldUpdate = Utils.shouldUpdateText(str, ['\n','\t']);
        if(shouldUpdate){
            if(type=="connection-description"){
                this.setState({summary: event.target.value});
            }
        }
      }

    render(){
        return (
            <div>
                <h4 className="addEdgeTitle"> Add connection</h4>
                <div className="addEdgeBlockTextContainer">
                    <TextField 
                                type="text"
                                variant="outlined"
                                value={this.state.summary}
                                onChange={(e) => { this.handleChange(e,"connection-description")}}
                                placeholder = "Add connection description"
                                multiline
                                rowsMax="3"
                                rows="2"
                                style={{
                                    background: 'white',
                                    marginTop:'6px',
                                    marginBottom:'6px',
                                    minWidth:'70%',
                                    maxWidth: '80%',
                                    color: 'darkBlue',
                                    fontWeight:'600'
                                    }}/>
                </div>
            </div>
        )
    }
}
export default AddEdgeView;
