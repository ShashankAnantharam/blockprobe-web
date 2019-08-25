import React, { Component } from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected"; 
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

class AmGraph extends React.Component {

    constructor(props){
      super(props);
      //graph
      
      this.generateAmForceDirectedGraph = this.generateAmForceDirectedGraph.bind(this);
      this.prepareData = this.prepareData.bind(this);
      this.chart = {};

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
            newData.push(newEntry);
        }

        return newData;
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

        // Add labels
        series.nodes.template.label.text = "{name}";
        series.nodes.template.label.valign = "bottom";
        series.nodes.template.label.fill = am4core.color("#000");
        series.nodes.template.label.dy = 10;
        series.nodes.template.tooltipText = "{name}";
        series.fontSize = 10;
        series.minRadius = 30;
        series.maxRadius = 30;
        series.nodes.template.label.propertyFields.disabled = 'circleDisabled';

         // Configure circles
         series.nodes.template.circle.propertyFields.disabled = 'circleDisabled';
         series.nodes.template.outerCircle.propertyFields.disabled = 'circleDisabled';

        // Configure icons
       var icon = series.nodes.template.createChild(am4core.Image);
        icon.propertyFields.href = "image";
        icon.horizontalCenter = "middle";
        icon.verticalCenter = "middle";
        icon.width = 60;
        icon.height = 60;
        

        series.centerStrength = 0.5;
        this.chart =  chart;
    }


    componentDidMount() {
      this.generateAmForceDirectedGraph();
    }

    componentDidUpdate(){
        this.generateAmForceDirectedGraph();
    }

    render(){
        return(
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}
export default AmGraph;