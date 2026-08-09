import React, { useEffect, useMemo, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import { QRCodeSVG } from 'qrcode.react';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { TiPlus } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import OMTModal from '../../components/Modal';
import NoData from '../../components/NoData';
import QrTemplatePicker from '../../components/QrTemplatePicker';

import env from '../../config/env';
import features from '../../config/features';

import * as managerRcSessionService from '../../services/managerRcSession.service';
import * as qrTemplateService from '../../services/qrTemplate.service';
import * as tableService from '../../services/tables.service';

import { addTablesRequest, getDashboardRequest, getTablesRequest, setTableModalData } from '../../store/slice';

import {
    buildQrFilename,
    buildQrTemplateFilename,
    downloadQrTemplateAsPng,
    downloadSvgQrAsPng
} from '../../utils/qrDownload';
import { DEFAULT_ACTIVE_QR_TEMPLATE_IDS, getQrTemplatesByIds } from '../../utils/qrTemplates';
import { getBackgroundRequestVersion, registerRefreshHandler, waitForBackgroundRequests } from '../../utils/refreshBus';
import { addTableValidationSchema } from '../../validations/tables';

import '../../assets/styles/table.css';

function Tables() {
    const dispatch = useDispatch();
    const qrRefs = useRef({});
    const hotelId = useSelector((state) => state.hotel.globalHotelId);
    const cafeName = useSelector((state) => state.dashboard.details?.name);
    const { tablesData, tablesModalData } = useSelector((state) => state.table);
    const [searchText, setSearchText] = useState('');
    const [editTable, setEditTable] = useState(null);
    const [editName, setEditName] = useState('');
    const [deleteTable, setDeleteTable] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [sessionTable, setSessionTable] = useState(null);
    const [sessionDetails, setSessionDetails] = useState(null);
    const [showSessionOptions, setShowSessionOptions] = useState(false);
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [keepQrActive, setKeepQrActive] = useState(true);
    const [activeQrTemplateIds, setActiveQrTemplateIds] = useState(DEFAULT_ACTIVE_QR_TEMPLATE_IDS);
    const [templateTable, setTemplateTable] = useState(null);
    const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_ACTIVE_QR_TEMPLATE_IDS[0]);
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);
    const refreshSnapshotRef = useRef('');
    refreshSnapshotRef.current = JSON.stringify(tablesData);

    useEffect(() => {
        if (hotelId) {
            dispatch(getTablesRequest({ hotelId }));
            dispatch(getDashboardRequest(hotelId));
        }
    }, [hotelId, dispatch]);

    useEffect(() => {
        let active = true;
        const loadActiveQrTemplates = async () => {
            try {
                const response = await qrTemplateService.getActive();
                if (active && Array.isArray(response?.activeIds)) setActiveQrTemplateIds(response.activeIds);
            } catch (error) {
                console.error('Active QR templates could not be loaded', error);
            }
        };
        if (hotelId) loadActiveQrTemplates();
        return () => {
            active = false;
        };
    }, [hotelId]);

    useEffect(
        () =>
            registerRefreshHandler('manager-tables', async () => {
                if (!hotelId) return false;
                const before = refreshSnapshotRef.current;
                const checkpoint = getBackgroundRequestVersion();
                dispatch(getTablesRequest({ hotelId }));
                if (sessionTable?.value) {
                    const details = await managerRcSessionService.getManagerRcSession(sessionTable.value);
                    setSessionDetails(details);
                }
                await waitForBackgroundRequests({ checkpoint });
                return before !== refreshSnapshotRef.current;
            }),
        [dispatch, hotelId, sessionTable?.value]
    );

    const makeTableUrl = (tableId) => {
        const token = CryptoJS.AES.encrypt(JSON.stringify({ tableId }), env.cryptoSecret).toString();
        return `${env.appUrl}/place/${encodeURIComponent(token)}`;
    };

    const filteredTables = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        if (!query) return tablesData;
        return tablesData.filter((table) =>
            String(table.label || '')
                .toLowerCase()
                .includes(query)
        );
    }, [searchText, tablesData]);

    const activeQrTemplates = useMemo(() => getQrTemplatesByIds(activeQrTemplateIds), [activeQrTemplateIds]);

    const openAddModal = () => {
        dispatch(
            setTableModalData({
                title: 'Add Tables',
                type: 'add',
                initialValues: { count: 1 },
                options: {
                    name: {
                        name: 'count',
                        type: 'number',
                        label: 'Number of Tables',
                        className: 'col-12'
                    }
                },
                submitText: 'Add',
                closeText: 'Close'
            })
        );
    };

    const handleAddSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);
        if (hotelId) dispatch(addTablesRequest({ hotelId, ...values }));
        setSubmitting(false);
    };

    const openEditModal = (table) => {
        setEditTable(table);
        setEditName(table.label || '');
    };

    const handleSaveTableName = async () => {
        if (!hotelId || !editTable?.value) return;
        const nextName = editName.trim();
        if (!nextName) {
            toast.warn('Table name required');
            return;
        }
        try {
            setLoadingAction(true);
            await tableService.update(hotelId, editTable.value, { tableName: nextName });
            toast.success('Table name updated');
            setEditTable(null);
            setEditName('');
            dispatch(getTablesRequest({ hotelId }));
        } catch (error) {
            toast.error(`Failed to update table ${error.message}`);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDeleteTable = async () => {
        if (!hotelId || !deleteTable?.value) return;
        try {
            setLoadingAction(true);
            await tableService.remove(hotelId, { tableId: deleteTable.value });
            toast.success(`${deleteTable.label} deleted`);
            setDeleteTable(null);
            dispatch(getTablesRequest({ hotelId }));
        } catch (error) {
            toast.error(`Failed to delete table ${error.message}`);
        } finally {
            setLoadingAction(false);
        }
    };

    const openSessionControl = async (table) => {
        try {
            setLoadingAction(true);
            const details = await managerRcSessionService.getManagerRcSession(table.value);
            setSessionTable(table);
            setSessionDetails(details);
            setShowSessionOptions(false);
            setShowPaymentConfirm(false);
            setKeepQrActive(true);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const runSessionAction = async (action) => {
        try {
            setLoadingAction(true);
            await managerRcSessionService.setManagerTableAction(sessionTable.value, action);
            const details = await managerRcSessionService.getManagerRcSession(sessionTable.value);
            setSessionDetails(details);
            dispatch(getTablesRequest({ hotelId }));
            toast.success('Table updated');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const closeSession = async (keepTableActive) => {
        try {
            setLoadingAction(true);
            await managerRcSessionService.closeManagerRcSession(sessionTable.value, keepTableActive);
            setSessionTable(null);
            setSessionDetails(null);
            dispatch(getTablesRequest({ hotelId }));
            toast.success(keepTableActive ? 'Old session closed; QR kept ON' : 'Session closed; QR turned OFF');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDownloadQr = async (table) => {
        try {
            const filename = buildQrFilename(cafeName, table.label);
            await downloadSvgQrAsPng(qrRefs.current[table.value], filename);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDownloadAllQr = () => {
        filteredTables.forEach((table, index) => {
            setTimeout(() => handleDownloadQr(table), index * 250);
        });
    };

    const openTemplatePicker = (table) => {
        if (!activeQrTemplates.length) {
            toast.info('Admin has not activated any QR templates yet');
            return;
        }
        setTemplateTable(table);
        setSelectedTemplateId(activeQrTemplates[0].id);
    };

    const handleDownloadTemplate = async () => {
        const template = activeQrTemplates.find((item) => item.id === selectedTemplateId);
        if (!templateTable || !template) return;

        try {
            setDownloadingTemplate(true);
            await downloadQrTemplateAsPng({
                container: qrRefs.current[templateTable.value],
                filename: buildQrTemplateFilename(cafeName, templateTable.label, template.name),
                template,
                cafeName,
                tableName: templateTable.label
            });
            toast.success(`${template.name} QR template downloaded`);
            setTemplateTable(null);
        } catch (error) {
            toast.error(error.message || 'QR template download failed');
        } finally {
            setDownloadingTemplate(false);
        }
    };

    return (
        <div className="tables-page">
            <div className="tables-head">
                <div>
                    <h1>Tables</h1>
                    <p>Manage all restaurant tables and QR codes</p>
                </div>
                <button className="tables-add-btn" type="button" onClick={openAddModal}>
                    <TiPlus /> Add Table
                </button>
            </div>

            <div className="tables-toolbar">
                <div className="tables-search">
                    <span>⌕</span>
                    <input
                        type="search"
                        value={searchText}
                        placeholder="Search table..."
                        onChange={(event) => setSearchText(event.target.value)}
                    />
                </div>
                <button
                    className="tables-download-all"
                    type="button"
                    onClick={handleDownloadAllQr}
                    disabled={!filteredTables.length}
                >
                    ↓ Download All QR
                </button>
            </div>

            {filteredTables.length ? (
                <div className="tables-grid">
                    {filteredTables.map((table) => {
                        const tableUrl = makeTableUrl(table.value);
                        return (
                            <div key={table.value} className="table-card">
                                <div className="table-card-head">
                                    <div className="table-name-wrap">
                                        <span className="table-icon">▣</span>
                                        <strong>{table.label}</strong>
                                    </div>
                                    <button
                                        className="table-edit-btn"
                                        type="button"
                                        onClick={() => openEditModal(table)}
                                        title="Edit table name"
                                    >
                                        <MdEdit />
                                    </button>
                                </div>

                                <div
                                    ref={(node) => {
                                        qrRefs.current[table.value] = node;
                                    }}
                                    className="table-qr-box"
                                >
                                    <QRCodeSVG value={tableUrl} size={170} level="H" className="table-qr" />
                                </div>

                                {features.managerSessionControls && (
                                    <button
                                        className="table-session-btn"
                                        type="button"
                                        onClick={() => openSessionControl(table)}
                                    >
                                        RC Session Control
                                    </button>
                                )}
                                <button
                                    className="table-download-btn"
                                    type="button"
                                    onClick={() => handleDownloadQr(table)}
                                >
                                    ↓ Download QR
                                </button>
                                {activeQrTemplates.length > 0 && (
                                    <button
                                        className="table-template-download-btn"
                                        type="button"
                                        onClick={() => openTemplatePicker(table)}
                                    >
                                        ✦ Download with Template
                                    </button>
                                )}
                                <button
                                    className="table-delete-btn"
                                    type="button"
                                    onClick={() => setDeleteTable(table)}
                                >
                                    <MdDeleteForever /> Delete QR
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="tables-empty">
                    <NoData />
                </div>
            )}

            <OMTModal
                show={tablesModalData}
                type="form"
                validationSchema={addTableValidationSchema}
                title={tablesModalData?.title}
                initialValues={tablesModalData?.initialValues || {}}
                handleSubmit={handleAddSubmit}
                description={tablesModalData?.options || {}}
                handleClose={() => dispatch(setTableModalData(false))}
                isFooter={false}
                size="md"
                submitText={tablesModalData?.submitText}
                closeText={tablesModalData?.closeText}
            />

            {templateTable && (
                <QrTemplatePicker
                    templates={activeQrTemplates}
                    selectedId={selectedTemplateId}
                    cafeName={cafeName || 'Your Cafe'}
                    tableName={templateTable.label}
                    qrValue={makeTableUrl(templateTable.value)}
                    downloading={downloadingTemplate}
                    onSelect={setSelectedTemplateId}
                    onClose={() => setTemplateTable(null)}
                    onDownload={handleDownloadTemplate}
                />
            )}

            {editTable && (
                <div className="table-modal-backdrop">
                    <div className="table-modal">
                        <h3>Edit Table</h3>
                        <p>Change table name. QR link same rahega.</p>
                        <label>Table Name</label>
                        <input value={editName} onChange={(event) => setEditName(event.target.value)} autoFocus />
                        <div className="table-modal-actions">
                            <button type="button" onClick={() => setEditTable(null)} disabled={loadingAction}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="save"
                                onClick={handleSaveTableName}
                                disabled={loadingAction}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {features.managerSessionControls && sessionTable && (
                <div className="table-modal-backdrop">
                    <div className="table-modal rc-control-modal">
                        <div className="rc-control-head">
                            <div>
                                <small>{sessionTable.label}</small>
                                <h3>RC Session</h3>
                            </div>
                            <button type="button" aria-label="Close" onClick={() => setSessionTable(null)}>
                                ×
                            </button>
                        </div>
                        <div
                            className={`rc-control-hero ${String(sessionDetails?.session?.status || '').toLowerCase()}`}
                        >
                            <span className="rc-control-live-dot" />
                            <div>
                                <strong>
                                    {sessionDetails?.session?.status === 'PAYMENT_PENDING'
                                        ? 'Payment Pending'
                                        : sessionDetails?.session
                                            ? 'Ordering Active'
                                            : sessionDetails?.table?.qrEnabled
                                                ? 'Waiting for Customer'
                                                : 'QR Ordering Paused'}
                                </strong>
                                <small>
                                    {sessionDetails?.session
                                        ? `${sessionDetails.session.sessionMembers?.length || 0} customers in this session`
                                        : sessionDetails?.table?.qrEnabled
                                            ? 'QR is ready to scan'
                                            : 'Customers cannot start a session'}
                                </small>
                            </div>
                        </div>

                        {!sessionDetails?.session && !sessionDetails?.table?.qrEnabled && (
                            <button
                                className="rc-control-primary"
                                type="button"
                                disabled={loadingAction}
                                onClick={() => runSessionAction('ACTIVATE')}
                            >
                                Start QR Ordering
                            </button>
                        )}
                        {sessionDetails?.session?.status === 'ACTIVE' && (
                            <button
                                className="rc-control-primary"
                                type="button"
                                disabled={loadingAction}
                                onClick={() => runSessionAction('PAYMENT_PENDING')}
                            >
                                Collect Payment
                            </button>
                        )}
                        {sessionDetails?.session?.status === 'PAYMENT_PENDING' && !showPaymentConfirm && (
                            <button
                                className="rc-control-primary"
                                type="button"
                                disabled={loadingAction}
                                onClick={() => setShowPaymentConfirm(true)}
                            >
                                Complete Payment
                            </button>
                        )}

                        {showPaymentConfirm && (
                            <div className="rc-payment-confirm">
                                <strong>Complete payment and free this table?</strong>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={keepQrActive}
                                        onChange={(event) => setKeepQrActive(event.target.checked)}
                                    />
                                    <span>Keep QR ready for the next customer</span>
                                </label>
                                <div>
                                    <button type="button" onClick={() => setShowPaymentConfirm(false)}>
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        className="save"
                                        disabled={loadingAction}
                                        onClick={() => closeSession(keepQrActive)}
                                    >
                                        Complete & Free Table
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            className="rc-control-more"
                            type="button"
                            onClick={() => setShowSessionOptions((value) => !value)}
                        >
                            {showSessionOptions ? 'Hide Options' : 'More Options'}
                        </button>
                        {showSessionOptions && (
                            <div className="rc-control-options">
                                {sessionDetails?.session && (
                                    <div className="rc-control-session">
                                        <p>
                                            <b>Session code</b>
                                            <span>{sessionDetails.session.sessionCode}</span>
                                        </p>
                                        <p>
                                            <b>Host</b>
                                            <span>{sessionDetails.session.ownerMobile || '—'}</span>
                                        </p>
                                    </div>
                                )}
                                {sessionDetails?.table?.qrEnabled ? (
                                    <button
                                        type="button"
                                        disabled={loadingAction}
                                        onClick={() => runSessionAction('DISABLE')}
                                    >
                                        Pause QR Ordering
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={loadingAction}
                                        onClick={() => runSessionAction('ACTIVATE')}
                                    >
                                        Start QR Ordering
                                    </button>
                                )}
                                {sessionDetails?.session?.status === 'PAYMENT_PENDING' && (
                                    <button
                                        type="button"
                                        disabled={loadingAction}
                                        onClick={() => runSessionAction('REOPEN')}
                                    >
                                        Resume Ordering
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {deleteTable && (
                <div className="table-modal-backdrop">
                    <div className="table-modal delete">
                        <h3>Delete Table?</h3>
                        <p>
                            Are you sure you want to delete <b>{deleteTable.label}</b> QR?
                        </p>
                        <div className="table-modal-actions">
                            <button type="button" onClick={() => setDeleteTable(null)} disabled={loadingAction}>
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="danger"
                                onClick={handleDeleteTable}
                                disabled={loadingAction}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Tables;
