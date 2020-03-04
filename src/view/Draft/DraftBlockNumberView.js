import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done'
import Textarea from 'react-textarea-autosize';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Loader from 'react-loader-spinner';
import ImageUploader from 'react-images-upload';
import imageCompression from 'browser-image-compression';
import * as firebase from 'firebase';
import 'firebase/firestore';
import Img from 'react-image';
import './DraftBlockNumberView.css';
import { isNullOrUndefined } from 'util';

class DraftBlockNumberView extends React.Component {

    constructor(props){
        super(props);
        //isClicked, index, number
    }

    render(){
        return(
            <div>
                {this.props.number.key} {this.props.number.value}
            </div>
        )
    }
}
export default DraftBlockNumberView;