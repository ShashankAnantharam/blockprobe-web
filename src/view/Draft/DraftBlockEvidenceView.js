import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';
import DoneIcon from '@material-ui/icons/Done'
import Textarea from 'react-textarea-autosize';
import './DraftBlockEvidenceView.css';

class DraftBlockEvidenceView extends React.Component {

    constructor(props){
        super(props);
        //props: isClicked; updateEvidence; evidence: supportingDetails, evidenceLink;

        //console.log('Here');
        //console.log(this.props.evidence);
        this.state={
            isClicked: this.props.isClicked,
            newEvidence: this.props.evidence
        }

        this.getEvidenceViewOnly = this.getEvidenceViewOnly.bind(this);
        this.clickEvidenceNotInDraft = this.clickEvidenceNotInDraft.bind(this);
        this.getEvidenceDraft = this.getEvidenceDraft.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.removeEvidence = this.removeEvidence.bind(this);
        this.updateEvidence = this.updateEvidence.bind(this);
    }

    clickEvidenceNotInDraft(){
        this.setState({
            isClicked: true
        });
    }

    removeEvidence(){
        this.props.updateEvidence(this.props.evidence, null, false, true);
    }

    updateEvidence(){
        this.props.updateEvidence(this.props.evidence, this.state.newEvidence, true, false);
        this.setState({
            isClicked: false
        });
    }

    handleChange(event, type) {
        var shouldUpdate = true;
        var lastChar = event.target.value[event.target.value.length-1];
        if(lastChar=='\n' || lastChar=='\t'){
            shouldUpdate=false;
        }

        if(shouldUpdate){
            var evidence = this.state.newEvidence;
            if(type=="details"){
                evidence.supportingDetails = event.target.value;
                this.setState({newEvidence: evidence});
            }
            else if(type=="link"){
                evidence.evidenceLink = event.target.value;
                this.setState({newEvidence: evidence});
            }

        }
      }


    getEvidenceDraft(){
        return(
            <div>
            <form>
                <label>
                        <Textarea 
                        type="text"
                        placeholder="Paste link to evidence here."
                        value={this.state.newEvidence.evidenceLink}
                        onChange={(e) => { this.handleChange(e,"link")}}
                        maxRows="3"
                        minRows="2"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'darkgrey',
                            borderBottomWidth:'0px',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'60%'
                            }}/>
                        <Textarea 
                        type="text"
                        placeholder="Enter relevant details about evidence here."
                        value={this.state.newEvidence.supportingDetails}
                        onChange={(e) => { this.handleChange(e,"details")}}
                        maxRows="5"
                        minRows="3"
                        style={{
                            background: 'white',
                            borderWidth:'2px', 
                            borderStyle:'solid', 
                            borderColor:'darkgrey',
                            borderTopWidth:'0px',
                            paddingTop:'6px',
                            paddingBottom:'6px',
                            width:'60%'
                            }}/>    
                </label>
                </form>

                <div className='draft-evidence-button-container'>
                    <button
                    className="updateEvidenceButton"
                    onClick={this.updateEvidence}>
                        <DoneIcon/>
                    </button>
                    <button
                    className="removeEvidenceButton"
                    onClick={this.removeEvidence}>
                        <DeleteIcon/>
                    </button>
                </div>

            </div>
        );
    }

    getEvidenceViewOnly(){

        return(
            <ListItem button 
                    onClick={() => { this.clickEvidenceNotInDraft()}}
                    style={{width:'100%'}}
                    >
                    <ListItemText 
                    primary={this.props.evidence.evidenceLink} 
                    secondary={this.props.evidence.supportingDetails}/>
            </ListItem>        
        );
    }

    render(){
        return(
            <div>
                {this.state.isClicked?
                    this.getEvidenceDraft()
                    :
                    this.getEvidenceViewOnly()    
            }
            </div>
        )
    }

}
export default DraftBlockEvidenceView;