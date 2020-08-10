import React, { Component, Fragment } from 'react';
import Img from 'react-image';
import { Line } from 'react-lineto';
import './dissectPicture.css';
import { isNullOrUndefined } from 'util';

class DissectPictureView extends React.Component {

    constructor(props){
        super(props);

        this.state ={
            showLines: false
        }

        this.imgUrl = 'https://i.pinimg.com/564x/3d/22/ef/3d22ef2dc19d25469b0c4f75ce868118.jpg';

        this.renderLine = this.renderLine.bind(this);
        this.renderLines = this.renderLines.bind(this);
        this.mouseClick = this.mouseClick.bind(this);

    }

    mouseClick(event) {
        let rect = document.getElementById("testing").getBoundingClientRect();
        let coord = {x:event.clientX, y:event.clientY};
        console.log(rect);
        console.log(coord);
    }

    componentDidMount(){ 
        this.elem = document.getElementById("testing");         
        document.addEventListener("click", this.mouseClick);
        this.setState({
            showLines: true
        })
    }

    renderLines(){
        let lines = [
            {
                x0:0.2,
                y0:0.2,
                x1:0.5,
                y1:0.5
            }
        ];

        let lineRender = lines.map((line) => {
            let f0 = [
                document.getElementById("testing").getBoundingClientRect().x + 
                document.getElementById("testing").getBoundingClientRect().width*line.x0,
                document.getElementById("testing").getBoundingClientRect().y + 
                document.getElementById("testing").getBoundingClientRect().height*line.y0
            ];
            let f1 = [
                document.getElementById("testing").getBoundingClientRect().x + 
                document.getElementById("testing").getBoundingClientRect().width*line.x1,
                document.getElementById("testing").getBoundingClientRect().y + 
                document.getElementById("testing").getBoundingClientRect().height*line.y1
            ]
            return this.renderLine(f0[0],f0[1],f1[0],f1[1]);
        });
        return lineRender;
    }

    renderLine(x0,y0,x1,y1){
        return (
            <Line x0={x0} y0={y0} x1={x1} y1={y1} borderWidth="10px" 
            within="imageDissectContainer"
            borderColor="black"
            className="lineS"
            zIndex={1}
            onClick={() =>{console.log('here')}}
            />
        );
    }

    render(){

        return (
            <div style={{margin: '1em'}}>
                <div id="testing" className="imageDissectContainer">
                   <img className="imageToDissect" src={this.imgUrl} />    
                         
                    {this.state.showLines?
                        <Fragment>
                            {this.renderLines()}
                        </Fragment>
                        :
                        null
                    }                
                </div>
            </div>
        )
    }
}
export default DissectPictureView;