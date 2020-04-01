import React from 'react';

import MyCreateNote from './MyCreateNote';
import MyNoteList from './MyNoteList';

class MyApp extends React.Component {

    constructor(props) {
        super(props);
        this.state = { show: true };
        this.onShowChanged = this.onShowChanged.bind(this);
    }

    onShowChanged() {

        this.setState({
            show: !this.state.show
        });
    }

    render() {
        return (
            <div>
                <MyCreateNote show={!this.state.show} onShowChanged={this.onShowChanged} name={this.state.name} />
                <MyNoteList show={this.state.show} />
            </div>
        );
    }
}


export default MyApp;