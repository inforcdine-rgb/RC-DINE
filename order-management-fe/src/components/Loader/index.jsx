import React from 'react';
import '../../assets/styles/loader.css';

const Loader = ({ label = 'Preparing your experience...', overlay = true }) => {
    return (
        <div
            className={`loader-overlay${overlay ? '' : ' loader-overlay-inline'}`}
            role="status"
            aria-live="polite"
            aria-label={label}
        >
            <div className="rc-loader-stage">
                <div className="rc-loader-visual" aria-hidden="true">
                    <span className="rc-loader-orbit rc-loader-orbit-outer">
                        <i />
                    </span>
                    <span className="rc-loader-orbit rc-loader-orbit-inner">
                        <i />
                    </span>
                    <span className="rc-loader-logo">R</span>
                    <span className="rc-loader-pulse" />
                </div>
                <div className="rc-loader-copy">
                    <strong>RC Dine</strong>
                    <span>{label}</span>
                </div>
                <div className="rc-loader-progress" aria-hidden="true">
                    <span />
                </div>
                <div className="rc-loader-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                </div>
            </div>
        </div>
    );
};

export default Loader;
