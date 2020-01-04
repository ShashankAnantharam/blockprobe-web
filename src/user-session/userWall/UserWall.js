import React, { Component } from 'react';
import './UserWall.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class UserWall extends React.Component {
    constructor(props) {
      super(props);
      //posts

      this.renderSinglePost = this.renderSinglePost.bind(this);
    }

    renderSinglePost(post, scope){

        let link = '';
        if(post && post.bp){
            link = "https://blprobe.com/view/" + post.bp + "/tabs";
        }
        return (
            <div>
                <h5 className="wallPostTitle">{post.title}</h5>
                <iframe src={link} className="wallPostViso"></iframe>
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