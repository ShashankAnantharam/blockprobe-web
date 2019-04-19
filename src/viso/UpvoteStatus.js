import React, { Component } from 'react';
import ThumbUpIcon from '@material-ui/icons/ThumbUp'; 
import './UpvoteStatus.css';

class UpvoteStatusComponent extends React.Component {

    constructor(props){
        super(props);
        //reviewersMap, bpDetails

    

    }



    render(){

        const scope = this;
        var upVotes = 0;
        var total = this.props.bpDetails.criterion;
        
        Object.keys(this.props.reviewersMap).map((reviewerId)=> {
            if(this.props.reviewersMap[reviewerId]=="1"){
                upVotes++;
            }
        });

        return(
            <div className="upvote-span">
                <ThumbUpIcon className="upvoteIcon"/>
                {upVotes} ({total - upVotes > 0 ? total - upVotes : 0} needed)  
            </div>
        );
    }

}
export default UpvoteStatusComponent;