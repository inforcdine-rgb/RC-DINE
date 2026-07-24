import React, { useEffect } from 'react';

import CryptoJS from 'crypto-js';
import moment from 'moment';
import { FaHandPointRight, FaMapMarkerAlt, FaPhoneAlt, FaUserTie } from 'react-icons/fa';
import { MdDeleteForever, MdEditDocument } from 'react-icons/md';
import { TbCoinRupeeFilled, TbReceiptTax } from 'react-icons/tb';
import { TiPlus } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import '../../assets/styles/ownerCards.css';
import defaultLogo from '../../assets/images/R-C DINE.png';
import CustomButton from '../../components/CustomButton';
import OMTModal from '../../components/Modal';
import SmartImage from '../../components/SmartImage';
import env from '../../config/env';
import * as hotelService from '../../services/hotel.service';
import {
    getHotelRequest,
    removeHotelRequest,
    setDeleteHotelConfirm,
    setGlobalHotelId,
    setHotelFormData
} from '../../store/slice/hotel.slice';
import { getHotelUpdateDifference } from '../../utils/helpers.js';
import { hotelRegistrationSchema } from '../../validations/hotel';

function Hotels() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const { hotelOptions, data, deleteHotelConfirm, formData } = useSelector((state) => state.hotel);

    const rows = Array.isArray(data?.rows) ? data.rows : [];

    const createOptions = {
        action: 'create',
        title: 'Create New Hotel',
        initialValues: {
            name: '',
            openTime: '',
            closeTime: '',
            address: '',
            careNumber: '',
            gstNumber: '',
            logo: '',
            logoFile: null,
            logoPreview: '',
            removeLogo: false
        },
        submitText: 'Create',
        closeText: 'Close'
    };

    const updateOptions = (hotel) => {
        const { name, openTime, closeTime, address, careNumber, gstNumber, logo, id } = hotel;
        return {
            action: 'update',
            title: 'Update Hotel',
            hotelId: id,
            initialValues: {
                name: name || '',
                openTime: openTime || '',
                closeTime: closeTime || '',
                address: address || '',
                careNumber: careNumber || '',
                gstNumber: gstNumber || '',
                logo: logo || '',
                logoFile: null,
                logoPreview: logo || '',
                removeLogo: false
            },
            submitText: 'Update',
            closeText: 'Close'
        };
    };

    useEffect(() => {
        dispatch(getHotelRequest());
    }, [dispatch]);

    const handleCheckIn = (hotel) => {
        const hasActiveSubscription =
            hotel.subscriptions && moment().diff(hotel.subscriptions.endDate) <= 0;

        if (hasActiveSubscription) {
            const details = CryptoJS.AES.encrypt(
                JSON.stringify({ role: user.data.role, hotelId: hotel.id }),
                env.cryptoSecret
            ).toString();
            dispatch(setGlobalHotelId(hotel.id));
            localStorage.setItem('data', details);
            navigate('/dashboard');
            return;
        }

        navigate('/subscription', {
            state: {
                id: hotel.id,
                name: hotel.name,
                subscribed: {
                    planName: hotel.subscriptions?.planName,
                    status: !!hotel.subscriptions
                }
            }
        });
    };

    const handleSubscription = (hotel) => {
        navigate('/subscription', {
            state: {
                id: hotel.id,
                name: hotel.name,
                data: hotel.subscriptions
            }
        });
    };

    const handleDelete = () => {
        if (deleteHotelConfirm?.id) {
            dispatch(removeHotelRequest(deleteHotelConfirm.id));
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);

        try {
            const { logoFile, logoPreview, removeLogo, logo, ...formValues } = values;
            let hotelId = formData.hotelId;
            let actionMessage = 'Hotel updated successfully';

            if (formData.action === 'create') {
                const payload = { ...formValues };

                if (!payload.openTime || !payload.closeTime) {
                    delete payload.openTime;
                    delete payload.closeTime;
                }

                const created = await hotelService.create(payload);
                hotelId =
                    created?.id ||
                    created?.data?.id ||
                    created?.hotel?.id ||
                    created?.data?.hotel?.id;

                if (!hotelId) {
                    throw new Error('Hotel created, but hotel ID was not returned');
                }

                actionMessage = 'Hotel created successfully';
            } else {
                const initial = formData.initialValues || {};
                const cleanInitial = {
                    name: initial.name,
                    openTime: initial.openTime,
                    closeTime: initial.closeTime,
                    address: initial.address,
                    careNumber: initial.careNumber,
                    gstNumber: initial.gstNumber
                };
                const diff = getHotelUpdateDifference(cleanInitial, formValues);

                if (Object.keys(diff).length) {
                    await hotelService.update({ id: hotelId, data: diff });
                }
            }

            if (logoFile) {
                const logoResult = await hotelService.uploadLogo(hotelId, logoFile);

                if (!logoResult?.logo && !logoResult?.data?.logo) {
                    throw new Error('Logo upload completed without returning a logo URL');
                }

                actionMessage =
                    formData.action === 'create'
                        ? 'Hotel created and logo uploaded successfully'
                        : 'Hotel and logo updated successfully';
            } else if (removeLogo && logo) {
                await hotelService.removeLogo(hotelId);
                actionMessage = 'Hotel logo removed successfully';
            }

            dispatch(getHotelRequest());
            dispatch(setHotelFormData(false));
            toast.success(actionMessage);
        } catch (error) {
            console.error('Hotel save/logo upload failed:', error);
            toast.error(
                error?.response?.data?.message ||
                    error?.message ||
                    'Hotel or logo save failed'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="heading-container">
                <h4 className="text-center text-white pt-5">Hotels</h4>
            </div>

            <div className="owner-page-toolbar">
                <div>
                    <h5 className="owner-page-title">Your Hotels</h5>
                    <p className="owner-page-subtitle">Manage hotel details, GSTIN, manager and subscription.</p>
                </div>
                <CustomButton
                    className="d-flex border-none gap-2"
                    disabled={false}
                    label={
                        <span className="d-flex align-items-center">
                            <TiPlus size={20} color="white" />
                            <span className="mx-2">Add Hotel</span>
                        </span>
                    }
                    onClick={() => dispatch(setHotelFormData(createOptions))}
                />
            </div>

            <div className="owner-card-grid">
                {rows.map((hotel) => {
                    const subscriptionActive =
                        hotel.subscriptions && moment().diff(hotel.subscriptions.endDate) <= 0;

                    return (
                        <article className="owner-entity-card" key={hotel.id}>
                            <div className="owner-card-header">
                                <div className="owner-avatar owner-avatar-hotel">
                                    <SmartImage
                                        src={hotel.logo || defaultLogo}
                                        alt={`${hotel.name || 'Hotel'} logo`}
                                        fallbackSrc={defaultLogo}
                                    />
                                </div>
                                <div className="owner-card-heading">
                                    <h5>{hotel.name || 'Unnamed Hotel'}</h5>
                                    <span className={`owner-status ${subscriptionActive ? 'active' : 'inactive'}`}>
                                        {subscriptionActive ? 'Active' : 'Subscription Required'}
                                    </span>
                                </div>
                            </div>

                            <div className="owner-card-body">
                                <div className="owner-detail-row">
                                    <FaMapMarkerAlt />
                                    <span>{hotel.address || 'Address not added'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <FaPhoneAlt />
                                    <span>{hotel.careNumber || 'Contact not added'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <TbReceiptTax />
                                    <span>{hotel.gstNumber || 'GSTIN not added'}</span>
                                </div>
                                <div className="owner-detail-row">
                                    <FaUserTie />
                                    <span>{hotel.assignedManager || 'No manager assigned'}</span>
                                </div>

                                <div className="owner-card-stats">
                                    <div>
                                        <span>Opening</span>
                                        <strong>{hotel.openTime || '--:--'}</strong>
                                    </div>
                                    <div>
                                        <span>Closing</span>
                                        <strong>{hotel.closeTime || '--:--'}</strong>
                                    </div>
                                    <div>
                                        <span>Sales</span>
                                        <strong>₹ {hotel.sales ?? 0}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="owner-card-actions">
                                <button type="button" className="owner-action primary" onClick={() => handleCheckIn(hotel)}>
                                    <FaHandPointRight /> Check-In
                                </button>
                                <button type="button" className="owner-action" onClick={() => handleSubscription(hotel)}>
                                    <TbCoinRupeeFilled /> Subscription
                                </button>
                                <button
                                    type="button"
                                    className="owner-action"
                                    onClick={() => dispatch(setHotelFormData(updateOptions(hotel)))}
                                >
                                    <MdEditDocument /> Edit
                                </button>
                                <button
                                    type="button"
                                    className="owner-action danger"
                                    onClick={() => dispatch(setDeleteHotelConfirm({ id: hotel.id, name: hotel.name }))}
                                >
                                    <MdDeleteForever /> Delete
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {!rows.length && <div className="owner-empty-state">No hotels found. Add your first hotel.</div>}

            <OMTModal
                show={formData}
                type="form"
                title={formData?.title}
                initialValues={formData?.initialValues || createOptions.initialValues}
                validationSchema={hotelRegistrationSchema}
                handleSubmit={handleSubmit}
                description={hotelOptions}
                handleClose={() => dispatch(setHotelFormData(false))}
                isFooter={false}
                size="lg"
                submitText={formData?.submitText}
                closeText={formData?.closeText}
            />

            <OMTModal
                show={deleteHotelConfirm}
                title="Delete Hotel"
                handleSubmit={handleDelete}
                description={
                    <>
                        <div>
                            Are you sure you want to remove{' '}
                            <span className="fw-bold">{deleteHotelConfirm?.name}</span> from our app?
                        </div>
                        <br />
                        <div className="fw-bold">
                            Note: This action is irreversible and will delete all associated data and listings for this
                            hotel.
                        </div>
                    </>
                }
                handleClose={() => dispatch(setDeleteHotelConfirm(false))}
                isFooter
                size="md"
                submitText="Delete"
                closeText="Close"
            />
        </>
    );
}

export default Hotels;
