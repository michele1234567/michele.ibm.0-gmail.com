/*jshint -W119 */
/*jshint -W104 */

import React from 'react';



class MyCreateNote extends React.Component {

    constructor(props) {
        super(props);
        this.viewAll = this.viewAll.bind(this);
        this.cancel = this.cancel.bind(this);
        this.viewCreateNote = this.viewCreateNote.bind(this);
        this.state = { show: this.props.show };
    }

    viewAll() {
        this.props.onShowChanged(this.props.show);
    }

    cancel() {
        this.props.onShowChanged(this.props.show);
    }

    viewCreateNote() {
        this.props.onShowChanged(this.props.show);
    }

    render() {
        return (
            <span id="new-note">
                <div id="note-div" class={this.props.show ? '' : 'display-nothing'}>
                    <div contentEditable="true" id="note-area"></div>
                    <div id="buttons">
                        <span id="all-button" class="view-all-homepage-button btn animated fadeInLeft" onClick={this.viewAll}
                            title="Show List of All Notes">View All</span>
                        <span id="cancel-button" class="cancel-button-homepage btn animated zoomIn" onClick={this.cancel}
                            title="Delete Note and Exit">Cancel</span>
                        <span id="save-button" class="save-button-homepage btn animated fadeInRight"
                            data-ng-click="noteIsSavable() ? saveNote() : null" ng-class="{'not-selectable': !noteIsSavable()}"
                            ng-mouseover="noteIsSavable()" title="Save Note and Url">Save</span>
                    </div>
                </div>
                <span class="animated fadeIn clickable-logo" onClick={this.viewCreateNote}
                    title="Take a new note">
                    <span class="q-logo">Q</span><span class="logo-text">uik</span><span class="n-logo">N</span><span
                        class='logo-text'>ote</span>
                </span>
            </span>
        );
    }
}


export default MyCreateNote;