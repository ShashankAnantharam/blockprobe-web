import React, { Component } from 'react';
import './UserWall.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Expand from 'react-expand-animated';
import { version } from 'punycode';

class UserWall extends React.Component {
    constructor(props) {
      super(props);
      //posts

      this.state = {
          visualizedBps: {},
          isEditSummary: false
      }

      this.renderSinglePost = this.renderSinglePost.bind(this);
      this.clickOnVisualizeButton = this.clickOnVisualizeButton.bind(this);
      this.clickOnEdit = this.clickOnEdit.bind(this);
    }

    clickOnVisualizeButton(bp, val){
        let visMap = this.state.visualizedBps;
        visMap[bp] = val;
        this.setState({
            visualizedBps: visMap
        });
    }

    clickOnEdit(type, value){
        if(type == 'summary'){
            this.setState({
                isEditSummary: value
            });
        }
    }

    renderSinglePost(post, scope){

        const transitions = ["height", "opacity", "background"];
        let link = '';
        if(post && post.bp){
            link = "https://blprobe.com/view/" + post.bp + "/tabs";
        }
        return (
            <div className="wallPostContainer">
                <h5 className="wallPostTitle">{post.title}</h5>
                {this.state.isEditSummary && this.props.isPrivate?
                    <div style={{display: 'flex'}}>
                        <button className="summaryChangeWallbutton" 
                                onClick = {(e) => this.clickOnEdit('summary', false)}>
                            Cancel
                        </button>
                    </div>
                    :
                    null
                }
                {!this.state.isEditSummary && this.props.isPrivate?
                    <div>
                        {post.summary && post.summary.length > 0? 
                            <p className="wallPostSummary">{post.summary}</p>
                            :
                            <div style={{display: 'flex'}}>
                                <p className="wallPostSummaryPrompt">Add a summary!</p>
                                <button className="summaryChangeWallbutton" 
                                onClick = {(e) => this.clickOnEdit('summary', true)}>
                                    Edit summary
                                </button>
                            </div>
                            }
                    </div>
                    :
                    null
                }

                {!this.props.isPrivate && post.summary && post.summary.length > 0?
                    <p className="wallPostSummary">{post.summary}</p>
                    :
                    null
                }

                <div className="wallPostBody">                           
                    {
                        this.state.visualizedBps[post.bp]?
                        <div className="wallShowViso">
                            <div>
                                <button className="visualizeWallBpButton" 
                                onClick = {(e) => this.clickOnVisualizeButton(post.bp, false)}>
                                    Close
                                </button>
                            </div>
                        </div>                  
                        :
                        <div className="wallHideViso">
                            <button className="visualizeWallBpButton" 
                            onClick = {(e) => this.clickOnVisualizeButton(post.bp, true)}>
                                Visualize
                            </button>
                        </div>
                    }
                        <Expand 
                                open={this.state.visualizedBps[post.bp]}
                                duration={400}
                                transitions={transitions}>
                                <div className="wallPostVisoContainer">
                                    {this.state.visualizedBps[post.bp]?
                                        <iframe src={link} className="wallPostViso"></iframe>
                                            :
                                            null
                                    }                                    
                                </div>                         
                        </Expand>
                </div>
                 
            </div>
        )
    }

    render() {
        let scope = this;
        const postsRender = this.props.posts.map((post) => 
                    (scope.renderSinglePost(post, scope)));
        return (
          <div>
              {postsRender}
          </div>
        );
      }
}
export default UserWall;