import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

import './style.css';

// Keep template previews scannable even when no real table QR is supplied.
// The legacy /menu-preview URL also redirects here for old preview downloads.
const DEMO_QR_VALUE = 'https://rc-dine.in/#demo';

function QrTemplatePreview({
    template,
    cafeName = 'AURELIA CAFE',
    tableName = 'TABLE 08',
    qrValue = DEMO_QR_VALUE,
    selected = false,
    active,
    compact = false,
    onClick
}) {
    if (!template) return null;

    const handleKeyDown = (event) => {
        if (!onClick || !['Enter', ' '].includes(event.key)) return;
        event.preventDefault();
        onClick();
    };

    return (
        <div
            className={`qr-template-option${selected ? ' selected' : ''}${compact ? ' compact' : ''}`}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-pressed={onClick ? selected || Boolean(active) : undefined}
            onClick={onClick}
            onKeyDown={handleKeyDown}
        >
            <div
                className={`qr-template-card layout-${template.layout} pattern-${template.pattern}`}
                style={{
                    '--qr-start': template.background[0],
                    '--qr-end': template.background[1],
                    '--qr-foreground': template.foreground,
                    '--qr-accent': template.accent,
                    '--qr-muted': template.muted,
                    '--qr-panel': template.qrPanel
                }}
            >
                <span className="qr-template-shape shape-one" aria-hidden="true" />
                <span className="qr-template-shape shape-two" aria-hidden="true" />
                <div className="qr-template-brand">
                    <small>CAFE • KITCHEN</small>
                    <strong>{cafeName}</strong>
                    <span>{tableName}</span>
                </div>
                <div className="qr-template-code">
                    <QRCodeSVG value={qrValue} size={116} level="H" />
                </div>
                <div className="qr-template-copy">
                    <strong>SCAN. ORDER. ENJOY.</strong>
                    <span>Point your camera at the QR code</span>
                </div>
                <small className="qr-template-powered">Powered by RC DINE</small>
            </div>
            <div className="qr-template-meta">
                <div>
                    <strong>
                        {template.number} {template.name}
                    </strong>
                    <span>{template.mood}</span>
                </div>
                {typeof active === 'boolean' && (
                    <b className={active ? 'active' : ''}>{active ? 'Active' : 'Hidden'}</b>
                )}
            </div>
        </div>
    );
}

export default QrTemplatePreview;
