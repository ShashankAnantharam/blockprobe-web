import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected"; 
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import * as Const from '../../common/constants';
import { isNullOrUndefined } from 'util';

am4core.useTheme(am4themes_animated);

class GamifiedGraph extends React.Component {

    constructor(props){
      super(props);
      //graph, selectedNodes
      
      this.generateAmForceDirectedGraph = this.generateAmForceDirectedGraph.bind(this);
      this.prepareData = this.prepareData.bind(this);
      this.chart = {};
      this.selectedEdges={};
      this.selectedLink = null;
      this.prevNode = null;
      this.prevLinksWith = null;

      this.previousChart = JSON.parse(JSON.stringify(props.graph));

      this.getDesiredLink = this.getDesiredLink.bind(this);
      this.hasEdgeBeenSelected = this.hasEdgeBeenSelected.bind(this);
    }

    prepareData(data){
        var newData = [];

        for(var i=0; data && i<data.length; i++){
            var newEntry = JSON.parse(JSON.stringify(data[i]));
            if(newEntry.image && newEntry.image.length>0){
                newEntry.imageDisabled = false;
                newEntry.circleDisabled = true;
            }
            else{
                newEntry.imageDisabled = true;
                newEntry.circleDisabled = false;
            }

            newEntry.color = am4core.color(Const.edenColors[(i%(Const.edenColors.length))]);
            if(newEntry.label == 'ALL'){
                newEntry.isNotAll = false;
                newEntry.imageDisabled = true;
                newEntry.circleDisabled = true;
            }
            else{
                newEntry.isNotAll = true;
            }          

            if(!(newEntry.label == 'ALL'))
                newData.push(newEntry);
        }
        // console.log(newData);

        return newData;
    }

    getDesiredLink(linksWithList, nodeA, nodeB){
        for(let i=0; !isNullOrUndefined(linksWithList) && i<linksWithList.length; i++){
            let linkList = linksWithList[i];
            if(!isNullOrUndefined(linkList)){
                for(let key in linkList){
                    let link = linkList[key];
                    let source = link.source.label.currentText; 
                    let target = link.target.label.currentText;
                    if(source != target && ((source==nodeA && target == nodeB) || (source==nodeB && target == nodeA))){
                        return link;
                    }
                }
            }
        }
        return null;
    }

    hasEdgeBeenSelected(nodeA, nodeB){
        if(isNullOrUndefined(nodeA) || isNullOrUndefined(nodeB))
            return;

        if((String(nodeA + '_CCC_' + nodeB) in this.selectedEdges) || (String(nodeB + '_CCC_' + nodeA) in this.selectedEdges))
            return true;
        return false;
    }

    addSelectedEdgeToMap(nodeA, nodeB){
        this.selectedEdges[String(nodeA + '_CCC_' + nodeB)] = true;
    }

    generateAmForceDirectedGraph(){
        // Create chart
        var chart = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);

        // Create series
        var series = chart.series.push(new am4plugins_forceDirected.ForceDirectedSeries());


       //console.log(graph);
        series.data = this.prepareData(this.props.graph);
 
        // Set up data fields
        series.dataFields.value = "value";
        series.dataFields.name = "label";
        series.dataFields.id = "id";
        series.dataFields.children = "children";
        series.dataFields.linkWith = "link";
        series.dataFields.color = "color";

        // Add labels
        series.nodes.template.label.text = "{name}";
        series.nodes.template.tooltipText = "{name}";
        series.nodes.template.id = "{id}";

      //  /*
        series.nodes.template.label.valign = "bottom";
        series.nodes.template.label.fill = am4core.color("#000");
        series.nodes.template.label.dy = -30;
      //  */
        /*
        series.nodes.template.label.hideOversized = true;
        series.nodes.template.label.truncate = true;
        */

        series.fontSize = 13;
        series.minRadius = 10;
        series.maxRadius = 10;
        series.propertyFields.fill = "color";
        series.nodes.template.label.propertyFields.hidden = 'circleDisabled';
        series.nodes.template.togglable = false;
        
         // Configure circles
         series.nodes.template.circle.propertyFields.disabled = 'circleDisabled';
         series.nodes.template.outerCircle.propertyFields.disabled = 'circleDisabled';

        // Configure icons
        var icon = series.nodes.template.createChild(am4plugins_bullets.PinBullet);
        icon.image = new am4core.Image();
        icon.image.propertyFields.href = "image";
        icon.circle.radius = 25;
        icon.circle.strokeWidth = 0;        
        icon.background.pointerLength = 0;
        icon.background.disabled = true;

        if(window.innerWidth > 600){
            icon.background.radius = 35;
            icon.circle.radius = 35;
        }
        
        var outlineCircle = icon.createChild(am4core.Circle);
        outlineCircle.propertyFields.fill = "color";
        outlineCircle.adapter.add("radius", function (radius, target) {
            var circleBullet = target.parent;
            return circleBullet.circle.radius + 2;
        });
        outlineCircle.propertyFields.disabled = 'imageDisabled';        

        // Configure All node icon
        var allNode = series.nodes.template.createChild(am4core.Rectangle3D);
        allNode.width = 35;
        allNode.height = 15;
        allNode.depth = 35;
        allNode.angle = 45;
        allNode.strokeOpacity = 1;
        allNode.strokeWidth = 1.25;
        allNode.stroke = am4core.color('black');
        allNode.fillOpacity = 0.85;
        allNode.fill = am4core.color('rgb(240,240,240)');
        allNode.propertyFields.disabled = 'isNotAll';          

        series.centerStrength = 0.55;
        series.manyBodyStrength = -38;
        series.links.template.strength = 0.5;
        series.links.template.strokeWidth = 0;

        var scope = this;

        series.links.template.interactionsEnabled = true;        
        series.links.template.clickable = true;
        series.links.template.distance = 8.5;
        series.links.template.events.on("hit", function (event) {                
            var link = event.target;  
            if(!scope.hasEdgeBeenSelected(link.source.label.currentText, link.target.label.currentText))
                return;
            link.strokeWidth = 9;        
            if(scope.selectedLink)
                scope.selectedLink.strokeWidth = 5;          
            scope.selectedLink = link;
            scope.props.selectEdge(link.source.label.currentText, link.target.label.currentText);            
        });

        

        series.nodes.template.events.on("hit", function (event) {
            if(scope.props.disabled){
                return;
            }

            if(scope.selectedLink)
                scope.selectedLink.strokeWidth = 5;
            let prevNode = scope.props.selectedNodes['f'];
            let currNode = scope.props.selectedNodes['s'];
            var node = event.target;
            if(currNode != null){
                //Something already  was selected. Clear the whole thing
                scope.props.setNodeVal('s',null);
                scope.props.setNodeVal('f',null);
                prevNode = null;
                currNode = null;
            }                
            let isEdgeSelected = false;
            if(!isNullOrUndefined(prevNode) && !isNullOrUndefined(prevNode.label))
                isEdgeSelected = scope.hasEdgeBeenSelected(node.label.currentText, prevNode.label.currentText);
            if(!isNullOrUndefined(prevNode) && !isEdgeSelected && prevNode != node){
                let linksWith = node.linksWith;
                if(!isNullOrUndefined(linksWith))
                    linksWith = linksWith._dictionary;
                else
                    linksWith = {};

                // console.log(linksWith); 
                // console.log(scope.prevLinksWith);  
                
                let link = scope.getDesiredLink([linksWith,scope.prevLinksWith], node.label.currentText, prevNode.label.currentText);
                // console.log(link);
                if(!isNullOrUndefined(link)){
                    link.strokeWidth = 5;
                    if(!isNullOrUndefined(prevNode) && !isNullOrUndefined(prevNode.label))
                        scope.addSelectedEdgeToMap(node.label.currentText, prevNode.label.currentText);
                    scope.props.selectEdge(link.source.label.currentText, link.target.label.currentText);
                    scope.props.setGameMessage('successLink');
                }
                else{
                    //Wrong link
                    scope.props.setGameMessage('failLink');
                    scope.props.setEntityStats(node.label.currentText,false);
                    scope.props.setEntityStats(prevNode.label.currentText,false);
                }
                scope.props.setNodeVal('s',node);
                //prevNode = null;
                scope.prevLinksWith = null;
            }
            else{
                if(prevNode == node){
                    //Tell user to pick another node!
                }
                                
                if(isEdgeSelected){
                    //Tell user that edge has already been made!
                    scope.props.setGameMessage('alreadySelected');
                    scope.props.setNodeVal('s',node);
                }
                else{
                    scope.props.setNodeVal('f',node);
                    scope.props.playNodeSound(node.label.currentText);
                }
                
                if(!isNullOrUndefined(node.linksWith))
                    scope.prevLinksWith = node.linksWith._dictionary;
                else
                    scope.prevLinksWith = {}; 
            }
        });

        this.chart =  chart;
    }


    componentDidMount() {
      this.generateAmForceDirectedGraph();
    }

    componentDidUpdate(){
        if(JSON.stringify(this.previousChart) != JSON.stringify(this.props.graph)){
            this.generateAmForceDirectedGraph();
            this.previousChart = JSON.parse(JSON.stringify(this.props.graph));
        }
    }

    render(){
        return(
            <div id="chartdiv" style={{ width: "100%", height: "100%" }}></div>
        );
    }
}
export default GamifiedGraph;