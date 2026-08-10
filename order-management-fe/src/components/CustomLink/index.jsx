import React from 'react';

function CustomLink({ text = '', onClick = () => {} }) {
    return (
        <span
            role="button"
            tabIndex={0}
            className="custom-label fw-bold"
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            {text}
        </span>
    );
}

export default CustomLink;
