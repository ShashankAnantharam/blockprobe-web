import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Loader from 'react-loader-spinner';
import * as firebase from 'firebase';
import DissectPictureView from '../dissectPicture/dissectPicture';
import { Button } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Slide from '@material-ui/core/Slide';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import Typography from '@material-ui/core/Typography';
import Speedometer from '../speedoMeter/Speedometer';
import { isNullOrUndefined } from 'util';
import './gamifiedPartsOfImage.css';
import GamifiedGraphStats from '../gamifiedStats/gamifiedGraphStats';
import GamifiedPartsOfImageChoicesView from './gamifiedPartsOfImageChoices';


class GamifiedPartsOfImageView extends React.Component {

    constructor(props){
      super(props);
      //bpId, partsOfImageList

      this.state = {
        loadingImage: true,
        imageUrl: null,
        selectedLine: null,
        answerTitle: null,
        answerSummary: null,
        slideCard: true,
        correctAns: {},
        restrictedLines: {},
        score: 0,
        totalScore: 0,
        stats: {
            score: 0,
            gameStats: {},
            totalScore: 0
        },
        stopGame: false
      }

      ReactGA.initialize('UA-143383035-1');  

      this.getImageFromDb = this.getImageFromDb.bind(this);
      this.selectLine = this.selectLine.bind(this);
      this.getGamedPartsOfImageList = this.getGamedPartsOfImageList.bind(this);
      this.onClickChoice = this.onClickChoice.bind(this);
      this.incrementScore = this.incrementScore.bind(this);
    }

    componentDidMount(){
        let totalScore = this.getTotalScore(this.props.partsOfImageList);
        this.setState({
            totalScore: totalScore
        });

        this.getImageFromDb();
    }

    async getImageFromDb(){
        let scope = this;
        scope.setState({
            loadingImage: true
        });
        let path = this.props.bpId + '/general/dissect_picture';
        let pathRef = firebase.storage().ref(path);
        try{
        
            let url = await pathRef.getDownloadURL();
                         
            scope.setState({
                imageUrl: url,
                loadingImage: false
            });
        }
        catch(error){
            scope.setState({
                imageUrl: null,
                loadingImage: false
            });
        }  
    }

    selectLine(lineDetails){
        if(JSON.stringify(this.state.selectedLine)!=JSON.stringify(lineDetails)){
            this.setState({
                selectedLine: lineDetails,
                answerTitle: null,
                answerSummary: null,
                slideCard: true
            });
        }

    }

    setSlideAnimation(value){
        this.setState({
            slideCard: value
        });
    }

    incrementScore(){

        let score = this.state.score;
        score++;
        this.setState({
            score: score
        });
        if(score==this.state.totalScore){
            let stats = this.state.stats;
            stats.score = score;
            stats.totalScore = this.state.totalScore;
            this.setState({
                stats: stats
            });
        }
    }

    singleBlockCard(block){
        return (
                <div className="gamifiedDissectBlockContainer">
                    <Grid
                    container
                    direction="row">
                        <Grid
                        item
                        xs={10}
                        md={7}
                        lg={5}>
                           
                            <Slide direction="up" in={this.state.slideCard} mountOnEnter unmountOnExit
                            onExited={() => {
                                this.setSlideAnimation(true);
                            }}
                            onEnter={() => {
                                
                            }}>
                                <Card elevation={6}>
                                    <CardContent>
                                        {!isNullOrUndefined(block.title)?
                                            <Typography variant="h5" component="h2">{block.answeredTitle}</Typography>
                                            :
                                            null
                                        }
                                        {!isNullOrUndefined(block.summary) && block.summary.trim().length>0?
                                            <Typography variant="body2" component="p" gutterBottom>
                                                {block.answeredSummary}
                                            </Typography>
                                            :
                                            null
                                        }                                                                                                                       
                                    </CardContent>
                                </Card>
                            </Slide>                            
                        </Grid>
                    </Grid>                    
                </div>
        );
    }

    onClickChoice(type,choice){
        if(this.state.selectedLine[type] == choice[type]){
            //Correct answer
            this.incrementScore();
            
            let correctAns = this.state.correctAns;
            if(!(this.state.selectedLine.key in correctAns))
                correctAns[this.state.selectedLine.key] = {};
            correctAns[this.state.selectedLine.key][type] = true;
            let selectedLine = this.state.selectedLine;
            selectedLine[type] = choice[type];
            this.setState({
                correctAns: correctAns,
                selectedLine: selectedLine
            });

            if(type=='summary'){
                let restrictedLines = this.state.restrictedLines;
                restrictedLines[this.state.selectedLine.key] = true;
                this.setState({
                    selectedLine: null,
                    restrictedLines: restrictedLines
                });
            }
        }
        else{
            //Wrong answer
        }
    }

    renderOptions(type, arr){
        //type is Name or Details
        //arr are choices
        return (
            <div>
                <GamifiedPartsOfImageChoicesView
                    choices = {arr}
                    type={type}
                    onClickChoice={this.onClickChoice}
                    />
            </div>
        )
    }

    getGamedPartsOfImageList(list,correctAns){
        let  ans = [];
        for(let i=0;list && i<list.length;i++){
            let newElem = JSON.parse(JSON.stringify(list[i]));
            if(correctAns[newElem.key] && correctAns[newElem.key].title){
                newElem['answeredTitle'] = newElem.title;
            }
            else{
                newElem['answeredTitle'] = "";
            }
            if(!isNullOrUndefined(newElem.summary) && newElem.summary.trim().length>0){
                if(correctAns[newElem.key] && correctAns[newElem.key].summary){
                    newElem['answeredSummary'] = newElem.summary;
                }
                else{
                    newElem['answeredSummary'] = "";
                }
            }
            ans.push(newElem);
        }
        return ans;
    }

    getOptions(type){
        let unique = {};
        let partsOfImageList = this.props.partsOfImageList; 
        for(let i=0; partsOfImageList && i<partsOfImageList.length; i++){
            if(type in partsOfImageList[i] && String(partsOfImageList[i][type]).trim().length>0){
                unique[String(partsOfImageList[i][type]).trim()] = "";
            }            
        }
        let ans = [];
        for(let key in unique){
            let newEntry = {};
            newEntry[type]=key;
            ans.push(newEntry);
        }
        return ans;
    }

    getTotalScore(list){
        let totalScore = 0;
        for(let i=0; list && i<list.length; i++){
            if(!isNullOrUndefined(list[i].title) && list[i].title.trim().length>0){
                totalScore++;
            }
            if(!isNullOrUndefined(list[i].summary) && list[i].summary.trim().length>0){
                totalScore++;
            }
        }
        return totalScore;
    }

    componentWillReceiveProps(newProps){
        if(this.props.partsOfImageList != newProps.partsOfImageList){
            let totalScore = this.getTotalScore(newProps.partsOfImageList);
            this.setState({
                totalScore: totalScore
            });
        }
    }

    stopGame(value){
        if(value){
            let stats = this.state.stats;
            stats.score = this.state.score;
            stats.totalScore = this.state.totalScore;
            this.setState({
                stats: stats
            });
            //console.log(stats);
        }
        this.setState({
            stopGame: value
        });
    }

    render(){
        let lineCoord = null, lineKey = null;
        if(this.state.selectedLine && this.state.selectedLine.lineCoord){
            lineCoord = this.state.selectedLine.lineCoord;
            lineKey = this.state.selectedLine.key;
        }
        return (
            <div>
                {this.state.stopGame || this.state.score==this.state.totalScore?
                    <div>
                        <GamifiedGraphStats
                            stats = {this.state.stats}
                            bpId={this.props.bpId}
                            title={this.props.title}
                            canSave = {true}
                            saveImmediately = {true}
                            type= {'dissect_picture'}
                            id={'dissect_picture_result'}
                            />
                    </div>
                    :
                <div>   
                    <div>                         
                        {this.state.totalScore>0?
                            <div>
                                <div className="gameButtonContainer" style={{marginLeft:'1em'}}>
                                    {!this.state.stopGame?
                                        <Button
                                        variant="contained" 
                                        className="stopGamebutton"
                                        onClick={() => { this.stopGame(true)}}
                                        >Save Results</Button>
                                        :
                                        null
                                    }                                
                                </div>   
                                <div className="scoreAmchartContainer">
                                    <Speedometer 
                                        id="speedometer_dissect_picture_ingame"
                                        val={this.state.score}
                                        min={0}
                                        max={this.state.totalScore}
                                        color={'#46237a'}/>
                                </div>
                                <div className="scoreText">Score: <span className="timelineScoreVal">{this.state.score}</span>
                                <span className="totalScoreVal">/{this.state.totalScore}</span></div> 
                            </div>
                            :
                            null
                        }
                                                          
                    </div>
                    {!this.state.loadingImage?
                        <div>
                            <DissectPictureView
                                partsOfImageLines={this.getGamedPartsOfImageList(this.props.partsOfImageList,this.state.correctAns)}
                                imageUrl={this.state.imageUrl}
                                selectLine={this.selectLine}
                                viewSingleLine={!isNullOrUndefined(lineCoord)}
                                singleLineCoord={lineCoord}
                                selectedLineKey={lineKey}
                                restrictedLines={this.state.restrictedLines}
                            />
                            {!isNullOrUndefined(this.state.selectedLine)?
                                <div>                                
                                    {isNullOrUndefined(this.state.correctAns[this.state.selectedLine.key]) || 
                                    (isNullOrUndefined(this.state.correctAns[this.state.selectedLine.key].title)
                                    || !this.state.correctAns[this.state.selectedLine.key].title)?
                                        <div>
                                            <h5 style={{marginLeft:'1em'}}>What is the name of this part?</h5>
                                            {this.renderOptions('title',this.getOptions('title'))}
                                        </div>
                                        :
                                        null
                                    }
                                    {!isNullOrUndefined(this.state.correctAns[this.state.selectedLine.key]) && 
                                    this.state.correctAns[this.state.selectedLine.key].title &&
                                    isNullOrUndefined(this.state.correctAns[this.state.selectedLine.key].summary) &&
                                    !isNullOrUndefined(this.state.selectedLine.summary) && 
                                    this.state.selectedLine.summary.trim().length>0?
                                        <div>
                                            <h5 style={{marginLeft:'1em'}}>Details regarding {this.state.selectedLine.title}?</h5>
                                            {this.renderOptions('summary',this.getOptions('summary'))}
                                        </div>
                                        :
                                        null
                                    }
                                </div>
                                :
                                null
                            }
                            
                        </div>
                        :
                        <div style={{margin:'auto',width:'50px'}}>
                            <Loader 
                            type="TailSpin"
                            color="#00BFFF"
                            height="50"	
                            width="50"
                            /> 
                        </div>
                    }                
                </div>
                }
            </div>
        )
    }
}
export default GamifiedPartsOfImageView;
