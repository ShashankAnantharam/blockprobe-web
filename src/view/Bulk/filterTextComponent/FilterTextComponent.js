import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import Textarea from 'react-textarea-autosize';
import * as firebase from 'firebase';
import * as Utils  from '../../../common/utilSvc';
import  "./FilterTextComponent.css";
import { isNullOrUndefined } from 'util';

class FilterTextComponent extends React.Component {

    constructor(props){
        super(props);
        //addText, text

        this.state={
            delimiters: '()',
            loadingText: false
        }

       this.handleChange = this.handleChange.bind(this);
       this.filterText = this.filterText.bind(this);
       this.isValidDelimter = this.isValidDelimter.bind(this);
    }

    handleChange(event, type){
        var shouldUpdate = true;
      
        shouldUpdate =Utils.isValidDelimiter(event.target.value)
        if(shouldUpdate){
            let delimiters = this.state.delimiters;
            if(type=="delimiters"){
                    delimiters = event.target.value;                    
                    this.setState({delimiters: delimiters});
                }
            }  
    }

    filterText(){
        let text  = this.props.text;
        let delimiters = this.state.delimiters;
        text = Utils.filterTextBasedOnDelimter(text, delimiters[0], delimiters[1], true);
        this.props.addText(text);
    }

    isValidDelimter(){
        let delimiters = this.state.delimiters;
        if(isNullOrUndefined(delimiters))
            return false;
        
        if(delimiters.length < 2)
            return false;

        return true;
    }

    render(){
        return (
            <div className="filterTextComponent">
                <div>
                    <p>Delimiter</p>
                    <form>
                            <label>
                            <Textarea 
                                type="text"
                                value={this.state.delimiters}
                                onChange={(e) => { this.handleChange(e,"delimiters")}}
                                maxRows="1"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'darkgrey',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    width:'80px'
                                    }}/>                            
                            </label>
                    </form>

                    {this.isValidDelimter()?
                        <button
                            className="filterTextDelimiterButton"
                            onClick={this.filterText}>
                                <div>Filter</div>
                        </button>
                        :
                        false
                    }
                     
                </div>
            </div>
        );
    }
}
export default FilterTextComponent;