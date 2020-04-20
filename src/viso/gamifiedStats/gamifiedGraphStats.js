import React, { Component } from 'react';
import Speedometer from '../speedoMeter/Speedometer';
import Paper from '@material-ui/core/Paper';
import './gamifiedGraphStats.css';

class GamifiedGraphStats extends React.Component {
    constructor(props) {
      super(props);
      //stats

      this.renderSingleEntityMistakes = this.renderSingleEntityMistakes.bind(this);
    }

    renderSingleEntityMistakes(entity, mistakes){
        return (
            <div className="statsEntityMistakesContainer"> 
                <span className="statsEntityText">{entity} : </span><span className="statsMistakes">{String(mistakes)}</span> 
            </div>
        )
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
                <div className="statsTitle">Game statistics</div>
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
            </div>
        );
    }
}
export default GamifiedGraphStats;