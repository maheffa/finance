import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import { App } from './containers/App/App';
import * as serviceWorker from './serviceWorker';
import '@coreui/coreui/dist/css/coreui.css';
import '@coreui/coreui/dist/js/coreui.js';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
