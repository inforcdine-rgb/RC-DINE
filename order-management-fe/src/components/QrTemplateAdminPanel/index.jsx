import React, { useMemo } from 'react';

import { QR_TEMPLATES } from '../../utils/qrTemplates';
import QrTemplatePreview from '../QrTemplatePreview';

import './style.css';

function QrTemplateAdminPanel({ activeIds, onChange, onSave, saving }) {
    const activeSet = useMemo(() => new Set(activeIds), [activeIds]);

    const toggleTemplate = (templateId) => {
        const nextIds = activeSet.has(templateId)
            ? activeIds.filter((id) => id !== templateId)
            : [...activeIds, templateId];
        onChange(nextIds);
    };

    return (
        <section className="admin-qr-template-panel">
            <div className="admin-qr-template-head">
                <div>
                    <span>MANAGER EXPERIENCE</span>
                    <h5>QR Cafe Template Library</h5>
                    <p>
                        Choose which designs managers can see while downloading table QR cards. Changes apply to every
                        manager.
                    </p>
                </div>
                <div className="admin-qr-template-count">
                    <strong>{activeIds.length}</strong>
                    <span>of {QR_TEMPLATES.length} active</span>
                </div>
            </div>

            <div className="admin-qr-template-actions">
                <span>Tap any template to activate or hide it.</span>
                <div>
                    <button type="button" onClick={() => onChange(QR_TEMPLATES.map((template) => template.id))}>
                        Activate all
                    </button>
                    <button type="button" onClick={() => onChange([])}>
                        Hide all
                    </button>
                </div>
            </div>

            <div className="admin-qr-template-grid">
                {QR_TEMPLATES.map((template) => {
                    const active = activeSet.has(template.id);
                    return (
                        <QrTemplatePreview
                            key={template.id}
                            template={template}
                            active={active}
                            selected={active}
                            compact
                            onClick={() => toggleTemplate(template.id)}
                        />
                    );
                })}
            </div>

            <div className="admin-qr-template-savebar">
                <div>
                    <strong>
                        {activeIds.length ? `${activeIds.length} templates ready for managers` : 'All templates hidden'}
                    </strong>
                    <span>You can change this selection anytime.</span>
                </div>
                <button type="button" disabled={saving} onClick={onSave}>
                    {saving ? 'Saving...' : 'Save Active Templates'}
                </button>
            </div>
        </section>
    );
}

export default QrTemplateAdminPanel;
