import React, { Component } from 'react';
import * as firebase from 'firebase';
import ImageUploader from 'react-images-upload';
import Loader from 'react-loader-spinner';
import imageCompression from 'browser-image-compression';
import * as Utils from '../../../common/utilSvc';
import  "./OcrComponent.css";
import { isNullOrUndefined } from 'util';

class OcrComponent extends React.Component {

    constructor(props){
        super(props);
        //addText

        this.state={
            text: 'none',
            loadingText: false,
            fileName: null
        }

        this.functions = firebase.functions();
        this.onDrop = this.onDrop.bind(this);
        this.uploadOcrFileToDb = this.uploadOcrFileToDb.bind(this);
    }

    async uploadOcrFileToDb(latestPicture){
         
        let scope = this;
        let path = this.props.bId + '/users/' + this.props.uId +'/ocr' ;
        let pathRef = firebase.storage().ref(path);
        try{
            await pathRef.put(latestPicture);
        }
        catch(error){

        }        
    }

    async onDrop(picture){
 
        if(picture.length > 0)
        {
            let name = null;
            let latestPicture = picture[picture.length-1];
            if(!isNullOrUndefined(latestPicture.name))
                name  = latestPicture.name;

            var options = {
                maxSizeMB: 1,
                useWebWorker: true
              }
              this.setState({
                loadingText: true
            });
            try {
                let compressedFile = await imageCompression(latestPicture, options);
                let url = URL.createObjectURL(compressedFile);

                await this.uploadOcrFileToDb(compressedFile);

                var ocrFunc = this.functions.httpsCallable('ocrTextExtraction');
                let text = '';

                try{
                    let finResult = await ocrFunc({bpId: this.props.bId, userId: this.props.uId}); 
                    text = finResult.data;
                    text = Utils.filterText(text);
                    text += '\n\n';                                       
                }
                catch(e){
                    text = '';
                }
                finally{
                    this.props.addText(text); 
                    this.setState({
                        loadingText: false,
                        fileName: name
                    });
                }
                  
            } catch (error) {
                console.log(error);
            }
        }
    }

    render(){
        return (
            <div>                  
                    {this.state.loadingText?
                            <div>
                                <div style={{margin:'auto',width:'50px'}}>
                                    <Loader 
                                        type="TailSpin"
                                        color="#00BFFF"
                                        height="50"	
                                        width="50"
                                        /> 
                                </div>
                                <div style={{padding:'3px', textAlign:'center'}}>
                                    <p className="processingOcrText">
                                        Your image is being processed. This may take 15 seconds or more to complete.
                                    </p>
                                </div> 
                            </div>                            
                            :
                            <div>
                                <ImageUploader
                                    withIcon={true}
                                    buttonText='Choose image'
                                    onChange={this.onDrop}
                                    singleImage={true}
                                    imgExtension={['.jpg', '.gif', '.png', '.gif']}
                                    maxFileSize={5242880}
                                    />
                                {!isNullOrUndefined(this.state.fileName)?
                                    <div style={{textAlign:'center'}}>
                                        <p className="processingOcrText">
                                            Your last image upload was <span style={{color:'blue'}}>{this.state.fileName}</span>.
                                        </p>
                                    </div>
                                    :
                                    null
                                }
                            </div>                              
                    }             
            </div>
        );
    }
}
export default OcrComponent;