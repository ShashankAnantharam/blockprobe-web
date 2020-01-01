import React, { Component } from 'react';
import { isNullOrUndefined } from 'util';
import Textarea from 'react-textarea-autosize';
import * as firebase from 'firebase';
import { stringify } from '@amcharts/amcharts4/.internal/core/utils/Utils';
import './BpDetails.css';

class BpDetail extends React.Component {

    constructor(props){
        super(props);
        //type, value, addBlockToBlockprobe, blockprobePermit, lastTs

        this.state={
            newValue: '',
            prevPropsValue: null,
            clickedOnEdit: false,
            limits: {
                title: {
                    char: 160
                }
            }
        }

        if(!isNullOrUndefined(props.value)){
            let val = JSON.parse(JSON.stringify(props.value));
            this.setState({
                newValue: val,
                prevPropsValue: val
            });
        }
        this.isValid = this.isValid.bind(this);
        this.clickOnButton = this.clickOnButton.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    clickOnButton(type){
        if(type == 'edit'){
            this.setState({
                clickedOnEdit: true
            });
        }
        else if(type == 'close'){
            this.setState({
                newValue: JSON.parse(JSON.stringify(this.state.prevPropsValue)),
                clickedOnEdit: false
            });
        }
        else if(type=='save'){
            this.setState({
                clickedOnEdit: false
            });
        }
    }

    handleChange(event, type) {

        var shouldUpdate = true;
      
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t')
            shouldUpdate=false;

        if(shouldUpdate){
            let value = this.state.newValue;
            if(type=="title"){
                    value = event.target.value;
                    value = value.substring(0, this.state.limits.title.char - 1);
                    this.setState({newValue: value});
                }
            else if(type=="summary"){
                    value = event.target.value;
                    this.setState({newValue: value});
                }
            }        
    }

    isValid(){
        if(this.state.newValue.trim() == '')
            return false;
        return true;
    }

    componentDidUpdate(){
        if(!this.state.clickedOnEdit && this.state.prevPropsValue!=this.props.value){
            if(!isNullOrUndefined(this.props.value)){
                let val = JSON.parse(JSON.stringify(this.props.value));
                this.setState({
                    newValue: val,
                    prevPropsValue: val
                });
            }
        }
    }

    render(){
        return (
            <div>                
                    {!this.state.clickedOnEdit?
                        <div>
                            {this.props.type == 'title'?
                                <h2>
                                    {this.props.value}
                                    {!isNullOrUndefined(this.props.value)
                                        && this.props.permit == "CREATOR"?
                                        <button 
                                            className="edit-bpDetail-button"
                                            onClick={() => { this.clickOnButton('edit')}}>
                                            Edit {this.props.type}
                                        </button>
                                            :
                                        null
                                    }                     
                                </h2>
                                :
                                null
                            }
                        </div>
                        
                        :
                        <div>
                            <form className="newBlockprobeForm">
                                <label>
                                    <Textarea 
                                        type="text"
                                        placeholder = {"Enter " + this.props.type}
                                        value={this.state.newValue}
                                        onChange={(e) => { this.handleChange(e,"title")}}
                                        maxRows="2"
                                        minRows="1"
                                        style={{
                                            background: 'white',
                                            borderWidth:'2px', 
                                            borderStyle:'solid', 
                                            borderColor:'black',
                                            paddingTop:'6px',
                                            paddingBottom:'6px',
                                            textColor: 'black',
                                            fontWeight: '600',
                                            marginLeft: '1em',
                                            width:'95%'
                                            }}/>                            
                                </label>
                            </form>
                            {this.isValid()?
                                <button
                                className="submit-bpDetail-button"
                                onClick={() => { this.clickOnButton('save')}}>
                                    <div>Confirm</div>
                                </button>                    
                            :
                                null
                            }
                            <button
                                className="close-bpDetail-button"
                                onClick={() => { this.clickOnButton('close')}}>
                                    <div>Close</div>
                                </button>              
                        </div>
                    }                 
            </div>
        );
    }
}
export default BpDetail;