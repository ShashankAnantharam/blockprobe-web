import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import Textarea from 'react-textarea-autosize';
import * as firebase from 'firebase';
import * as Utils  from '../../../common/utilSvc';
import Checkbox from '../../Draft/Checkbox';
import  MultiSelectReact  from 'multi-select-react';
import * as Const from '../../../common/constants';
import  "./translateComponent.css";
import { isNullOrUndefined } from 'util';

class TranslateTextComponent extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            firstLangSelectList: [],
            selectedLang: String(this.props.lang),
            currentLangLabel: null
        }

        this.generateLangLists = this.generateLangLists.bind(this);
        this.canSubmit = this.canSubmit.bind(this);
        this.translateText = this.translateText.bind(this);
    }

    firstLangClicked(entityList) {
        var selectedEntity = null;
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
        var selectedEntity = null;
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
        let selectedLangLabel = this.state.selectedLangLabel;
        
        for(let i=0; i<Const.langs.length; i++){
            let langSelected =  false;
            if(this.state.selectedLang == Const.langs[i].id){
                langSelected = true;
                selectedLangLabel = Const.langs[i].label;
            }
            firstEntityList.push({                
                value: langSelected, 
                label: Const.langs[i].label,
                id: Const.langs[i].id
            }); 
        }
               
        this.setState({
            firstLangSelectList: firstEntityList,
            currentLangLabel: selectedLangLabel
        });
    }

    componentDidMount(){
        this.generateLangLists();
    }

    canSubmit(){
        if(!isNullOrUndefined(this.state.selectedLang))
            return true;
        return false;
    }

    translateText(){
        let firstEntityList = this.state.firstLangSelectList;
        for(let i=0; i<firstEntityList.length; i++){
            if(this.state.selectedLang == firstEntityList[i].id){
                this.setState({
                    currentLangLabel: firstEntityList[i].label
                });
                break;
            }
        }
        console.log('translate to',this.state.currentLangLabel);
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

        return(
            <div className="translateTextContainer">
                <div className='translatepane-filter-container'>                
                    <div className="translatepane-dropdown-container">
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
                        <button className="translatePaneButton" onClick={this.translateText}>Translate</button>
                        :
                        null
                    }
                                
                </div>
            </div>
        )
    }
}
export default TranslateTextComponent;