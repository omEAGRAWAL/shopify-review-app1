import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import { AppProvider } from '@shopify/polaris';
import '@shopify/polaris/build/esm/styles.css';
import App from './App';
import './App.css';

const LinkWrapper = ({ children, url, ...rest }) => {
    return (
        <Link to={url} {...rest}>
            {children}
        </Link>
    );
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <AppProvider linkComponent={LinkWrapper}>
                <App />
            </AppProvider>
        </Router>
    </React.StrictMode>
);
