import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import './assets/styles/modal.css';
import './assets/styles/menuCard.css';
import './assets/styles/formGroup.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import env from './config/env';
import reportWebVitals from './reportWebVitals';
import store from './store';

// Start waking the API while React loads. This never blocks the first paint,
// but reduces the wait for QR and login requests when the host was idle.
if (navigator.onLine && env.baseUrl) {
    window
        .fetch(`${String(env.baseUrl).replace(/\/$/, '')}/health`, {
            cache: 'no-store',
            credentials: 'omit'
        })
        .catch(() => {});
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
