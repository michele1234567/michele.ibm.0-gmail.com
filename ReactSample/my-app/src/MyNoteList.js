import React from 'react';

import MyNote from './MyNote';
import MyNoteService from './MyNoteService';

class MyNoteList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        let notesList = MyNoteService.getNotes();
        return (
            <div id="all-notes-container" class={this.props.show ? '': 'display-nothing'}>
                {
                    notesList.map(note => {
                        return <MyNote note={note} />
                    })
                }
            </div>
        );
    }
}


export default MyNoteList;