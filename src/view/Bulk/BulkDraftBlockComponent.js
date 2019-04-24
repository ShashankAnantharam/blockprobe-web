import React, { Component } from 'react';
import * as firebase from 'firebase';
import './BulkDraftBlock.css';
import '../DraftBlock.css';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Textarea from 'react-textarea-autosize';
import  MultiSelectReact  from 'multi-select-react';
import AddIcon from '@material-ui/icons/Add';
import SaveIcon from '@material-ui/icons/Save';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteIcon from '@material-ui/icons/Delete';
import { isNullOrUndefined } from 'util';


class BulkDraftBlockComponent extends React.Component {


    constructor(props){
        super(props);
        //cancelBulkDraftBlock, addDraftBlock,investigationGraph

        this.state ={
            display:'',
            value:''
        }

        //this.EditSingleBlock = this.EditSingleBlock.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getParas = this.getParas.bind(this);
        this.formatParas = this.formatParas.bind(this);
        this.saveDraftInBulk = this.saveDraftInBulk.bind(this);

    }

    formatParas(currentPara, allParas){
        var newPara={};
 
        if(currentPara.length==1){

            //one long para body, put as summary
            newPara.title='';
            newPara.body=currentPara[0];
        }
        else{
            newPara.title = currentPara[0];
            var paraBody = '';
            for(var j=1;j<currentPara.length;j++){
                const currParaSent = currentPara[j];
               // console.log("currSent "+ currParaSent);
                paraBody = paraBody + currentPara[j];
            }
            newPara.body = paraBody;
        }
        allParas.push(newPara);
    
    }

    getParas(text){
        var sentence="";
        var prev='0';
        var prev2 = '0';
        var currentPara=[], allParas=[];
        var ans="";
        for(var i=0;i<text.length;i++){
            if(text[i]=='\n'){
              
                if(prev!='\n'){
                    // sentence=sentence+';';
                    currentPara.push(sentence);
                    sentence = '';
                }
                else if(prev2!='\n'){
                    // sentence=sentence+'|';
                    sentence = '';
                    if(currentPara.length>0){
                        this.formatParas(currentPara,allParas);
                        currentPara = [];
                    }

                }
            }
            else{
                sentence=sentence+text[i];
                ans = ans + text[i];
            }

            prev2 = prev;
            prev = text[i];
        }

            //Remaining sentence added
            if(sentence!=''){
                currentPara.push(sentence);
            }
            if(currentPara.length>0){
               this.formatParas(currentPara,allParas);
               currentPara = [];
            }

        return allParas;
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    
      }

    handleKeyPress = (e) => {
        if (e.key === 'Enter') {
          
        }
      }

    sendMessage(e) {
        if (e.key === 'Enter') {
          //this.props.onKeyUp(e.target.value) your work with value
          // I want to clear the textarea around here
         // e.target.value = '';
         
        }
      }

     saveDraftInBulk(){
        var bulkBlocks = [];
        bulkBlocks = this.getParas(this.state.value);

         var draftBlocks=[];
         for(var i=0;i<bulkBlocks.length;i++){
             var newDraftBlock = {
                 entities:[],
                 evidences:[],
                 summary: bulkBlocks[i].body,
                 title: bulkBlocks[i].title
             }

             Object.keys(this.props.investigationGraph).forEach(function(key) {
                if(newDraftBlock.summary.toLowerCase().indexOf(key.toString().toLowerCase()) >= 0){
                    newDraftBlock.entities.push({
                        title:key,
                        type:"None"
                    })
                }
            });
             draftBlocks.push(newDraftBlock);
         }

         this.props.addDraftBlocksInBulk(draftBlocks);
     } 

    render(){
        return(
            <div>
                <div className="bulk-draft-options-container">
                    <button 
                        className="saveBlockButton" 
                        onClick={this.saveDraftInBulk}>
                            <SaveIcon/>
                    </button>
                    <button 
                        className="cancelBlockButton" 
                        onClick={this.props.cancelBulkDraftBlock}>
                            <ClearIcon/>
                    </button>
                </div>
                <form>
                <label>
                    <Textarea 
                    type="text"
                    value={this.state.value}
                    onKeyPress={this.handleKeyPress}
                    onChange={(e) => { this.handleChange(e)}}
                    maxRows="60"
                    minRows="10"
                    onKeyUp = {this.sendMessage}
                    style={{
                        borderWidth:'2px', 
                        borderStyle:'solid', 
                        borderColor:'lightgrey',
                        marginLeft:'1%',
                        marginRight:'1%',
                        paddingTop:'6px',
                        paddingBottom:'6px',
                        width:'95%'
                        }}/>
                </label>
                </form>
                <div>{this.state.display}</div>
            </div>
        );
    }

}
export default BulkDraftBlockComponent;