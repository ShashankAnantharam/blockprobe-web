import React, { Component } from 'react';
import * as firebase from 'firebase';
import { ChatFeed, ChatBubble, BubbleGroup, Message } from 'react-chat-ui';
import './ChatBox.css';

const styles = {
    button: {
      backgroundColor: '#fff',
      borderColor: '#1D2129',
      borderStyle: 'solid',
      borderRadius: 20,
      borderWidth: 2,
      color: '#1D2129',
      fontSize: 18,
      fontWeight: '300',
      paddingTop: 8,
      paddingBottom: 8,
      paddingLeft: 16,
      paddingRight: 16,
    },
    selected: {
      color: '#fff',
      backgroundColor: '#0084FF',
      borderColor: '#0084FF',
    },
  };
  
  const users = {
    0: 'You',
    Mark: 'Mark',
    2: 'Evan',
  };

  const customBubble = props => (
    <div>
      <p>{`${props.message.senderName} ${props.message.id ? 'says' : 'said'}: ${
        props.message.message
      }`}</p>
    </div>
  );
  
class ChatBox extends React.Component {

    constructor(props){
        super(props);

        this.state={
            messages: [
                new Message({
                  id: 1,
                  message: "I'm the recipient! (The person you're talking to)",
                }), // Gray bubble
                new Message({ id: 0, message: "I'm you -- the blue bubble!" }), // Blue bubble
              ],
              useCustomBubble: false,
              curr_user: 0 
        }
    }


    onPress(user) {
        this.setState({ curr_user: user });
      }
    
      onMessageSubmit(e) {
        const input = this.message;
        e.preventDefault();
        if (!input.value) {
          return false;
        }
        this.pushMessage(this.state.curr_user, input.value);
        input.value = '';
        return true;
      }
    
      pushMessage(recipient, message) {
        const prevState = this.state;
        const newMessage = new Message({
          id: recipient,
          message,
          senderName: users[recipient],
        });
        prevState.messages.push(newMessage);
        this.setState(this.state);
      }


    render(){
        return(
            <div className="chat-box-container">
                <ChatFeed
                  chatBubble={this.state.useCustomBubble && customBubble}
                  maxHeight={250}
                  messages={this.state.messages} // Boolean: list of message objects
                  showSenderName
                />

                <form onSubmit={e => this.onMessageSubmit(e)}>
                    <input
                    ref={m => {
                        this.message = m;
                    }}
                    placeholder="Type a message..."
                    className="message-input"
                    style={{width:'99%', height:'30px'}}
                    />
                </form>
                </div>
        );
    }
}
export default ChatBox;