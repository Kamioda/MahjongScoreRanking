import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import IndexItem from './main/index.js';


const App = () => {
    return (
        <Router>
            <Switch>
                <Route extract path="/:language/" Component={IndexItem}></Route>
            </Switch>
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById('content'));
root.render(<React.StrictMode><App /></React.StrictMode>)