import React, {Component} from 'react';
import './App.css';
import Sneak from "./Components/Sneak";

class App extends Component {
    render() {
        return (
            <div className="App">
                <h1>Sneak game</h1>
                <Sneak/>
            </div>
        );
    }
}

export default App;
