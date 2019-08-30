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
                {
                    value: true, 
                    label: "None", 
                    id: -1
                }
            ],
            selectedEntityUrl: '',
            selectedEntity: ''
        }

        this.generateEntityLists = this.generateEntityLists.bind(this);
        this.handleChange = this.handleChange.bind(this);

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
       


        this.setState({
            firstEntitySelectList: firstEntityList,
        });
    }

    firstEntityClicked(entityList) {
        this.setState({ firstEntitySelectList: entityList });
    }
    
    firstSelectedBadgeClicked(entityList) {
        this.setState({ firstEntitySelectList: entityList });
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

                    <button className="imagePaneButton" onClick={this.submitEntityImage}>Confirm image</button>
                    <button className="imagePaneButton" onClick={this.props.closeImagePane}>Close</button>              
                </div>
                {this.state.selectedEntity == 'None'?
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