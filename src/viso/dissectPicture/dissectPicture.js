import React, { Component } from 'react';
import Img from 'react-image';
import { Line } from 'react-lineto';
import './dissectPicture.css';

class DissectPictureView extends React.Component {

    constructor(props){
        super(props);

        this.imgUrl = 'https://i.pinimg.com/564x/3d/22/ef/3d22ef2dc19d25469b0c4f75ce868118.jpg';

        this.renderLine = this.renderLine.bind(this);
    }


    mouseClick(event) {
        let elem = document.getElementById("testing");
        let rect = elem.getBoundingClientRect();
        let coord = {x:event.clientX, y:event.clientY};
        console.log(rect);
        console.log(coord);
    }

    componentDidMount(){          
        document.addEventListener("click", this.mouseClick);
    }

    renderLine(x0,y0,x1,y1){
        return (
            <Line x0={x0} y0={y0} x1={x1} y1={y1} />
        );
    }

    render(){

        return (
            <div style={{margin: '1em'}}>
                <div id="testing" className="imageContainer">
                    <img className="imageToDissect" src={this.imgUrl} />    
                    
                </div>
            </div>
        )
    }
}
export default DissectPictureView;