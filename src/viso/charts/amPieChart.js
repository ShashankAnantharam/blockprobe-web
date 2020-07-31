import React from 'react';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_forceDirected from "@amcharts/amcharts4/plugins/forceDirected"; 
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4plugins_bullets from "@amcharts/amcharts4/plugins/bullets";
import { isNullOrUndefined } from 'util';

let LIMIT = 4;

am4core.useTheme(am4themes_animated);

let dataT = [ {
    "country": "Lithuania",
    "litres": 501.9
    }, {
    "country": "Czech Republic",
    "litres": 301.9
    }, {
    "country": "Ireland",
    "litres": 201.1
    }, {
    "country": "Germany",
    "litres": 165.8
    }, {
    "country": "Australia",
    "litres": 139.9
    }, {
    "country": "US",
    "litres": 650.9
    }];

class AmPieChart extends React.Component {

    constructor(props){
      super(props);
      //id, category, value

      this.generatePieChart = this.generatePieChart.bind(this);
      this.getTotal = this.getTotal.bind(this);
      this.getShortenedNumber = this.getShortenedNumber.bind(this);
    }

    componentDidMount() {
        this.generatePieChart();
    }

    prepareData(data,category,value){
        let ans = [];
        let rest = 0;
        data.sort(function (a,b){
            if(a[value]<b[value]) return 1;
            return -1;
        });
        for(let i=0;data && i<data.length; i++){
            if(i<LIMIT || (i==LIMIT && data.length-1==LIMIT))
                ans.push(data[i]);
            else{
                if(data[i][value]){
                    rest += data[i][value];
                }
            }
        }
        if(rest){
            let newDataPoint = {};
            newDataPoint[category]="Rest";
            newDataPoint[value]=rest;
            ans.push(newDataPoint);
        }
        return ans;
    }

    getTotal(data,val){
        let total = 0;
        for(let i=0; data && i<data.length; i++){
            if(val in data[i])
                total = total + data[i][val];
        }
        return total;
    }

    getShortenedNumber(n){
        if(isNullOrUndefined(n))
            return "";
        let number = Number(n);
        if(n>1000000000000){
            let finalNum = number/1000000000000;
            finalNum = finalNum.toFixed(1);
            return String(finalNum)+" T";
        }
        if(n>1000000000){
            let finalNum = number/1000000000;
            finalNum = finalNum.toFixed(1);
            return String(finalNum)+" B";
        }
        if(n>1000000){
            let finalNum = number/1000000;
            finalNum =  finalNum.toFixed(1);
            return String(finalNum)+" M";
        }
        if(n>1000){
            let finalNum = number/1000;
            finalNum = finalNum.toFixed(1);
            return String(finalNum)+" K";
        }
        return String(number.toFixed(1));
    }

    generatePieChart(){
        let data = this.props.data;
        if(isNullOrUndefined(data))
            data=[];
        let total = this.getTotal(data, this.props.value);
        let totalStr = this.getShortenedNumber(total);

        // Create chart instance
        var chart = am4core.create(String(this.props.id), am4charts.PieChart);

        chart.legend = new am4charts.Legend();

        // Add data
        chart.data = this.prepareData(data,this.props.category,this.props.value);

        // Set inner radius
        chart.innerRadius = am4core.percent(50);

        // Add and configure Series
        var pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = this.props.value;
        pieSeries.dataFields.category = this.props.category;
        pieSeries.slices.template.stroke = am4core.color("#fff");
        pieSeries.slices.template.strokeWidth = 2;
        pieSeries.slices.template.strokeOpacity = 1;
        pieSeries.ticks.template.disabled = true;
        pieSeries.labels.template.disabled = true;
        pieSeries.legendSettings.labelText = "{category}: {value.percent.formatNumber('#.0')}%";
        pieSeries.tooltip.getFillFromObject = false;
        pieSeries.tooltip.background.fill = am4core.color("white");
        pieSeries.slices.template.tooltipText = "[black font-size:16px]{category}:[/] [black font-size:16px bold]{value}[/]";
        chart.legend.valueLabels.template.disabled = true;

        // This creates initial animation
        pieSeries.hiddenState.properties.opacity = 1;
        pieSeries.hiddenState.properties.endAngle = -90;
        pieSeries.hiddenState.properties.startAngle = -90;

        var label = chart.seriesContainer.createChild(am4core.Label);
        label.text = totalStr;
        label.horizontalCenter = "middle";
        label.verticalCenter = "middle";
        label.fontSize = 32;
        label.tooltip.getFillFromObject =  false;
        label.tooltip.background.fill = am4core.color("white");
        label.tooltipText = "[font-size:28px black] " + String(total.toFixed(2)) + "[/]";
    }

    render(){
        return (
            <div id={String(this.props.id)} style={{ width: "100%", height: "100%" }}>
            </div>
        )
    }
}
export default AmPieChart;