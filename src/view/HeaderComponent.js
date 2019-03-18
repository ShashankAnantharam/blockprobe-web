import React, { Component } from 'react';
import MenuIcon from '@material-ui/icons/Menu';

class HeaderComponent extends React.Component {

    constructor(props){

        super(props);

        this.openMenuBar = this.openMenuBar.bind(this);
    }

    openMenuBar(){
        console.log("open");
    }

    render(){
        return(
            <div>
            <button onClick={() => { return this.openMenuBar()}}>
                    <MenuIcon/>
                </button>
            </div>
        );
    }

}
export default HeaderComponent;