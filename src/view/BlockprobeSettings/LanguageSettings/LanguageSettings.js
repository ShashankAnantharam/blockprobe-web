import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import  MultiSelectReact  from 'multi-select-react';
import * as Const from '../../../common/constants';

import './LanguageSettings.css';

class LanguageSettingsComponent extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            firstLangSelectList: [],
            selectedLang: String(this.props.lang)
        }

        this.generateLangLists = this.generateLangLists.bind(this);
        this.canSubmit = this.canSubmit.bind(this);
    }

    firstLangClicked(entityList) {
        var selectedEntity = '', url = '';
        for(var i=0; i<entityList.length; i++){
            if(entityList[i].value){
                selectedEntity = entityList[i].id;                
            }
        }
        this.setState({ 
            firstLangSelectList: entityList, 
            selectedLang: selectedEntity
        });
    }

    firstSelectedBadgeClicked(entityList) {
        var selectedEntity = '', url = '';
        for(var i=0; i<entityList.length; i++){
            if(entityList[i].value){
                selectedEntity = entityList[i].id;
            }
        }

        this.setState({ 
            firstLangSelectList: entityList, 
            selectedLang: selectedEntity
        });
    }

    generateLangLists(){
        var count = 1;
        var firstEntityList = this.state.firstLangSelectList;
        
        for(let i=0; i<Const.langs.length; i++){
            let langSelected =  false;
            if(this.state.selectedLang == Const.langs[i].id)
                langSelected = true;
            firstEntityList.push({                
                value: langSelected, 
                label: Const.langs[i].label,
                id: Const.langs[i].id
            }); 
        }
               
        this.setState({
            firstLangSelectList: firstEntityList
        });
    }

    componentDidMount(){
        this.generateLangLists();
    }

    canSubmit(){
        if(this.state.selectedLang != this.props.lang)
            return true;
        return false;
    }

    render(){

        const selectedOptionsStyles = {
            color: "white",
            backgroundColor: "rgb(117, 106, 214)",
            borderRadius:"20px",
            fontSize:'0.6em',
            padding:'10px',
            maxWidth: '92%',
            wordWrap: 'break-word'
        };
        const optionsListStyles = {
            backgroundColor: "darkcyan",
            color: "white",

        };

        return (
            <div>
                <div style={{marginLeft:'10px', marginTop:'1em'}}>
                    <h3>Language settings</h3>
                    <div className='langpane-filter-container'>                
                        <div className="langpane-dropdown-container">
                            <MultiSelectReact 
                            options={this.state.firstLangSelectList}
                            optionClicked={this.firstLangClicked.bind(this)}
                            selectedBadgeClicked={this.firstSelectedBadgeClicked.bind(this)}
                            selectedOptionsStyles={selectedOptionsStyles}
                            optionsListStyles={optionsListStyles} 
                            isSingleSelect={true}
                            isTextWrap={false} 
                            />
                            
                        </div>     

                        {this.canSubmit()?
                            <button className="langPaneButton" onClick={this.submitEntityImage}>Save</button>
                            :
                            null
                        }
                                    
                    </div>
                </div>
            </div>
        )
    }
}
export default LanguageSettingsComponent;
