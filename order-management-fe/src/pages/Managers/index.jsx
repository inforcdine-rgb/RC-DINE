import React, { useEffect } from 'react';

import CryptoJS from 'crypto-js';
import moment from 'moment';
import { FaEnvelope, FaHotel, FaMapMarkerAlt, FaPhoneAlt, FaUserTie } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { TbKey, TbUserEdit } from 'react-icons/tb';
import { TiPlus } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';

import '../../assets/styles/ownerCards.css';
import CustomButton from '../../components/CustomButton';
import OMTModal from '../../components/Modal';
import env from '../../config/env';
import { getHotelRequest } from '../../store/slice';
import {
    createManagerRequest,
    getManagersRequest,
    removeManagerRequest,
    setFormInfo,
    setHotelOption,
    setSelectedRow,
    updateManagerCredentialsRequest,
    updateManagerRequest
} from '../../store/slice/manager.slice';

function Managers() {
    const { managerOptions, formInfo, data, selectedRow } = useSelector((state) => state.manager);
    const { data: hotels } = useSelector((state) => state.hotel);
    const dispatch = useDispatch();

    const rows = Array.isArray(data?.rows) ? data.rows : [];

    const credentialsOptions = {
        action: 'credentials',
        title: 'Edit Manager Credentials',
        initialValues: { email: '', password: '' },
        submitText: 'Update Credentials',
        closeText: 'Close'
    };

    const createOptions = {
        action: 'create',
        title: 'Create New Manager',
        initialValues: {
            name: '',
            phoneNumber: '',
            email: '',
            password: '',
            hotel: [],
            onboarded: ''
        },
        submitText: 'Create',
        closeText: 'Close'
    };

    const updateOptions = (manager) => {
        const assignedHotels = manager?.hotel?.id
            ? [{ label: manager.hotel.name, value: manager.hotel.id }]
            : [];

        return {
            action: 'update',
            title: 'Update Manager',
            managerId: manager.id,
            initialValues: {
                name: `${manager.firstName || ''} ${manager.lastName || ''}`.trim(),
                phoneNumber: manager.phoneNumber || '',
                email: manager.email || '',
                password: '',
                hotel: assignedHotels,
                onboarded: manager.createdAt ? moment(manager.createdAt).format('DD-MMM-YYYY') : ''
            },
            submitText: 'Update',
            closeText: 'Close'
        };
    };

    const editCredentialsOptions = (manager) => ({
        ...credentialsOptions,
        managerId: manager.id,
        initialValues: {
            email: manager.email || '',
            password: ''
        }
    });

    const getHotelOptions = (currentHotelId) => {
        const assignedHotelIds = rows.map((row) => row?.hotel?.id).filter(Boolean);
        return (
            hotels?.rows
                ?.filter((hotel) => hotel.id === currentHotelId || !assignedHotelIds.includes(hotel.id))
                .map((hotel) => ({ label: hotel.name, value: hotel.id })) || []
        );
    };

    const credentialFields = {
        email: {
            ...managerOptions.email,
            label: 'Manager Login ID / Email',
            required: false,
            disabled: false
        },
        password: {
            ...managerOptions.password,
            label: 'Password (leave blank to keep current)',
            required: false,
            disabled: false
        }
    };

    let formFields = {
        ...managerOptions,
        hotel: {
            ...managerOptions.hotel,
            options: getHotelOptions(formInfo?.initialValues?.hotel?.[0]?.value)
        },
        name: { ...managerOptions.name, disabled: formInfo?.action === 'update' },
        phoneNumber: { ...managerOptions.phoneNumber, disabled: formInfo?.action === 'update' },
        email: { ...managerOptions.email, disabled: formInfo?.action === 'update' },
        password: { ...managerOptions.password, disabled: formInfo?.action === 'update' }
    };

    if (formInfo?.action === 'credentials') {
        formFields = credentialFields;
    }

    useEffect(() => {
        if (!hotels?.rows?.length) {
            dispatch(getHotelRequest());
        }
    }, [dispatch, hotels?.rows?.length]);

    useEffect(() => {
        dispatch(
            setHotelOption(
                hotels?.rows?.map((hotel) => ({ label: hotel.name, value: hotel.id })) || []
            )
        );
    }, [dispatch, hotels?.rows]);

    useEffect(() => {
        dispatch(getManagersRequest());
    }, [dispatch]);

    const handleDelete = () => {
        if (selectedRow?.id) {
            dispatch(removeManagerRequest({ id: selectedRow.id }));
        }
    };

    const handleSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);

        if (formInfo?.action === 'create') {
            const nameParts = String(values.name || '').trim().split(' ').filter(Boolean);
            const firstName = nameParts.shift() || '';
            const lastName = nameParts.join(' ');
            dispatch(
                createManagerRequest({
                    firstName,
                    lastName,
                    phoneNumber: values.phoneNumber,
                    email: values.email,
                    password: CryptoJS.AES.encrypt(values.password, env.cryptoSecret).toString(),
                    hotelId: values.hotel?.value
                })
            );
        } else if (formInfo?.action === 'credentials') {
            const payload = { email: values.email };
            if (values.password) {
                payload.password = CryptoJS.AES.encrypt(values.password, env.cryptoSecret).toString();
            }
            dispatch(updateManagerCredentialsRequest({ id: formInfo.managerId, data: payload }));
        } else {
            dispatch(
                updateManagerRequest({
                    id: formInfo.managerId,
                    data: {
                        prev: formInfo.initialValues?.hotel?.[0]?.value,
                        current: values?.hotel?.value
                    }
                })
            );
        }
    };

    return (
        <>
            <div className="heading-container">
                <h4 className="text-center text-white pt-5">Managers</h4>
            </div>

            <div className="owner-page-toolbar">
                <div>
                    <h5 className="owner-page-title">Your Managers</h5>
                    <p className="owner-page-subtitle">Manage manager assignment and login credentials.</p>
                </div>
                <CustomButton
                    className="d-flex border-none gap-2"
                    disabled={false}
                    label={
                        <span className="d-flex align-items-center">
                            <TiPlus size={20} color="white" />
                            <span className="mx-2">Add Manager</span>
                        </span>
                    }
                    onClick={() => dispatch(setFormInfo(createOptions))}
                />
            </div>

            <div className="owner-card-grid">
                {rows.map((manager) => {
                    const fullName = `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Unnamed Manager';
                    return (
                        <article className="owner-entity-card" key={manager.id}>
                            <div className="owner-card-header">
                                <div className="owner-avatar owner-avatar-manager">
                                    <FaUserTie />
                                </div>
                                <div className="owner-card-heading">
                                    <h5>{fullName}</h5>
                                    <span className={`owner-status ${manager.hotel?.id ? 'active' : 'inactive'}`}>
                                        {manager.hotel?.id ? 'Assigned' : 'Unassigned'}
                                    </span>
                                </div>
                            </div>

                            <div className="owner-card-body">
                                <div className="owner-detail-row">
                                    <FaPhoneAlt />
                                    <span>{manager.phoneNumber || 'Phone not added'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <FaEnvelope />
                                    <span className="owner-break-text">{manager.email || 'Email not added'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <FaHotel />
                                    <span>{manager.hotel?.name || 'No hotel assigned'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <FaMapMarkerAlt />
                                    <span>{manager.hotel?.address || 'Location unavailable'}</span>
                                </div>

                                <div className="owner-card-stats owner-card-stats-two">
                                    <div>
                                        <span>Joined</span>
                                        <strong>
                                            {manager.createdAt ? moment(manager.createdAt).format('DD-MMM-YYYY') : '-'}
                                        </strong>
                                    </div>
                                    <div>
                                        <span>Hotel</span>
                                        <strong>{manager.hotel?.name || 'Not assigned'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="owner-card-actions owner-card-actions-three">
                                <button
                                    type="button"
                                    className="owner-action primary"
                                    onClick={() => dispatch(setFormInfo(updateOptions(manager)))}
                                >
                                    <TbUserEdit /> Edit
                                </button>
                                <button
                                    type="button"
                                    className="owner-action"
                                    onClick={() => dispatch(setFormInfo(editCredentialsOptions(manager)))}
                                >
                                    <TbKey /> Credentials
                                </button>
                                <button
                                    type="button"
                                    className="owner-action danger"
                                    onClick={() => dispatch(setSelectedRow(manager))}
                                >
                                    <MdDeleteForever /> Delete
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {!rows.length && <div className="owner-empty-state">No managers found. Add your first manager.</div>}

            <OMTModal
                show={formInfo}
                type="form"
                title={formInfo?.title}
                initialValues={formInfo?.initialValues || createOptions.initialValues}
                handleSubmit={handleSubmit}
                description={formFields}
                handleClose={() => dispatch(setFormInfo(false))}
                isFooter={false}
                size="lg"
                submitText={formInfo?.submitText}
                closeText={formInfo?.closeText}
            />

            <OMTModal
                show={selectedRow}
                size="md"
                closeText="Cancel"
                submitText="Delete"
                title="Delete Manager"
                description={
                    <>
                        <div>
                            Are you sure you want to remove{' '}
                            <span className="fw-bold">
                                {`${selectedRow?.firstName || ''} ${selectedRow?.lastName || ''}`.trim()}
                            </span>{' '}
                            from our app?
                        </div>
                        <br />
                        <div className="fw-bold">
                            Note: This action is irreversible and will delete all associated manager data.
                        </div>
                    </>
                }
                handleClose={() => dispatch(setSelectedRow(false))}
                handleSubmit={handleDelete}
            />
        </>
    );
}

export default Managers;
