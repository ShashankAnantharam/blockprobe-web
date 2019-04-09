import React, { Component } from 'react';
import * as firebase from 'firebase';
import './DraftBlock.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Textarea from 'react-textarea-autosize';

class DraftBlockComponent extends React.Component {

    constructor(props){
        super(props);
        //props:draftBlock, bpId, uId 
        this.state={
            newBlock: this.props.draftBlock
        }

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event, isTitle, isSummary) {
        var shouldUpdate = true;
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t'){
            shouldUpdate=false;
        }

        if(shouldUpdate){
            var block = this.state.newBlock;
            if(isTitle){
                block.title = event.target.value;
            }
            else if(isSummary){
                block.summary = event.target.value;
            }
            this.setState({newBlock: block});
        }
      }

    EditSingleBlock(listItem, index){
        return(

            <div className="draft-block-container">
                <form>
                <label>
                    <Textarea 
                        type="text"
                        value={this.state.newBlock.title}
                        onChange={(e) => { this.handleChange(e,true,false)}}
                        maxRows="2"
                        minRows="1"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'lightgrey',
                            borderBottomWidth:'0px',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'95%'
                            }}/>
                    <Textarea 
                    type="text"
                    value={this.state.newBlock.summary}
                    onChange={(e) => { this.handleChange(e,false,true)}}
                    maxRows="13"
                    minRows="3"
                    style={{
                        background: 'white',
                        borderWidth:'2px', 
                        borderStyle:'solid', 
                        borderColor:'lightgrey',
                        borderTopWidth:'0px',
                        paddingTop:'6px',
                        paddingBottom:'6px',
                        width:'95%'
                        }}/>
                </label>
                </form>
            </div>

        );
    }

    render(){
        return(
            <div>
                {this.EditSingleBlock()}
            </div>
        );
    }

}
export default DraftBlockComponent;