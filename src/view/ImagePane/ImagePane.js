import React, { Component } from 'react';
import  MultiSelectReact  from 'multi-select-react';
import './ImagePane.css';
import * as firebase from 'firebase';
import 'firebase/firestore';


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
            ]
        }

        this.generateEntityLists = this.generateEntityLists.bind(this);

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
                </div>
            </div>
        );
    }
}
export default ImagePaneView;