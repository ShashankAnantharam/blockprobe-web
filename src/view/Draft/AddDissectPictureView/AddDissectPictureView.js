import React, { Component } from 'react';
import DissectPictureView from '../../../viso/dissectPicture/dissectPicture';
import { Button } from '@material-ui/core';
import Loader from 'react-loader-spinner';
import TextField from '@material-ui/core/TextField';
import * as firebase from 'firebase';
import * as Utils from '../../../common/utilSvc';
import './AddDissectPictureView.css';
import { isNullOrUndefined } from 'util';
import AddImageDissectPictureView from './AddImageDissectPictureView';

class AddDissectPictureView extends React.Component {

    constructor(props){
        super(props);

        this.state={
            addConnection: false,
            title: "",
            summary: "",
            isEdit: false,
            oldTitle: "",
            oldSummary: "",
            imageUrl: null,
            editImage: false,
            loadingImage: false
        }

        this.handleChange = this.handleChange.bind(this);
        this.closeImagePane = this.closeImagePane.bind(this);
        this.openImagePane = this.openImagePane.bind(this);
        this.getImageFromDb = this.getImageFromDb.bind(this);
    }

    handleChange(event, type) {
        let str = event.target.value;
        var shouldUpdate = true;
        shouldUpdate = Utils.shouldUpdateText(str, ['\n','\t']);
        if(shouldUpdate){
            if(type=="description"){
                this.setState({summary: event.target.value});
            }
            else  if(type=="title"){
                this.setState({title: event.target.value});
            }
        }
    }

    async getImageFromDb(){
        let scope = this;
        scope.setState({
            loadingImage: true
        });
        let path = this.props.bId + '/general/dissect_picture';
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

    componentDidMount(){
       // this.setState({
       //     imageUrl: "https://i.pinimg.com/564x/3d/22/ef/3d22ef2dc19d25469b0c4f75ce868118.jpg"
       // })

       this.getImageFromDb();
    }

    closeImagePane(){
        this.setState({
            editImage: false
        });
        this.getImageFromDb();
    }

    openImagePane(){
        this.setState({
            editImage: true
        });
    }

    renderView(){

        return (
            <div>
                {!isNullOrUndefined(this.state.imageUrl) && !this.state.editImage?
                    <div className="">
                        <div>
                            <DissectPictureView
                                addBlock={this.state.addConnection}
                                imageUrl={this.state.imageUrl}
                            />
                        </div>
                        <div className="leftMargin-1em" style={{display:'flex', flexWrap:'wrap'}}>
                            {this.state.addConnection && this.state.title.length>0 && 
                            (!this.state.isEdit || (this.state.title !=this.state.oldTitle 
                                || this.state.summary != this.state.oldSummary))?
                                <div>
                                    <Button
                                        variant="contained" 
                                        onClick={() => { }}
                                        className="savePicturePartButton"
                                        >
                                        Save
                                    </Button>
                                </div>
                                :
                                null
                            }     

                            <div>
                                <Button
                                    variant="contained" 
                                    onClick={() => { 
                                        this.setState({
                                            addConnection: !this.state.addConnection,
                                            title:"",
                                            summary:""
                                        })
                                    }}
                                    className="addPicturePartButton"
                                    >
                                    {this.state.addConnection?
                                        "Cancel" 
                                        :
                                        "Add line"
                                    }
                                </Button>
                            </div> 

                            {!isNullOrUndefined(this.state.imageUrl)?
                                <div>
                                    <Button
                                        variant="contained" 
                                        onClick={() => {
                                            this.setState({
                                                editImage: true
                                            });
                                         }}
                                        className="editPicturePartImageButton"
                                        >
                                        Change picture
                                    </Button>
                                </div>
                                :
                                null
                            }              
                        </div>
                        <div className="leftMargin-1em">
                            {this.state.addConnection?
                            <div>
                                <h4 className="addEdgeTitle"> Picture part</h4>
                                <div className="addEdgeBlockTextContainer">
                                    <TextField 
                                                type="text"
                                                variant="outlined"
                                                value={this.state.title}
                                                onChange={(e) => { this.handleChange(e,"title")}}
                                                label = "Name of part"
                                                multiline
                                                rowsMax="2"
                                                rows="1"
                                                style={{
                                                    background: 'white',
                                                    marginTop:'6px',
                                                    marginBottom:'6px',
                                                    width:'100%',
                                                    color: 'darkBlue',
                                                    fontWeight:'600'
                                                    }}/>
                                </div>
                                <div className="addEdgeEntityContainer">
                                    <TextField 
                                                type="text"
                                                variant="outlined"
                                                value={this.state.summary}
                                                onChange={(e) => { this.handleChange(e,"description")}}
                                                label = "Function of part"
                                                multiline
                                                rowsMax="3"
                                                rows="2"
                                                style={{
                                                    background: 'white',
                                                    marginTop:'6px',
                                                    marginBottom:'6px',
                                                    width:'100%',
                                                    color: 'darkBlue',
                                                    fontWeight:'600'
                                                    }}/>
                                </div>
                                
                            </div>
                            :
                            null
                            }
                        </div>
                    </div>
                    :
                    <AddImageDissectPictureView
                            closeImagePane={this.closeImagePane}
                            bId={this.props.bId}
                            imageUrl = {this.state.imageUrl}
                    />
                }
            </div>
        )
    }

    render(){
        return (
            <div>
                {this.state.loadingImage?
                     <div style={{margin:'auto',width:'50px'}}>
                        <Loader 
                        type="TailSpin"
                        color="#00BFFF"
                        height="50"	
                        width="50"
                        /> 
                    </div>
                 :
                    <div>
                        {this.renderView()}
                    </div>
                }
            </div>
        )
    }
}
export default AddDissectPictureView;