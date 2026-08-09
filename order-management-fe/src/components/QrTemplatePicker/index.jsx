import React from 'react';

import QrTemplatePreview from '../QrTemplatePreview';

import './style.css';

function QrTemplatePicker({
    templates,
    selectedId,
    cafeName,
    tableName,
    qrValue,
    downloading,
    onSelect,
    onClose,
    onDownload
}) {
    const selectedTemplate = templates.find((template) => template.id === selectedId) || templates[0];

    return (
        <div className="qr-picker-backdrop" role="presentation" onMouseDown={onClose}>
            <section
                className="qr-picker-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="qr-picker-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <header className="qr-picker-head">
                    <div>
                        <span>PRINT-READY A5 • HIGH QUALITY PNG</span>
                        <h2 id="qr-picker-title">Choose a QR Template</h2>
                        <p>{tableName} ke liye design select karke download karein.</p>
                    </div>
                    <button type="button" aria-label="Close template picker" onClick={onClose}>
                        ×
                    </button>
                </header>

                <div className="qr-picker-gallery">
                    {templates.map((template) => (
                        <QrTemplatePreview
                            key={template.id}
                            template={template}
                            cafeName={cafeName}
                            tableName={tableName}
                            qrValue={qrValue}
                            selected={template.id === selectedTemplate?.id}
                            onClick={() => onSelect(template.id)}
                        />
                    ))}
                </div>

                <footer className="qr-picker-footer">
                    <div>
                        <small>SELECTED DESIGN</small>
                        <strong>{selectedTemplate?.name || 'QR Template'}</strong>
                    </div>
                    <div className="qr-picker-footer-actions">
                        <button type="button" className="cancel" onClick={onClose} disabled={downloading}>
                            Cancel
                        </button>
                        <button type="button" className="download" onClick={onDownload} disabled={downloading}>
                            {downloading ? 'Preparing PNG...' : 'Download Selected Template'}
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
}

export default QrTemplatePicker;
