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
        slideCard: true
      }

      ReactGA.initialize('UA-143383035-1');  

      this.getImageFromDb = this.getImageFromDb.bind(this);
      this.selectLine = this.selectLine.bind(this);
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
        console.log(path);
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
        console.log(lineDetails);
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
        console.log(block);
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
                                            <Typography variant="h5" component="h2">{block.title}</Typography>
                                            :
                                            null
                                        }                                        
                                        <Typography variant="body2" component="p" gutterBottom>
                                            {block.summary}
                                        </Typography>
                                        <Typography color="textSecondary">
                                        Select the correct Name and function
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Slide>                            
                        </Grid>

                    </Grid>
                    <div className="gamifiedTimelineBlock horizontallyCentered">                        
                        
                    </div>
                </div>
        );
    }

    render(){
        return (
            <div>
                {!this.state.loadingImage?
                    <div>
                        <DissectPictureView
                            partsOfImageLines={this.props.partsOfImageList}
                            imageUrl={this.state.imageUrl}
                            selectLine={this.selectLine}
                        />
                        {!isNullOrUndefined(this.state.selectedLine)?
                            <div>
                                {this.singleBlockCard(this.state.selectedLine)}
                            </div>
                            :
                            <div>
                            </div>
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
}
export default GamifiedPartsOfImageView;
