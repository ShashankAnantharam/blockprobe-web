import React, { Component } from 'react';
import ImageUploader from 'react-images-upload';
import Loader from 'react-loader-spinner';
import imageCompression from 'browser-image-compression';
import  "./OcrComponent.css";

var Tesseract = window.Tesseract;

class OcrComponent extends React.Component {

    constructor(props){
        super(props);
        //addText

        this.state={
            text: 'none',
            loadingText: false
        }

        this.onDrop = this.onDrop.bind(this);
    }

    async onDrop(picture){
 
        if(picture.length > 0)
        {
            let latestPicture = picture[picture.length-1];
            var options = {
                maxSizeMB: 1,
                useWebWorker: true
              }
            try {
                let compressedFile = await imageCompression(latestPicture, options);
                let url = URL.createObjectURL(compressedFile);

                this.setState({
                    loadingText: true
                });
                Tesseract.recognize(url,  {
                    lang: 'eng'
                  })
                  .catch(err => {
                    console.log(err);
                    this.setState({
                        loadingText: false
                    });
                  })
                  .then(result => {

                    // Get Confidence score
                    let confidence = result.confidence

                    // Get full output
                    let text = result.text
                    
                    this.props.addText(text);
                    this.setState({
                        loadingText: false
                    });
                });
                  
            } catch (error) {
                console.log(error);
            }
        }
    }

    render(){
        return (
            <div>
                  <ImageUploader
                        withIcon={true}
                        buttonText='Choose image'
                        onChange={this.onDrop}
                        singleImage={true}
                        imgExtension={['.jpg', '.gif', '.png', '.gif']}
                        maxFileSize={5242880}
                        />  
                    {this.state.loadingText?
                            <div style={{margin:'auto',width:'50px'}}>
                                <Loader 
                                type="TailSpin"
                                color="#00BFFF"
                                height="50"	
                                width="50"
                                /> 
                            </div>
                            :
                            null
                    }             
            </div>
        );
    }
}
export default OcrComponent;