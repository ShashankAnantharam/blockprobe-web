import React, { Component } from 'react';
import ContentEditable from 'react-contenteditable';
import  * as Utils from '../../../common/utilSvc';
import  "./BulkBlockEditable.css";

class BulkBlockEditable extends React.Component {

    constructor(props){
        super(props);
        //value, onChange

        this.state = {
            html: ''
        }

        this.htmlToText = require('html-to-text');

        this.handleChange = this.handleChange.bind(this);    
        this.unmakeHtml = this.unmakeHtml.bind(this);
        this.formatHtml = this.formatHtml.bind(this);
    }

    handleChange(e){
        let htmlStr = String(e.target.value);
        console.log(htmlStr);
        console.log(this.unmakeHtml(htmlStr));
        let newHtml = this.formatHtml(htmlStr);

        this.setState({
            html: newHtml
        });
/*        let text = e.currentTarget.textContent;
        let event = {
            target: {
                value: text
            }
        };
        this.props.onChange(event);
        */
    }

    unmakeHtml(html){
        // replace br with \n

        let ans = html;
        ans = ans.replace(/<div/g,'<br><div');
        ans = this.htmlToText.fromString(ans);
        return ans;
    }

    formatHtml(html){
        let ans = '';
        for(let i=0; i<html.length; i++){
            if(html[i]=='#'){
                ans += `<span style="color: green">`;
                while(i<html.length && (html[i]=='#' || Utils.isCharacterNumeric(html[i]) || Utils.isCharacterAlphabet(html[i])))
                {
                    ans += html[i];
                    i++;
                }
                ans += `</span>`;
                i--;

            }
            else{
                ans+=html[i];
            }
        }
        return ans;
    }

    render(){
        return (
            <div>
                <ContentEditable
                    className="editableBulkDiv"
                    html={this.state.html} // innerHTML of the editable div
                    disabled={false}       // use true to disable editing
                    onChange={this.handleChange} // handle innerHTML change
                    />
            </div>
        );
    }
}
export default BulkBlockEditable;

/*
<div
                    className="editableBulkDiv"
                    contentEditable='true'
                    onInput={e => this.handleChange(e)}>
                    {this.props.value}
                    </div>
                    */