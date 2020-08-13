import React, { Component } from 'react';
import ReactGA from 'react-ga';
import Loader from 'react-loader-spinner';
import * as firebase from 'firebase';
import DissectPictureView from '../dissectPicture/dissectPicture';

class GamifiedPartsOfImageView extends React.Component {

    constructor(props){
      super(props);
      //bpId, partsOfImageList

      this.state = {
        loadingImage: true,
        imageUrl: null
      }

      ReactGA.initialize('UA-143383035-1');  

      this.getImageFromDb = this.getImageFromDb.bind(this);
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
