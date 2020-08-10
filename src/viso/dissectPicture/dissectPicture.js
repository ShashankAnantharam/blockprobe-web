import React, { Component, Fragment } from 'react';
import Img from 'react-image';
import { Line } from 'react-lineto';
import './dissectPicture.css';
import { isNullOrUndefined } from 'util';
import { black } from 'color-name';
import SimpleCircleView from './circleSimple';

class DissectPictureView extends React.Component {

    constructor(props){
        super(props);
        //addBlock

        this.state ={
            showLines: false,
            lines: [
                {
                    x0:1/7,
                    y0:321/652,
                    x1:0.2,
                    y1:0.1
                },
                {
                    x0:443/570,
                    y0:447/570,
                    x1:0.8,
                    y1:0.95
                }
            ],
            pos:{
                first:null,
                second: null
            },
            addBlock: false
        }

        this.imgUrl = 'https://i.pinimg.com/564x/3d/22/ef/3d22ef2dc19d25469b0c4f75ce868118.jpg';

        this.renderLine = this.renderLine.bind(this);
        this.renderLines = this.renderLines.bind(this);
        this.mouseClick = this.mouseClick.bind(this);
        this.displayPositions = this.displayPositions.bind(this);
    }

    mouseClick(event) {
        let addBlock = this.state.addBlock;
        if(addBlock){
            let coord = {x:event.clientX, y:event.clientY};

            coord.x = coord.x - document.getElementById("testing").getBoundingClientRect().x
            + document.getElementById("testing").offsetLeft;
            coord.y = coord.y - document.getElementById("testing").getBoundingClientRect().y
            + document.getElementById("testing").offsetTop;
            let pos = this.state.pos;
            if(isNullOrUndefined(pos.first)){
                pos.first = coord;
            }
            else if(!isNullOrUndefined(pos.first) && isNullOrUndefined(pos.second)){
                pos.second = coord;
            }
            else{
                //Function to return value here
                pos.first = coord;
                pos.second = null;
            }
            this.setState({
                pos:pos
            });
        }
    }

    displayPositions(pos){

        return(
            <Fragment>
                {!isNullOrUndefined(pos.first)?
                    <Fragment>
                        {this.renderCircle(pos.first.x,pos.first.y)}
                    </Fragment>
                    :
                    null
                }
                {!isNullOrUndefined(pos.second)?
                    <Fragment>
                        {this.renderCircle(pos.second.x,pos.second.y)}
                        {this.renderLine(pos.first.x,pos.first.y,pos.second.x,pos.second.y)}
                    </Fragment>
                    :
                    null
                }
            </Fragment>
        )
    }

    componentDidMount(){ 
        document.getElementById("testing").addEventListener("click", this.mouseClick);
        this.setState({
            showLines: true
        })
    }

    renderLines(){
        let lines = this.state.lines;

        function onClick(){
            console.log("Here");
        }

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
            return (
                <Fragment>
                    {this.renderLine(f0[0],f0[1],f1[0],f1[1])}
                    {this.renderCircle(f1[0],f1[1],'trial',onClick)}
                </Fragment>
            )
        });
        return lineRender;
    }

    renderLine(x0,y0,x1,y1){
        return (
            <Line x0={x0} y0={y0} x1={x1} y1={y1} borderWidth="4px" 
            within="imageDissectContainer"
            borderColor="black"
            className="lineS"
            zIndex={1}
            onClick={() =>{console.log('here')}}
            />
        );
    }

    renderCircle(x,y,type, onClick){
        return (
            <SimpleCircleView
                id="circle1"
                type={type}
                x={x}
                y={y}
                onClick={onClick}
                />
        );
    }

    render(){

        return (
            <div style={{margin: '1em'}}>
                <div id="testing" className="imageDissectContainer">
                   <img className={"imageToDissect " + 
                   (this.state.addBlock?"imageToDissect_addBlock ":null)} src={this.imgUrl} />        
                    {this.state.showLines && !this.state.addBlock?
                        <Fragment>
                            {this.renderLines()}
                        </Fragment>
                        :
                        null
                    }
                    {this.state.showLines && this.state.addBlock?
                        <Fragment>
                            {this.displayPositions(this.state.pos)}
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