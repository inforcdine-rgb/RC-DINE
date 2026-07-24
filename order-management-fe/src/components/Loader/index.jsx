import React from 'react';
import '../../assets/styles/loader.css';

const Loader = () => {
    return (
        <div className="loader-overlay" role="status" aria-label="Loading content">
            <div className="premium-skeleton">
                <div className="skeleton-head"><span /><div><b /><small /></div></div>
                {[0, 1, 2].map((item) => (
                    <div className="skeleton-card" key={item}>
                        <span />
                        <div><b /><small /><small /></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Loader;
