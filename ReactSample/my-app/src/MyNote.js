import React from 'react';



class MyNote extends React.Component {

    constructor(props) {
        super(props);

    }

    showDate() {
        return new Date(this.props.note.date).toLocaleString();
    }

    render() {

        return (
            <div id="note">

                <div class={ (this.props.note.isInUrl ? ' note-url ' : '')}>
                    {this.showDate(this.props.note)} </div>
                <a class="open-note-button btn animated fadeIn" href={this.props.note.url}
                    class={this.props.note.compressedFormat ? 'compressed-button' : 'uncompressed-button'}
                    data-ng-click="loadUrl(notes.url, $event)" ng-show="hoverEdit"
                    title="{{returnUrlTooltip(notes.url)}}">
                    <span class="glyphicon glyphicon-share-alt" aria-hidden="true"></span>
                </a>
                <span class="edit-note-button btn animated fadeIn" ng-show="hoverEdit"
                    ng-class="compressedFormat ? 'compressed-button' : 'uncompressed-button'"
                    data-ng-click="enableEdit ? nonEditable() : editable(); !enableEdit ? editNote(notes,$index) : focusOnEdit($index)"
                    title="{{enableEdit ? 'Save Note' : 'Edit Note'}}">
                    <span class="glyphicon"
                        ng-class="!enableEdit ? 'glyphicon-pencil' : 'glyphicon-save green-color'"
                        aria-hidden="true"></span>
                </span>
                <span class="delete-note-button btn animated fadeIn" ng-show="hoverEdit"
                    ng-class="compressedFormat ? 'compressed-button' : 'uncompressed-button'"
                    data-ng-click="deleteNote($index)" title="Delete Note">
                    <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                </span>
                <span class="delete-note-button btn animated fadeIn" ng-show="hoverEdit"
                    ng-class="compressedFormat ? 'compressed-button' : 'uncompressed-button'"
                    data-ng-click="notifyNote(notes)" title="Notify Note">
                    <span class="glyphicon glyphicon-envelope" ng-class="gAlarms[notes.id] ? 'red-button': ''"
                        aria-hidden="true"></span>
                </span>
                <div class="note-text"
                    data-ng-click="enableEdit ? nonEditable() : editable(); !enableEdit ? editNote($index) : focusOnEdit($index)"
                    contenteditable="{{enableEdit==undefined?false :enableEdit}}" id="{{'text'+$index}}"
                    ng-class="hoverEdit ? 'text-top-margin' : 'note-text'">{ this.props.note.noteText }</div>

            </div>

        );
    }
}


export default MyNote;