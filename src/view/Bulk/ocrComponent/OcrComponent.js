import React, { Component } from 'react';
import ImageUploader from 'react-images-upload';
import  "./OcrComponent.css";

class OcrComponent extends React.Component {


    constructor(props){
        super(props);

        this.state={
            text: 'none'
        }

        this.onDrop = this.onDrop.bind(this);
    }

    async onDrop(picture){
        if(picture.length > 0)
        {
            let latestPicture = picture[picture.length-1];

              try {
                
              } catch (error) {

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
                <div>
                    {this.state.text}
                </div>
            </div>
        );
    }
}
export default OcrComponent;