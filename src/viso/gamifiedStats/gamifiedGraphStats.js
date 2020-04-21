import React, { Component } from 'react';
import Speedometer from '../speedoMeter/Speedometer';
import { Button } from '@material-ui/core';
import GamifiedAuth from './gamifiedStatsAuth';
import Paper from '@material-ui/core/Paper';
import './gamifiedGraphStats.css';

class GamifiedGraphStats extends React.Component {
    constructor(props) {
      super(props);
      //stats, canSave
      this.state = {
          saveAuth: false,
          finishedSaving:  false
      }

      this.renderSingleEntityMistakes = this.renderSingleEntityMistakes.bind(this);
      this.saveResults = this.saveResults.bind(this);
      this.finishSaving = this.finishSaving.bind(this);
    }

    renderSingleEntityMistakes(entity, mistakes){
        return (
            <div className="statsEntityMistakesContainer"> 
                <span className="statsEntityText">{entity} : </span><span className="statsMistakes">{String(mistakes)}</span> 
            </div>
        )
    }

    saveResults(){
        this.setState({
            saveAuth: true,
            finishedSaving: false
        });
    }

    finishSaving(){
        this.setState({
            saveAuth: false,
            finishedSaving: true
        });
    }

    render(){
        let entityList = [];
        for(let entity in this.props.stats.entityStats){
            entityList.push({
                entity: entity,
                mistakes: this.props.stats.entityStats[entity]
            });
        }
        entityList.sort(function(a,b){ return a.mistakes - b.mistakes });

        let renderEntityList = entityList.map((entity) => {
            return this.renderSingleEntityMistakes(entity.entity, entity.mistakes);
        })
        return (
            <div class="statsContainer">
                <div className="statsTitle">Game results</div>
                <div className="statsAmchartContainer">
                                <Speedometer 
                                    id="speedometer12"
                                    val={this.props.stats.score}
                                    min={0}
                                    max={this.props.stats.totalScore}/>
                            </div>

                <div className="statsScoreText">Score: <span className="statsScoreVal">{this.props.stats.score}</span>
                <span className="statsTotalScoreVal">/{this.props.stats.totalScore}</span></div>

                {entityList.length > 0?
                    <div className="statsMistakesContainer">
                        <div className="statsMistakesTitle">Mistakes</div>
                        <div className="statsMistakesContent">
                            {renderEntityList}
                        </div>
                    </div>
                    :
                    null
                }

                <div className="statsMistakesOptions">
                    {this.props.canSave && !this.state.finishedSaving?
                        <Button 
                        variant="contained" 
                        className="statsSaveButton"
                        onClick={() => { this.saveResults()}}
                        >Save results</Button>
                        :
                        null
                    }
                </div>
                <div>
                    {this.state.finishedSaving?
                        <p className="statsSavedMessage">Your results have been saved!</p>
                        :
                        null
                    }                    
                </div>
                {this.state.saveAuth?
                    <GamifiedAuth 
                        stats={this.props.stats}
                        finishSaving={this.finishSaving}
                        bpId={this.props.bpId}
                        type={'graphGame'}/>
                        :
                    null
                }

                                
            </div>
        );
    }
}
export default GamifiedGraphStats;