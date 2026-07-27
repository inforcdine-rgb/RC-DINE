import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { setPageSeo } from '../../utils/seo';
import './style.css';

function NotFound() {
    useEffect(() => {
        setPageSeo({
            title: 'Page Not Found – RC Dine',
            description: 'The requested RC Dine page could not be found.'
        });
    }, []);

    return (
        <main className="rc-not-found">
            <span>404</span>
            <h1>Page not found</h1>
            <p>The page may have moved or the address may be incorrect.</p>
            <div className="rc-not-found-actions">
                <Link to="/">Back to Home</Link>
                <Link to="/login" className="secondary">
                    Owner Login
                </Link>
                <Link to="/contact" className="secondary">
                    Contact Support
                </Link>
            </div>
        </main>
    );
}
export default NotFound;
