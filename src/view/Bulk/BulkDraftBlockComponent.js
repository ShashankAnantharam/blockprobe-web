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
import Info from '@material-ui/icons/Info';
import Loader from 'react-loader-spinner';
import OcrComponent  from './ocrComponent/OcrComponent';
import ArticleLinkComponent from './articleLinkComponent/ArticleLinkComponent';
import { isNullOrUndefined } from 'util';
import * as Utils from '../../common/utilSvc';
import Joyride,{ ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { setTimeout } from 'timers';

class BulkDraftBlockComponent extends React.Component {


    constructor(props){
        super(props);
        //cancelBulkDraftBlock, addDraftBlock,investigationGraph, addBlocksTooltip

        this.state ={
            value:'',
            isSavingBlocks: false,
            openOcr: false,
            openArticleLink: false,
            placeholderOld: "Paste text here in the following format:\n\nTitle of block1\nContent of block1\n\nTitle of block2\nContent of block2\n\n(Note:\nAdding #2 at the start of the title will give the block a rank of 2, which is useful in sorting the block.\nAdding #2s at the start of the title will put the block in summary view and give it the rank 2.)",
            placeholder: "Input your story (broken into paragraphs) here",
            tooltipText:{
                addBlocks:[
                    {
                        title: 'Write your story as short paragraphs and save!',
                        target: '.addBlocksPaneInput',
                        content: '',
                        disableBeacon: true
                    }/*,
                    {
                        title: 'Additional info!',
                        target: '.bulkdraft-list',
                        content: 'You can learn more by clicking the info icons in blue',
                        disableBeacon: true
                    }
                    ,
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
            },
            adhocTooltip:{
                para:{
                    flag: false,
                    text: [
                        {
                            title: 'Importance of paragraphs in input!',
                            target: '.tooltipPara',
                            content: 'Your input must be in the forms of paras with every two paras seperated by atleast one empty line. Each para becomes one block. To add titles to your blocks, you can add a title to each para but please note that the title and the content must NOT have empty lines between them. In the example shown in red text, \'#1s Avengers\' is the title while \'Thor, Rogers,...\' is the content. In the same example, another block is inputed without a title but with content \'Thor is from Asgard.\' ',
                            disableBeacon: true
                        }
                    ]
                },
                hashtag:{
                    flag: false,
                    text: [
                        {
                            title: 'Importance of hashtags in the title of each block!',
                            target: '.tooltipHashtag',
                            content: 'Each block has a title. If you want to order your blocks to provide structure to your content (in the same way paragraphs follow a certain order in a story), you can start the title using a hashtag. For example, the block with \'#1\' as title will show up before the block with \'#2\'. The text in red inputs a block with a title that starts with #1.',
                            disableBeacon: true
                        }
                    ]
                },
                summary:{
                    flag: false,
                    text: [
                        {
                            title: 'Importance of hashtags in the summary view!',
                            target: '.tooltipSummary',
                            content: 'Your story dashboard contains a summary visualisation that provides a summary of your story to any viewer. As a contributor to the story, you may want your block to surface in the summary. To do so, you need to append the letter \'s\' to the hashtag in the title. Note that the \'s\' must come after the number in the hashtag. For example, in the red text, the first block as a title that begins with \'#1s\', so it will surface in the summary view. The ordering of blocks in the summary view is the same as described in the previous tooltip.',
                            disableBeacon: true
                        }
                    ]
                }
            }
        }
        this.functions = firebase.functions();

        //this.EditSingleBlock = this.EditSingleBlock.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.getParas = this.getParas.bind(this);
        this.formatParas = this.formatParas.bind(this);
        this.isValidNlpEntity = this.isValidNlpEntity.bind(this);
        this.isDate = this.isDate.bind(this);
        this.isLocation = this.isLocation.bind(this);        
        this.isRepeatedNlpEntity = this.isRepeatedNlpEntity.bind(this);
        this.saveDraftInBulk = this.saveDraftInBulk.bind(this);
        this.showLocalTooltip = this.showLocalTooltip.bind(this);
        this.handleAdhocTooltipJoyrideCallback = this.handleAdhocTooltipJoyrideCallback.bind(this);
        this.makeEntityUppercase = this.makeEntityUppercase.bind(this);
        this.closeAdvancedTabs = this.closeAdvancedTabs.bind(this);
        this.toggleAdvancedTab = this.toggleAdvancedTab.bind(this);
        this.isAnyAdvancedTabOpened = this.isAnyAdvancedTabOpened.bind(this);        
        this.addText = this.addText.bind(this);
        this.closeBulkDraft = this.closeBulkDraft.bind(this);
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

    isAnyAdvancedTabOpened(){
        return(this.state.openArticleLink || this.state.openOcr);
    }

    closeAdvancedTabs(){
        this.setState({
            openOcr: false,
            openArticleLink: false
        });
    }

    toggleAdvancedTab(type){
        if(type == 'ocr'){
            this.setState({
                openOcr: !this.state.openOcr
            }); 
        }
        else if(type == 'article'){
            this.setState({
                openArticleLink: !this.state.openArticleLink
            });
        }
    }

    handleChange(event) {
        this.setState({
            value: event.target.value,
        });
    
      }
    
    addText(text){
        let value = this.state.value;
        value += text;        

        this.setState({
            value: value
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

    isLocation(nlpEntity){
        if(nlpEntity.type != 'LOCATION')
            return false;
        return true;
    }

     isValidNlpEntity(nlpItem, nounType){

        if(isNullOrUndefined(nlpItem))
            return false;

         let mentions = nlpItem.mentions;

         if(!isNullOrUndefined(nlpItem.name) && (nlpItem.name.toLowerCase() == 'all' ||(nlpItem.name.toLowerCase() == 'none')))
            return false;

         for(var i=0;i<mentions.length;i++){
             if(mentions[i].type == nounType)
                return true;
         }
         return false;
     }

     isDate(nlpEntity){
        if(nlpEntity.type != 'DATE')
            return false;

        if(nlpEntity.metadata){
            let date = nlpEntity.metadata;
            if(!('day' in date) || !('month' in date) || !('year' in date))
                return false;  
        }
        return true;
     }

     isRepeatedNlpEntity(nlpItem){
        var entityPane = this.props.entityPane;
        var nlpKey = nlpItem.name;
        for(var j =0; j< entityPane.length; j++){
            var key = entityPane[j].label;
            if(key.toLowerCase().indexOf(nlpKey.toLowerCase())>=0 || nlpKey.toLowerCase().indexOf(key.toLowerCase())>=0){
                return true;
            }
        }
        return false;
     }

     makeEntityUppercase(value){
        return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(); 
        }  

     async saveDraftInBulk(){
        this.setState({isSavingBlocks: true});
        var bulkBlocks = [];
        bulkBlocks = this.getParas(this.state.value);
        var draftBlocks=[];
        
        //Takin 10 blocks at a time for summary
        var concatSummaryText = '';
        var nlpEntities = [];
        var nlpCommonNounEntities = [];
        let nlpDates = [];
        let nlpLocations = [];
        for(var i=0;i<bulkBlocks.length;i++){
            concatSummaryText += bulkBlocks[i].body;
            concatSummaryText += '.';
            if(i%10==9 || i==bulkBlocks.length-1){
                var entitiesFunc = this.functions.httpsCallable('entityExtraction');
                var result = {};
                try{
                    result = await entitiesFunc({text: concatSummaryText});
                }
                catch(e){
                    result = {
                        data: []
                    };
                }
                finally{
                }
                   
                if(result.data){
                    // console.log(result.data);
                    for(var j=0;j<result.data.length;j++){
                        result.data[j].name = this.makeEntityUppercase(result.data[j].name);
                        if(this.isValidNlpEntity(result.data[j],'PROPER') && !this.isLocation(result.data[j]) &&  !this.isRepeatedNlpEntity(result.data[j])){
                            nlpEntities.push(result.data[j]);
                        }
                        if(this.isValidNlpEntity(result.data[j],'COMMON') &&  !this.isRepeatedNlpEntity(result.data[j])){
                            nlpCommonNounEntities.push(result.data[j]);
                        }
                        if(this.isDate(result.data[j])){
                            nlpDates.push(result.data[j]);
                        }
                        if(this.isLocation){
                            nlpLocations.push(result.data[j]);
                        }
                    }
                }
                 //   nlpEntities.concat(result.data);
                concatSummaryText = '';        
            }
        }

        nlpEntities.sort(function(a, b){return b.salience - a.salience});
        nlpCommonNounEntities.sort(function(a, b){return b.salience - a.salience});

         // console.log(nlpEntities);
         // console.log(nlpCommonNounEntities);
         // console.log(nlpDates);
        
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

             for(var j=0; j<nlpEntities.length && newDraftBlock.entities.length<=3; j++){
                var key = nlpEntities[j].name;
                if(newDraftBlock.summary.toLowerCase().indexOf(key.toString().toLowerCase()) >= 0){
                    newDraftBlock.entities.push({
                        title:key,
                        type:"None"
                    })
                } 
             }

             //If entities are less, use common nouns also
             for(var j=0; j<nlpCommonNounEntities.length && newDraftBlock.entities.length==0; j++){
                var key = nlpCommonNounEntities[j].name;
                if(newDraftBlock.summary.toLowerCase().indexOf(key.toString().toLowerCase()) >= 0){
                    newDraftBlock.entities.push({
                        title:key,
                        type:"None"
                    })
                } 
             }

             if(newDraftBlock.entities){
                 //Dedup done here
                var result = newDraftBlock.entities.reduce((unique, o) => {
                    if(!unique.some(obj => obj.title === o.title)) {
                      unique.push(o);
                    }
                    return unique;
                },[]); 
                newDraftBlock.entities = result;
            }

            for(let j=0; j<nlpDates.length; j++){
                let key = nlpDates[j].name;
                if(newDraftBlock.summary.toLowerCase().indexOf(key.toString().toLowerCase()) >= 0){
                    let blockDate = {
                        date: Number(nlpDates[j].metadata.day),
                        month: Number(nlpDates[j].metadata.month)-1,
                        year: Number(nlpDates[j].metadata.year)
                    }
                    newDraftBlock['blockDate'] = blockDate;
                    break;
                }
            }
             
             
             draftBlocks.push(newDraftBlock);             
         }
         // console.log(draftBlocks);
         this.setState({isSavingBlocks: false});
         this.props.addDraftBlocksInBulk(draftBlocks);
     } 

     showLocalTooltip(type){
         var adhocTooltip = this.state.adhocTooltip;
        if(type=='para'){
            adhocTooltip.para.flag = true;
        }
        else if(type=='hashtag'){
            adhocTooltip.hashtag.flag = true;
        }
        else if(type == 'summary'){
            adhocTooltip.summary.flag = true;
        }
        this.setState({adhocTooltip: adhocTooltip});
     }

     handleAdhocTooltipJoyrideCallback(data, tooltipType){
        const {action,index,status,type} = data;
        if([STATUS.FINISHED, STATUS.SKIPPED].includes(status)){
            var adhocTooltip = this.state.adhocTooltip;
            if(tooltipType=='para'){
                adhocTooltip.para.flag = false;
            }
            else if(tooltipType=='hashtag'){
                adhocTooltip.hashtag.flag = false;
            }
            else if(tooltipType == 'summary'){
                adhocTooltip.summary.flag = false;
            }
            this.setState({adhocTooltip: adhocTooltip});
        }
    }

    async closeBulkDraft(){
        let textList = Utils.getTextListForBulk(this.state.value);

        try{
            let bulkText = firebase.firestore().collection("Blockprobes").doc(this.props.bId)
            .collection("users").doc(this.props.uIdHash).collection("bulkText");

            let allDocs = await bulkText.get();

            if(allDocs){
                let deletePromises = [];
                allDocs.forEach((doc) => {
                    let deletePromise = firebase.firestore().collection("Blockprobes").doc(this.props.bId)
                    .collection("users").doc(this.props.uIdHash).collection("bulkText").doc(doc.id).delete();
                    deletePromises.push(deletePromise);
                });    
                await Promise.all(deletePromises);
            }

            let writePromises = [];
            for(let i=0; i<textList.length; i++){
                let textPage = {
                    id: i,
                    text: textList[i]
                };
                let writePromise = firebase.firestore().collection("Blockprobes").doc(this.props.bId)
                    .collection("users").doc(this.props.uIdHash).collection("bulkText").doc(String(i)).set(textPage);
                writePromises.push(writePromise);
            }
            await Promise.all(writePromises);
        }
        catch(e){
        }
        finally{
            this.props.cancelBulkDraftBlock();
        }

    }

    async componentDidMount(){
        try{
            let bulkText = firebase.firestore().collection("Blockprobes").doc(this.props.bId)
            .collection("users").doc(this.props.uIdHash).collection("bulkText");

            let allDocs = await bulkText.orderBy("id").get();
            let text = this.state.value;
            if(allDocs){
                allDocs.forEach((doc) => {
                    text += doc.data().text;
                })
            };    
            this.setState({
                value: text
            });
        }
        catch{
        }
        
    }

    oldTooltips(){
        return (
            <div  style={{marginLeft: '1em'}} className='addBlocksPane'>
                <p className='tooltips-list-bulkdraft'>**The following key points are important while contributing to any story. Click on the info icons to learn more<br/>
                </p>
                <ol className='tooltips-list-bulkdraft bulkdraft-list'>
                    <li>
                        How paragraphs get converted into blocks. 
                        <a className='tooltipPara tooltips-bulkdraft' onClick={(e)=>{this.showLocalTooltip('para')}} >
                            <Info style={{fontSize:'19px'}}/>
                        </a>
                        <Joyride
                        styles={{
                            options: {
                            arrowColor: '#e3ffeb',
                            beaconSize: '4em',
                            primaryColor: '#05878B',
                            backgroundColor: '#e3ffeb',
                            overlayColor: 'rgba(10,10,10, 0.4)',
                            width: 900,
                            zIndex: 1000,
                            }
                            }}
                            steps={this.state.adhocTooltip.para.text}
                            run = {this.state.adhocTooltip.para.flag}
                            callback={(data)=>{this.handleAdhocTooltipJoyrideCallback(data,'para')}}                    
                            />  
                        
                    </li>
                    <li>
                        Role of the title hashtag in ordering of content 
                        <a className='tooltipHashtag tooltips-bulkdraft' onClick={(e)=>{this.showLocalTooltip('hashtag')}} >
                            <Info style={{fontSize:'19px'}}/>
                        </a>
                        <Joyride
                        styles={{
                            options: {
                            arrowColor: '#e3ffeb',
                            beaconSize: '4em',
                            primaryColor: '#05878B',
                            backgroundColor: '#e3ffeb',
                            overlayColor: 'rgba(10,10,10, 0.4)',
                            width: 900,
                            zIndex: 1000,
                            }
                            }}
                            steps={this.state.adhocTooltip.hashtag.text}
                            run = {this.state.adhocTooltip.hashtag.flag}
                            callback={(data)=>{this.handleAdhocTooltipJoyrideCallback(data,'hashtag')}}                    
                            />  
                    </li>
                    <li>
                        Role of the title hashtag in the creation of the story summary 
                        <a className='tooltipSummary tooltips-bulkdraft' onClick={(e)=>{this.showLocalTooltip('summary')}} >
                            <Info style={{fontSize:'19px'}}/>
                        </a>
                        <Joyride
                        styles={{
                            options: {
                            arrowColor: '#e3ffeb',
                            beaconSize: '4em',
                            primaryColor: '#05878B',
                            backgroundColor: '#e3ffeb',
                            overlayColor: 'rgba(10,10,10, 0.4)',
                            width: 900,
                            zIndex: 1000,
                            }
                            }}
                            steps={this.state.adhocTooltip.summary.text}
                            run = {this.state.adhocTooltip.summary.flag}
                            callback={(data)=>{this.handleAdhocTooltipJoyrideCallback(data,'summary')}}                    
                            />  
                    </li>
                </ol>                
            </div>
        );
    }

    render(){
        return(
            <div className='bulkDraftBlocksPaneContainer'>
                {this.state.isSavingBlocks?
                    <div>
                        <div style={{padding:'3px', textAlign:'center'}}>
                                    <p className="processingDraftBlockText">
                                        We are processing your contribution. Kindly wait for a few moments.
                                    </p>
                        </div>                        
                        <div style={{margin:'auto',width:'50px'}}>
                            <Loader 
                            type="TailSpin"
                            color="#00BFFF"
                            height="50"	
                            width="50"
                            /> 
                        </div>
                    </div>
                    :
                    <div>
                        <div  style={{marginLeft: '1em'}} className='addBlocksPane'>
                                <p style={{fontSize:'13px', color:'grey', fontStyle:'italic'}}>Copy paste your content. Your content must be divided into paragraphs. Add subtitles for each para if needed. <br/> 
                                For example, copy paste the entire text in red as input. 
                                    <a href='https://youtu.be/SCDA-rUVdMA?t=192' target='blank'>                            
                                        Learn More
                                    </a>
                                </p>
                                <p className='copyBlockBulkText' style={{fontSize:'13px', color:'red', fontStyle:'italic', background:'rgba(255,0,0,0.3)'}}>                           
                                    Avengers<br/>
                                    Thor, Rogers and Ironman are the Avengers.<br/><br/>
                                    Thor is from Asgard
                                </p>
                        </div>

                        <div className='bulkDraftBlocksPaneTitle'>Contribute to the story</div>
                        <Joyride
                        styles={{
                            options: {
                            arrowColor: '#e3ffeb',
                            beaconSize: '4em',
                            primaryColor: '#05878B',
                            backgroundColor: '#e3ffeb',
                            overlayColor: 'rgba(10,10,10, 0.4)',
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
                                color: 'blue',
                                fontWeight:'500',
                                fontSize: '16px',
                                fontStyle: 'normal'
                                }}/>
                        </label>
                        </form>
                        <div className="bulk-draft-options-container" style={{marginTop:'0'}}>
                            <button 
                                className="saveBlockButton saveBlocksInBulk" 
                                onClick={this.saveDraftInBulk}>
                                    <div>Save</div>
                            </button>
                            <button 
                                className="cancelBlockBackButton" 
                                onClick={this.closeBulkDraft}>
                                    <div>Close</div>
                            </button>
                        </div>

                        <div className='bulkDraftBlocksPaneTitle'>Advanced options</div>
                        
                        {this.isAnyAdvancedTabOpened()?
                            <div className="bulk-draft-options-container" style={{marginTop:'0'}}>
                                <button 
                                    className="advancedImageOcr" 
                                    onClick={() => {this.closeAdvancedTabs()}}>
                                        <div>Close</div>                                                                    
                                </button>
                            </div>
                            :
                            <div className="bulk-draft-options-container" style={{marginTop:'0'}}>
                                <button 
                                    className="advancedImageOcr" 
                                    onClick={() => {this.toggleAdvancedTab('ocr')}}>
                                        <div>Contribute text from image</div>                                                                    
                                </button>
                                <button 
                                    className="advancedImageOcr" 
                                    onClick={() => {this.toggleAdvancedTab('article')}}>
                                        <div>Retrieve text from article</div>                                                                    
                                </button>                                
                            </div>
                        }

                        {this.state.openOcr?
                            <OcrComponent
                                addText={this.addText}
                                closeComponent={this.closeAdvancedTabs}
                                ></OcrComponent>
                            :
                            null
                        }

                        {this.state.openArticleLink?
                            <ArticleLinkComponent
                                addText={this.addText}
                                closeComponent={this.closeAdvancedTabs}
                            ></ArticleLinkComponent>
                            :
                            null
                        }
                    </div>
                }           
            </div>
        );
    }

}
export default BulkDraftBlockComponent;