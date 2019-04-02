import React, { Component } from 'react';


class UserSession extends React.Component {

    constructor(props){
        super(props);
        this.state={
            isUserLoggedIn: false,
            userId: ''
        }
    }

    render(){
        return (
            <div>
                User Session
            </div>
        );
    }


}
export default UserSession;