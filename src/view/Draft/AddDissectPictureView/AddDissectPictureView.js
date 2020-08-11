import React, { Component } from 'react';
import DissectPictureView from '../../../viso/dissectPicture/dissectPicture';


class AddDissectPictureView extends React.Component {

    constructor(props){
        super(props);

    }

    render(){

        return (
            <div>
                <div>
                    <DissectPictureView
                    />
                </div>
                <div></div>
            </div>
        )
    }
}
export default AddDissectPictureView;