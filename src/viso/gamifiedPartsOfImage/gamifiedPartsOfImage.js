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
import { isNullOrUndefined } from 'util';
import './gamifiedPartsOfImage.css';
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
        correctAns: {}
      }

      ReactGA.initialize('UA-143383035-1');  

      this.getImageFromDb = this.getImageFromDb.bind(this);
      this.selectLine = this.selectLine.bind(this);
      this.getGamedPartsOfImageList = this.getGamedPartsOfImageList.bind(this);
      this.onClickChoice = this.onClickChoice.bind(this);
    }

    componentDidMount(){
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
        //TODO
    }

    selectCorrectName(){
        //TODO
    }

    selectCorrectFunction(){
        //TODO
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

    render(){

        return (
            <div>
                {!this.state.loadingImage?
                    <div>
                        <DissectPictureView
                            partsOfImageLines={this.getGamedPartsOfImageList(this.props.partsOfImageList,this.state.correctAns)}
                            imageUrl={this.state.imageUrl}
                            selectLine={this.selectLine}
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
        )
    }
    /*

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
    */
}
export default GamifiedPartsOfImageView;
