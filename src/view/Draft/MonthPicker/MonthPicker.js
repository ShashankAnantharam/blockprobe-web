import React, { Component } from 'react';
import Textarea from 'react-textarea-autosize';
import  MultiSelectReact  from 'multi-select-react';
import  * as Utils from '../../../common/utilSvc'; 
import './MonthPicker.css';

class MonthPicker extends React.Component {

    selectedOptionsStyles = {
        color: "white",
        backgroundColor: "rgb(117, 106, 214)",
        borderRadius:"20px",
        fontSize:'0.6em',
        padding:'5px'
    };
    optionsListStyles = {
        backgroundColor: "darkcyan",
        color: "white",

    };

    constructor(props) {
      //updateMonth,date
      super(props);
      this.state={
        monthList: [],
        newDate: JSON.parse(JSON.stringify(props.date))
      }
      this.monthClicked = this.monthClicked.bind(this);
      this.selectedMonthBadgeClicked = this.selectedMonthBadgeClicked.bind(this);
      this.validateMonth = this.validateMonth.bind(this);
      this.generateMonthList = this.generateMonthList.bind(this);
      this.handleChange = this.handleChange.bind(this);
    }

    validateMonth(monthList){
        let selectedMonth = -1;
        for(let i=0; i<monthList.length; i++){
            if(monthList[i].value == true)
            {
                selectedMonth = i;
                break;
            }
        }
        let newDate = this.state.newDate;
        if(selectedMonth == -1){
            let prevMonth  = newDate.month;
            selectedMonth = null;
        }
        newDate.month = selectedMonth;      
        this.setState({
            monthList: monthList,
            newDate: newDate
        });
        this.props.onChange(this.state.newDate);
    }

    handleChange(event, type) {

        var shouldUpdate = true;
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t'){
            shouldUpdate=false;
        }
        if((!Utils.validateNumber(event.target.value) || event.target.value.length > 8) && type=='year'){
            shouldUpdate = false;
        }

        if(shouldUpdate){
            if(type == 'year'){
                let date = this.state.newDate;
                date.year = Number(event.target.value);
                this.setState({
                    newDate:date
                });
                this.props.onChange(this.state.newDate);
            }
            
        }
      }

    generateMonthList(){
        let months = ['Jan','Feb','March','April','May','June','July','Aug','Sep','Oct','Nov','Dec'];
        let monthList = [];
        for(let i=0; i<12; i++){
            let value = false;
            if(this.props.date.month == i)
                value = true;
            monthList.push({
                id:i, value:value, label:months[i]   
            });
        }
        this.setState({
            monthList:monthList
        });
    }


    monthClicked(monthList) {
        this.validateMonth(monthList);
    }

    selectedMonthBadgeClicked(monthList) {
        this.validateMonth(monthList);
    }

    componentDidMount(){
        this.generateMonthList();
    }

    render() {
      return (
        <div style={{display: 'flex'}}>
            <div style={{marginRight:'20px', width:'150px'}}>
                <div className="monthPickerHeader">Month</div>
                <div style={{width:'80%'}}>
                    <MultiSelectReact 
                            options={this.state.monthList}
                            optionClicked={this.monthClicked.bind(this)}
                            selectedBadgeClicked={this.selectedMonthBadgeClicked.bind(this)}
                            selectedOptionsStyles={this.selectedOptionsStyles}
                            optionsListStyles={this.optionsListStyles} 
                            isTextWrap={false} 
                            isSingleSelect={true}
                            />
                </div>
            </div>
            <div>
                <div className="monthPickerHeader">Year</div>
                <div>
                    <form>
                        <label>
                            <Textarea 
                                type="number"
                                placeholder = "Year"
                                value={String(this.state.newDate.year)}
                                onChange={(e) => { this.handleChange(e,"year")}}
                                maxRows="12"
                                minRows="1"
                                style={{
                                    background: 'white',
                                    borderWidth:'2px', 
                                    borderStyle:'solid', 
                                    borderColor:'darkgrey',
                                    borderBottomWidth:'0px',
                                    paddingTop:'6px',
                                    paddingBottom:'6px',
                                    width:'200px'
                                    }}/>
                        </label>
                    </form>
                </div>
            </div>
        </div>
      );
    }
  }
  export default MonthPicker;
  