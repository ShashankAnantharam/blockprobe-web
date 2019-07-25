import React, { Component } from 'react';
import * as firebase from 'firebase';
import ReactGA from 'react-ga';
import SingleBlock from '../view/SingleBlock';
import BulkDraftBlockComponent from '../view/Bulk/BulkDraftBlockComponent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AddIcon from '@material-ui/icons/Add';
import BookIcon from '@material-ui/icons/Book';
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import './UserBlocksComponent.css';
import { isNullOrUndefined } from 'util';
import EntityPaneView from "../view/EntityPane/EntityPane";
import Joyride from 'react-joyride';

////var uIdHash = crypto.createHash('sha256').update(`${userId}`).digest('hex');

class UserBlocksComponent extends React.Component {
    
    constructor(props){
        super(props);
        //props: finishBuildingStoryTooltip, bpDetails, finishAddingBlockToStoryTooltip

        this.state={
            uIdHash:'',
            shajs:null,
            selectedDraftBlockId: null,
            entityPaneList: [],
            draftBlocks:{},
            successBlocks:{},
            toReviewBlocks:{},
            inReviewBlocks:{},
            blockStateMap:{},
            newBlock: {
                title:'',
                summary:'',
                blockState:'DRAFT',
                entities:[]
            },
            isCreateBlockClicked:false,
            isCreateBulkBlockClicked: false,
            isEntityPaneOpen: false,
            tooltipText:{
                entityPane:[                    
                    {                    
                        title: 'Your story is empty!',
                        target: '.entityPaneButtonTooltip',
                        content: 'First you have to define the entities or characters of your story. Click on this button to start defining the entities',
                        disableBeacon: true
                    }             
                ],
                addBlocks:[                    
                    {                    
                        title: 'Add your first block!',
                        target: '.addBulkBlockButton',
                        content: 'Now lets add the content to your story. Click on \'Contribute\' to start adding content to your story',
                        disableBeacon: true
                    }             
                ],
                draftBlock:[
                    {
                        title: 'Lets do the final touches!',
                        target: '.draftBlocksList',
                        content: 'Your newly created blocks are in draft and you can see them here in the list. Click on the block with the title \'#1s Avengers\'.',
                        disableBeacon: true
                    }
                ],
                commitBlock:[
                    {
                        title: 'Add your block to the story!',
                        target: '.inReviewBlockList',
                        content: 'Your block is in review. You can see it in this list. Since you are the creator of the story, you also get to review the block. But for now, you can skip the review and directly add it to the story. Click on your block in review.',
                        disableBeacon: true
                    }
                ]
            },
            showTooltip:{
                entityPane: false, //JSON.parse(JSON.stringify(props.buildStory)),
                addBlocks: JSON.parse(JSON.stringify(props.buildStory)), //false,
                draftBlock: false,
                commitBlock: false
            }
        }

        //props include bpId, uId
        var shajs = require('sha.js');
        this.state.uIdHash = shajs('sha256').update(this.props.uId).digest('hex');
        this.state.shajs = shajs;

        ReactGA.initialize('UA-143383035-1');   
        ReactGA.pageview('/userBlocks');

        this.modifyBlockList = this.modifyBlockList.bind(this);
        this.modifyBlockListWrapper = this.modifyBlockListWrapper.bind(this);
        this.selectBlock = this.selectBlock.bind(this);
        this.renderSingleBlock = this.renderSingleBlock.bind(this);
        this.renderBlockOptions = this.renderBlockOptions.bind(this);
        this.createBlock = this.createBlock.bind(this);
        this.createBulkBlock = this.createBulkBlock.bind(this);
        this.cancelBulkBlock = this.cancelBulkBlock.bind(this);
        this.changeSelectedBlock = this.changeSelectedBlock.bind(this);
        this.openEntityPane = this.openEntityPane.bind(this);
        this.closeEntityPane = this.closeEntityPane.bind(this);
        this.deleteNewBlock = this.deleteNewBlock.bind(this);
        this.deleteDraftBlock = this.deleteDraftBlock.bind(this);
        this.addDraftBlock = this.addDraftBlock.bind(this);
        this.addDraftBlocksInBulk = this.addDraftBlocksInBulk.bind(this);
        this.updateDraftBlock = this.updateDraftBlock.bind(this);
        this.getRandomReviewer = this.getRandomReviewer.bind(this);
        this.giveBlockToFirstReviewer = this.giveBlockToFirstReviewer.bind(this);
        this.submitDraftBlock = this.submitDraftBlock.bind(this);     
        this.updateEntityPaneList = this.updateEntityPaneList.bind(this);  
        this.initEntityPane = this.initEntityPane.bind(this); 
        this.finishTooltip = this.finishTooltip.bind(this);
        this.commitBlockToBlockprobe = this.commitBlockToBlockprobe.bind(this);
    }

    updateEntityPaneList(list){
        this.setState({entityPaneList: list});
    }

    getRandomReviewer(reviewerList, revMap)
    {
        if(!isNullOrUndefined(reviewerList)){
            var val = (Date.now()%reviewerList.length);
            
            for(var i=0;i<reviewerList.length;i++)
            {
                var curr=(val+i)%(reviewerList.length);
                // console.log(reviewerList[i]);
                if(!(reviewerList[curr].id in revMap))
                {
                    return reviewerList[curr];
                }
            }
        }

        return null;
    }

    giveBlockToFirstReviewer(block)
    {
        var revMap={};

        //Deepcopy of reviewerList
        const reviewersStr = JSON.stringify(this.props.bpDetails.reviewers);
        var reviewersList = JSON.parse(reviewersStr);
        var randomReviewer = this.getRandomReviewer(reviewersList, revMap);

        if(randomReviewer!=null) {

            block.blockState = "TO REVIEW";

            revMap[randomReviewer.id]="-";
            firebase.firestore().collection("Blockprobes").
                doc(block.bpID).
                collection("users").doc(randomReviewer.id).
                collection("userBlocks").
                doc(block.key+"_r").set(block);

        }
        else{
            //console.log("No other reviewers left!");
        }



        var newBlock = {
            actionType: block.actionType,
            blockAuthor: this.state.uIdHash,
            entities: isNullOrUndefined(block.entities)?null:block.entities,
            evidences: isNullOrUndefined(block.evidences)?null:block.evidences,
            reviewers:revMap,
            summary: block.summary,
            timestamp: block.timestamp,
            title: block.title,
        }

        firebase.database().ref("Blockprobes/"+block.bpID
                        +"/reviewBlocks/"+block.key).set(newBlock);

    }


    modifyBlockList(block, add){
        if(block.blockState=="SUCCESSFUL"){
            var currMap = this.state.successBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                successBlocks:currMap
            });
        }
        else if(block.blockState=="UNDER REVIEW"){
            var currMap = this.state.inReviewBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                inReviewBlocks:currMap
            });
        }
        else if(block.blockState=="TO REVIEW"){
            var currMap = this.state.toReviewBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                toReviewBlocks:currMap
            });
        }
        else if(block.blockState=="DRAFT"){
            var currMap = this.state.draftBlocks;
            if(add)
                currMap[block.key]=block;
            else
                delete currMap[block.key];
            this.setState({
                draftBlocks:currMap
            });
        }
    }


    modifyBlockListWrapper(doc, add){
        var block = doc.data();
        var blockId = doc.id;
        var blockStateMap = this.state.blockStateMap;
        if(blockId in blockStateMap){
            var prevState = blockStateMap[blockId];
            var oldBlock = {
                key:block.key,
                blockState: prevState
            };
            //delete old block
            this.modifyBlockList(oldBlock,false);

            if(add){
                //add new block
                this.modifyBlockList(block,true);

                 //Update blockstate
               blockStateMap[blockId] = block.blockState;
            }
        }
        else if(add){
            //First time block gets added
            blockStateMap[blockId] = block.blockState;
            this.modifyBlockList(block,true);
        }
    }

    deleteDraftBlock(blockKey){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(blockKey).delete();
    }

    updateDraftBlock(blockKey, newBlock){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(blockKey).set(newBlock);

    }

    addDraftBlocksInBulk(blocks){

        var currTime = Date.now();
        for(var i =0;i<blocks.length; i++){
            blocks[i].timestamp = currTime + 1000*i;
            this.addDraftBlock(blocks[i]);
        }
        this.setState({isCreateBulkBlockClicked: false});

        var args = {
            blockprobe: this.props.bId,
            count: blocks.length
        }    
    
        //console.log(blocks);
        if(blocks.length>0)
            this.finishTooltip('addBlocks');


        ReactGA.event({
            category: 'blocks',
            action: 'Add blocks in bulk',
            label: JSON.stringify(args)
          });
    }

    addDraftBlock(block){
        if(isNullOrUndefined(block.timestamp))
            block.timestamp = Date.now();
        var newDraftBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(block.timestamp)).digest('hex');

        if(isNullOrUndefined(block.blockState)){
            block.blockState = "DRAFT";
        }

        //(uidHash + time)
        block.key = newDraftBlockId;
        block.actionType = "ADD";
        block.bpID = this.props.bId;       
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(block.key).set(block);

        this.setState({isCreateBlockClicked:false});
    }

    submitDraftBlock(block){
        if(isNullOrUndefined(block.key)){
            block.timestamp = Date.now();
           var newDraftBlockId = this.state.shajs('sha256').update(this.state.uIdHash+String(block.timestamp)).digest('hex');

            //(uidHash + time)
            block.key = newDraftBlockId;
            block.actionType = "ADD";
        }
        block.bpID = this.props.bId;

        block.blockState = "UNDER REVIEW";
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").
        doc(block.key).set(block);

        this.giveBlockToFirstReviewer(block);

        this.setState({isCreateBlockClicked:false});
        this.finishTooltip('draftBlock');
    }

    componentDidMount(){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("userBlocks").onSnapshot(
            querySnapshot => {
                querySnapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'modified') {
                        this.modifyBlockListWrapper(change.doc,true);
                      }
                      if (change.type === 'removed') {
                        this.modifyBlockListWrapper(change.doc,false);
                      }
                });

            
            }
        );  
        
        this.initEntityPane();
    }

    changeSelectedBlock(draftBlockId){
        this.setState({
            selectedDraftBlockId: draftBlockId
        });
    }

    renderSingleBlock(block, scope, isNewBlock){

        if(isNullOrUndefined(block)){
            return null;
        }

        return(
            <SingleBlock 
            block={block} 
            selectBlock={this.selectBlock}
            investigationGraph={this.props.investigationGraph}
            isNewBlock={isNewBlock}
            deleteNewBlock={this.deleteNewBlock}
            deleteDraftBlock = {this.deleteDraftBlock}
            addDraftBlock = {this.addDraftBlock}
            updateDraftBlock = {this.updateDraftBlock}
            submitDraftBlock = {this.submitDraftBlock}
            commitBlockToBlockprobe = {this.commitBlockToBlockprobe}
            entityPane = {this.state.entityPaneList}
            draftBlockTooltip = {this.state.showTooltip.draftBlock}
            finishTooltip = {this.finishTooltip}
            selectedDraftBlockId = {this.state.selectedDraftBlockId}
            changeSelectedBlock = {this.changeSelectedBlock} 
            bpDetails = {this.props.bpDetails}
            />
        );
    }

    selectBlock(block){
        this.props.selectBlock(block);
    }

    createBlock(){
        // var newDraftBlockId = this.state.shajs('sha256').update(this.props.uId+String(Date.now())).digest('hex');
        this.setState({isCreateBlockClicked:true});
    }

    openEntityPane(){
        ReactGA.event({
            category: 'entity pane',
            action: 'entity pane opened',
            label: 'entity pane opened'
          });
        this.setState({isEntityPaneOpen: true});
    }

    closeEntityPane(hasTooltipsFinished){
        if(hasTooltipsFinished)
            this.finishTooltip('entity');
        this.setState({isEntityPaneOpen: false});
    }

    createBulkBlock(){
        ReactGA.event({
            category: 'bulk block pane',
            action: 'bulk block pane opened',
            label: 'bulk block pane opened'
          });
        this.setState({isCreateBulkBlockClicked:true});
    }

    cancelBulkBlock(){
        this.setState({isCreateBulkBlockClicked:false});
    }

    deleteNewBlock(){
        this.setState({isCreateBlockClicked:false});
    }

    initEntityPane(){
        firebase.firestore().collection("Blockprobes").doc(this.props.bId)
        .collection("users").doc(this.state.uIdHash).collection("session")
        .doc("entityPane").get().then((snapshot) => {
            if(snapshot.exists)
                {
                    var entities = snapshot.data().entities;
                    // console.log(entities);
                    this.setState({entityPaneList:entities});
                }
        });
    }

    async commitBlockToBlockprobe(block){
        await this.props.commitBlockToBlockprobe(block);
        this.finishTooltip('commitBlock');
    }

    finishTooltip(tooltip){
        var showTooltip = this.state.showTooltip;
        if(tooltip == 'entity'){            
            if(showTooltip.entityPane){
                showTooltip.entityPane = false;
                showTooltip.addBlocks = true;
            }
        }
        else if(tooltip == 'addBlocks'){            
            if(showTooltip.addBlocks){
                showTooltip.entityPane = false;
                showTooltip.addBlocks = false;
                showTooltip.draftBlock = true;
            }
        }
        else if(tooltip == 'draftBlock'){            
            if(showTooltip.draftBlock){
                showTooltip.entityPane = false;
                showTooltip.addBlocks = false;
                showTooltip.draftBlock = false;
                showTooltip.commitBlock = true;

                this.props.finishBuildingStoryTooltip();
            }
        } 
        else if(tooltip == 'commitBlock'){
            showTooltip.entityPane = false;
            showTooltip.addBlocks = false;
            showTooltip.draftBlock = false;
            showTooltip.commitBlock = false;
            this.props.finishAddingBlockToStoryTooltip();
        }

        this.setState({
            showTooltip: showTooltip
        })
    }

    renderBlockOptions(){

        if(this.state.isCreateBlockClicked){
            return(
                <div>
                    {this.renderSingleBlock(this.state.newBlock,this, true)}
                </div>
            );
        }
        if(this.state.isCreateBulkBlockClicked){
            return(
                <div>
                    <BulkDraftBlockComponent
                        cancelBulkDraftBlock = {this.cancelBulkBlock}
                        addDraftBlocksInBulk = {this.addDraftBlocksInBulk}
                        investigationGraph = {this.props.investigationGraph}
                        entityPane = {this.state.entityPaneList}
                        addBlocksTooltip = {this.state.showTooltip.addBlocks}
                        finishTooltip = {this.finishTooltip}
                    />
                </div>
            )
        }

        if(this.state.isEntityPaneOpen){
            return (
                <EntityPaneView
                    closeEntityPane = {this.closeEntityPane}
                    investigationGraph = {this.props.investigationGraph}
                    bId = {this.props.bId}
                    uIdHash={this.state.uIdHash}
                    updateEntityPaneList = {this.updateEntityPaneList}
                    entityPaneTooltip = {this.state.showTooltip.entityPane}
                    finishTooltip = {this.finishTooltip}/>
            );
        }

        return (<div className="userblocks-options-container">   
                   <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(10,10,10, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={this.state.tooltipText.entityPane}
                    run = {this.state.showTooltip.entityPane}                    
                    />   
                    <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
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
                    <button 
                    className="addBulkBlockButton" 
                    onClick={this.createBulkBlock}>
                        <div>Contribute</div>
                    </button>
                    
                    <button 
                    className="editEntitiesButton entityPaneButtonTooltip" 
                    onClick={this.openEntityPane}>
                        <div>Manage story entities</div>
                    </button>
                </div>)
    }

    render(){

        const scope = this;
        const successBlocksListRender = Object.keys(this.state.successBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.successBlocks[blockId], scope, false)
        ));

        const toReviewBlocksListRender = Object.keys(this.state.toReviewBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.toReviewBlocks[blockId], scope, false)
        ));

        const inReviewBlocksListRender = Object.keys(this.state.inReviewBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.inReviewBlocks[blockId], scope, false)
        ));

        const draftBlocksListRender = Object.keys(this.state.draftBlocks).
        map((blockId) => (
            scope.renderSingleBlock(scope.state.draftBlocks[blockId], scope, false)
        ));


        return(
            <div>
                     
                {this.renderBlockOptions()}
                    
                {Object.keys(this.state.draftBlocks).length>0?
                <div>
                     <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(10,10,10, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={this.state.tooltipText.draftBlock}
                    run = {this.state.showTooltip.draftBlock}                    
                    /> 
                    <h4 className="block-list-title">DRAFT</h4>
                    <div className="block-list-content draftBlocksList">
                        <List>{draftBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.inReviewBlocks).length>0?
                <div>
                    <Joyride
                styles={{
                    options: {
                      arrowColor: '#e3ffeb',
                      beaconSize: '3em',
                      primaryColor: '#05878B',
                      backgroundColor: '#e3ffeb',
                      overlayColor: 'rgba(10,10,10, 0.4)',
                      width: 900,
                      zIndex: 1000,
                    }
                  }}
                    steps={this.state.tooltipText.commitBlock}
                    run = {this.state.showTooltip.commitBlock}                    
                    /> 
                    <h4 className="block-list-title">IN REVIEW</h4>
                    <div className="block-list-content inReviewBlockList">
                        <List>{inReviewBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.toReviewBlocks).length>0?
                <div>
                    <h4 className="block-list-title">TO REVIEW</h4>
                    <div className="block-list-content">
                        <List>{toReviewBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

                {Object.keys(this.state.successBlocks).length>0?
                <div>
                    <h4 className="block-list-title">SUCCESSFUL</h4>
                    <div className="block-list-content">
                        <List>{successBlocksListRender}</List>
                    </div>
                </div>
                :
                null
                }

            </div>
        );
    }


}
export default UserBlocksComponent;