import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import './ImagePane.css';
import Textarea from 'react-textarea-autosize';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Img from 'react-image';

class ImagePaneView extends React.Component {

    constructor(props){
        super(props);

        this.state={
            firstEntitySelectList: [

            ],
            selectedEntityUrl: '',
            selectedEntity: ''
        }

        this.generateEntityLists = this.generateEntityLists.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.submitEntityImage = this.submitEntityImage.bind(this);
        this.canSubmit = this.canSubmit.bind(this);

    }

    async submitEntityImage(){
        if(this.state.selectedEntity.length > 0){
            var newImage = {
                entity: this.state.selectedEntity,
                url: this.state.selectedEntityUrl,
                timestamp: Date.now()
            }

            await firebase.firestore().collection("Blockprobes").
            doc(this.props.bId).
            collection("images").
            doc(newImage.entity).set(newImage);

            this.props.refreshBlockprobe();
        }

    }

    generateEntityLists(){
        var count = 1;
        var firstEntityList = this.state.firstEntitySelectList;
        Object.keys(this.props.investigationGraph).forEach(function(entityLabel) {
            firstEntityList.push({                
                    value: false, 
                    label: entityLabel, 
                    id: count             
            });           
            count++;
        });

        firstEntityList.sort(function(a,b){
            if(a.label.toLocaleLowerCase() == 'none')
                return -1;
            if(b.label.toLocaleLowerCase() == 'none')
                return 1;
            if(a.label.toLocaleLowerCase() < b.label.toLocaleLowerCase())
                return -1;
            return 1;
        });
       
        let selectedEntity = '', url = '';
        if(firstEntityList.length > 0){
            selectedEntity = firstEntityList[0].label;
            if(selectedEntity in this.props.imageMapping){
                url = this.props.imageMapping[selectedEntity];
            }
            firstEntityList[0].value = true;
        }
        this.setState({
            firstEntitySelectList: firstEntityList,
            selectedEntity: selectedEntity,
            selectedEntityUrl: url 
        });
    }

    firstEntityClicked(entityList) {
        var selectedEntity = '', url = '';
        for(var i=0; i<entityList.length; i++){
            if(entityList[i].value){
                selectedEntity = entityList[i].label;
                if(selectedEntity in this.props.imageMapping){
                    url = this.props.imageMapping[selectedEntity];
                }
            }
        }
        this.setState({ 
            firstEntitySelectList: entityList, 
            selectedEntity: selectedEntity,
            selectedEntityUrl: url 
        });
    }
    
    firstSelectedBadgeClicked(entityList) {
        var selectedEntity = '', url = '';
        for(var i=0; i<entityList.length; i++){
            if(entityList[i].value){
                selectedEntity = entityList[i].label;
                if(selectedEntity in this.props.imageMapping){
                    url = this.props.imageMapping[selectedEntity];
                }
            }
        }
        this.setState({ 
            firstEntitySelectList: entityList, 
            selectedEntity: selectedEntity,
            selectedEntityUrl: url 
        });
    }

    componentDidMount(){
        this.generateEntityLists();
    }

    handleChange(event, type) {

        var shouldUpdate = true;
        if(type!="date" && type!="time"){
            var lastChar = event.target.value[event.target.value.length-1];
            if(lastChar=='\n' || lastChar=='\t'){
                shouldUpdate=false;
            }
        }

        if(shouldUpdate){
            if(type=="entity"){
                var selectedEntityUrl = event.target.value;
                this.setState({selectedEntityUrl: selectedEntityUrl});
            }
        }
           
      }

    canSubmit(){
        if(this.props.permit == 'CREATOR' && this.state.selectedEntity.length > 0)
            return true;
        return false;
    }  

    render(){

        const selectedOptionsStyles = {
            color: "white",
            backgroundColor: "rgb(117, 106, 214)",
            borderRadius:"20px",
            fontSize:'0.6em',
            padding:'10px'
        };
        const optionsListStyles = {
            backgroundColor: "darkcyan",
            color: "white",

        };

        return (
            <div>
                <div className='imagepane-filter-container'>                
                
                    <div className="imagepane-dropdown-container">
                        <MultiSelectReact 
                        options={this.state.firstEntitySelectList}
                        optionClicked={this.firstEntityClicked.bind(this)}
                        selectedBadgeClicked={this.firstSelectedBadgeClicked.bind(this)}
                        selectedOptionsStyles={selectedOptionsStyles}
                        optionsListStyles={optionsListStyles} 
                        isSingleSelect={true}
                        isTextWrap={false} 
                        />
                        
                    </div>     

                    {this.canSubmit()?
                        <button className="imagePaneButton" onClick={this.submitEntityImage}>Confirm image</button>
                        :
                        null
                    }
                    
                    <button className="imagePaneButton" onClick={this.props.closeImagePane}>Close</button>              
                </div>
                {this.state.selectedEntity == ''?
                    null   
                        :
                    <div>
                        <div className="imagepane-url-container">
                                <form>
                                    <label>
                                        <Textarea 
                                            type="text"
                                            placeholder = "Image url"
                                            value={this.state.selectedEntityUrl}
                                            onChange={(e) => { this.handleChange(e,"entity")}}
                                            maxRows="2"
                                            minRows="1"
                                            style={{
                                                background: 'white',
                                                borderWidth:'2px', 
                                                borderStyle:'solid', 
                                                borderColor:'black',
                                                paddingTop:'6px',
                                                paddingBottom:'6px',
                                                width:'95%'
                                                }}/>
                                    </label>
                                </form>
                        </div>
                        <div>
                            <Img src={[this.state.selectedEntityUrl]}
                                style={{width:'200px', maxHeight:'200px', marginLeft: '1.1em'}}></Img>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
export default ImagePaneView;