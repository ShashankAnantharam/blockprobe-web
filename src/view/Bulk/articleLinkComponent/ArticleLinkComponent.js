import React, { Component } from 'react';
import Loader from 'react-loader-spinner';
import Textarea from 'react-textarea-autosize';
import  "./ArticleLinkComponent.css";

class ArticleLinkComponent extends React.Component {

    constructor(props){
        super(props);
        //addText

        this.state={
            url: '',
            loadingText: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.isValidLink = this.isValidLink.bind(this);
        this.getArticleText = this.getArticleText.bind(this);
    }

    async getArticleText(){
        this.setState({
            loadingText: true
        });

        try{
            let url = this.state.url;

            this.setState({
                loadingText: false
            });
        }
        catch{
            this.setState({
                loadingText: false
            });
        }
        finally{
            this.props.closeComponent();
        }

    }

    handleChange(event, type) {

        var shouldUpdate = true;
      
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t')
            shouldUpdate=false;

        if(shouldUpdate){
            let url = this.state.url;
            if(type=="url"){
                    url = event.target.value;                    
                    this.setState({url: url});
                }
            }       
    }

    isValidLink(){
        if(this.state.url.trim() == '')
            return false;
        return true;
    }

    render(){
        return (
            <div style={{}}>               
                <form className="articleLinkForm">
                    <label>
                    <Textarea 
                        type="text"
                        placeholder="Paste link to article here."
                        value={this.state.url}
                        onChange={(e) => { this.handleChange(e,"url")}}
                        maxRows="3"
                        minRows="2"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'darkgrey',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'90%'
                            }}/>                            
                    </label>
                </form>
                {this.isValidLink()?
                    <button
                    className="submitArticleLinkButton"
                    onClick={this.getArticleText}>
                        <div>Get Text</div>
                    </button>                    
                :
                    null
                }
            </div>
        );
    }
}
export default ArticleLinkComponent;