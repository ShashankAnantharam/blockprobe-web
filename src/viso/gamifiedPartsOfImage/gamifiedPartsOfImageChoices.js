import React, { Component } from 'react';
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
import './gamifiedPartsOfImage.css';
import { isNullOrUndefined } from 'util';

let arr = [
    {
        title:'Boy',
        summary:"This is a very very veyr very very very  very very good boy."
    },
    {
        title:'Girl'
    },
    {
        title:'Dog'
    },
    {
        title:'Rat'
    }
]
class GamifiedPartsOfImageChoicesView extends React.Component {

    constructor(props){
      super(props);
      //choiceArr, onClickChoice

      this.renderCard = this.renderCard.bind(this);
      this.clickedChoice = this.clickedChoice.bind(this);
    }

    clickedChoice(choice){
        console.log(choice);
        if(this.props.onClickChoice){
            this.props.onClickChoice(choice);
        }
    }

    renderCard(choice){
        return(
            <Card elevation={6} className="choiceCard" 
            onClick={() => this.clickedChoice(choice)}>
                <CardContent>
                    {!isNullOrUndefined(choice.title)?
                        <Typography variant="h5" component="h2">{choice.title}</Typography>
                        :
                        null
                    }
                    {!isNullOrUndefined(choice.summary) && choice.summary.trim().length>0?
                        <Typography variant="body2" component="p" gutterBottom>
                            {choice.summary}
                        </Typography>
                        :
                        null
                    }                                                                                                                       
                </CardContent>
            </Card>
        )
    }

    renderMultipleCueCards(choices){
        if(isNullOrUndefined(choices))
            return null;
        let scope = this;
        let renderChoices = choices.map((choice) => {
            return (
                <Grid
                    item
                    xs={12}
                    md={6}
                    lg={3}
                    style={{paddingBottom:'10px'}}>
                        <Grid
                        item
                        xs={9}>
                            {scope.renderCard(choice)}
                        </Grid>
                                    
                </Grid>
            );
        })

        return renderChoices;
    }

    render(){
        return (
        <div>            
            <div className="gamifiedDissectBlockOptionsContainer">
                <Grid
                container
                direction="row">
                    {this.renderMultipleCueCards(arr)}
                </Grid>
            </div>
        </div>
        );
    }
}
export default GamifiedPartsOfImageChoicesView;