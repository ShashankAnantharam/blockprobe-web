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
import Joyride from 'react-joyride';

class BulkDraftBlockComponent extends React.Component {


    constructor(props){
        super(props);
        //cancelBulkDraftBlock, addDraftBlock,investigationGraph, addBlocksTooltip

        this.state ={
            value:'',
            placeholderOld: "Paste text here in the following format:\n\nTitle of block1\nContent of block1\n\nTitle of block2\nContent of block2\n\n(Note:\nAdding #2 at the start of the title will give the block a rank of 2, which is useful in sorting the block.\nAdding #2s at the start of the title will put the block in summary view and give it the rank 2.)",
            placeholder: "Input or Paste the text here",
            tooltipText:{
                addBlocks:[
                    {
                        title: 'Add your blocks!',
                        target: '.copyBlockBulkText',
                        content: 'You are going to add your first blocks to your story. Copy-paste ALL the red colored text into the input and save your content. The text contains hashtags and paragraphs that play an important role while shaping your content. You can learn more by clicking the info icons in blue',
                        disableBeacon: true
                    }
                   /* ,
                    {
                        title: 'Save your blocks!',
                        target: '.saveBlocksInBulk',
                        content: 'Once you are done copy-pasting the red text into the input, please save your content.',
                        disableBeacon: false,
                        placementBeacon: 'left',
                        event: 'hover'
                    }*/
                ]            
            },
            showTooltip:{
                addBlocks: JSON.parse(JSON.stringify(props.addBlocksTooltip))
            }
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

            // console.log(allParas);
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

             //MARK HERE ENTITIES

             
             var entityPane = this.props.entityPane;


             for(var j =0; j< entityPane.length; j++){
                var key = entityPane[j].label;
                if(newDraftBlock.summary.toLowerCase().indexOf(key.toString().toLowerCase()) >= 0){
                    newDraftBlock.entities.push({
                        title:key,
                        type:"None"
                    })
                } 
             }
             
            
             draftBlocks.push(newDraftBlock);
         }
         // console.log(draftBlocks);
         this.props.addDraftBlocksInBulk(draftBlocks);
     } 

    render(){
        return(
            <div className='bulkDraftBlocksPaneContainer'>
            <div className='bulkDraftBlocksPaneTitle'>Contribute to the story</div>
                <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '4em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(79, 26, 0, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={this.state.tooltipText.addBlocks}
                    run = {this.state.showTooltip.addBlocks}                    
                    />  
                <form className='addBlocksPaneInput'>
                <label>
                    <Textarea 
                    type="text"
                    value={this.state.value}
                    onKeyPress={this.handleKeyPress}
                    placeholder={this.state.placeholder}
                    onChange={(e) => { this.handleChange(e)}}
                    maxRows="60"
                    minRows="10"
                    onKeyUp = {this.sendMessage}
                    style={{
                        background: 'white',
                        borderRadius:'5px',
                        borderWidth:'2px', 
                        borderStyle:'solid', 
                        borderColor:'black',
                        marginLeft:'1%',
                        marginRight:'1%',
                        paddingTop:'6px',
                        paddingBottom:'6px',
                        width:'95%',
                        color: 'darkBlue',
                        fontWeight:'600'
                        }}/>
                </label>
                </form>
                <div  style={{marginLeft: '1em'}} className='addBlocksPane'>
                        <p style={{fontSize:'13px', color:'grey', fontStyle:'italic'}}>**Input text as pararaphs with an empty line gap between two paras. Each para becomes a block and you can give a title to each para. For example, copy paste the text in red as input. <a href='https://youtu.be/SCDA-rUVdMA?t=192' target='blank'>Learn More</a></p>
                        <p className='copyBlockBulkText' style={{fontSize:'13px', color:'red', fontStyle:'italic', background:'rgba(255,0,0,0.3)'}}>                           
                            #1s Avengers<br/>
                            Thor, Rogers and Ironman are the Avengers.<br/><br/>
                            Thor is from Asgard
                        </p>
                </div>
                <div className="bulk-draft-options-container" style={{marginTop:'0'}}>
                    <button 
                        className="saveBlockButton saveBlocksInBulk" 
                        onClick={this.saveDraftInBulk}>
                            <div>Save</div>
                    </button>
                    <button 
                        className="cancelBlockBackButton" 
                        onClick={this.props.cancelBulkDraftBlock}>
                            <div>Close</div>
                    </button>
                </div>
            </div>
        );
    }

}
export default BulkDraftBlockComponent;