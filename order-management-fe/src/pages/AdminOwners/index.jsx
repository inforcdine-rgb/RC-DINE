import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import * as adminService from '../../services/admin.service';

function AdminOwners() {
    const navigate = useNavigate();
    const [owners, setOwners] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [extendDays, setExtendDays] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    const loadOwners = async () => {
        setLoading(true);
        try {
            const data = await adminService.owners({ search });
            setOwners(data.rows || []);
        } catch (err) {
            setError(err?.message || 'Unable to fetch owners');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOwners();
    }, [search]);

    const handleBlock = async (ownerId) => {
        setActionLoading((prev) => ({ ...prev, [ownerId]: 'block' }));
        try {
            const res = await adminService.blockOwner(ownerId);
            toast.success(res.message);
            loadOwners();
        } catch (err) {
            toast.error(err?.message || 'Something went wrong');
        } finally {
            setActionLoading((prev) => ({ ...prev, [ownerId]: null }));
        }
    };

    const handleExtend = async (ownerId) => {
        const days = Number(extendDays[ownerId]);
        if (!days || days <= 0) {
            toast.error('Please enter valid number of days');
            return;
        }
        setActionLoading((prev) => ({ ...prev, [ownerId]: 'extend' }));
        try {
            const res = await adminService.extendSubscription(ownerId, days);
            toast.success(`${res.message} — New end date: ${res.newEndDate}`);
            setExtendDays((prev) => ({ ...prev, [ownerId]: '' }));
            loadOwners();
        } catch (err) {
            toast.error(err?.message || 'Something went wrong');
        } finally {
            setActionLoading((prev) => ({ ...prev, [ownerId]: null }));
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="m-4">
            <div className="heading-container mb-4 d-flex justify-content-between align-items-center">
                <h4 className="text-white pt-4 m-0">Owners</h4>
                <div className="d-flex gap-2">
                    <input
                        className="form-control"
                        placeholder="Search owners"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            {error ? (
                <div className="alert alert-danger" role="alert">{error}</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-striped bg-white text-dark">
                        <thead>
                            <tr>
                                <th>Sr No</th>
                                <th>Owner Name</th>
                                <th>Email</th>
                                <th>Phone Number</th>
                                <th>Cafes</th>
                                <th>Status</th>
                                <th>Sub Start</th>
                                <th>Sub End</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {owners.length ? (
                                owners.map((owner, index) => (
                                    <tr key={owner.id} style={{ opacity: owner.isBlocked ? 0.6 : 1 }}>
                                        <td>{index + 1}</td>
                                        <td>
                                            {`${owner.firstName} ${owner.lastName}`}
                                            {owner.isBlocked && (
                                                <span className="badge bg-danger ms-1" style={{ fontSize: '10px' }}>
                                                    BLOCKED
                                                </span>
                                            )}
                                        </td>
                                        <td>{owner.email}</td>
                                        <td>{owner.phoneNumber}</td>
                                        <td>{owner.hotelCount}</td>
                                        <td>
                                            <span className={`badge bg-${owner.subscriptionStatus === 'ACTIVE' ? 'success' : owner.subscriptionStatus === 'EXPIRED' ? 'danger' : 'secondary'}`}>
                                                {owner.subscriptionStatus || 'TRIAL'}
                                            </span>
                                        </td>
                                        <td>{owner.subscriptionStartAt ? new Date(owner.subscriptionStartAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                                        <td>{owner.subscriptionEndAt ? new Date(owner.subscriptionEndAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                                        <td>{owner.createdAt ? new Date(owner.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                <CustomButton
                                                    className="btn btn-sm btn-primary"
                                                    label="View"
                                                    onClick={() => navigate(`/admin/owners/${owner.id}`)}
                                                />
                                                <button
                                                    className={`btn btn-sm ${owner.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                                                    onClick={() => handleBlock(owner.id)}
                                                    disabled={actionLoading[owner.id] === 'block'}
                                                >
                                                    {actionLoading[owner.id] === 'block' ? '...' : owner.isBlocked ? 'Unblock' : 'Block'}
                                                </button>
                                                <div className="d-flex gap-1">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        placeholder="Days"
                                                        style={{ width: '65px' }}
                                                        min="1"
                                                        value={extendDays[owner.id] || ''}
                                                        onChange={(e) => setExtendDays((prev) => ({ ...prev, [owner.id]: e.target.value }))}
                                                    />
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleExtend(owner.id)}
                                                        disabled={actionLoading[owner.id] === 'extend'}
                                                    >
                                                        {actionLoading[owner.id] === 'extend' ? '...' : '+Extend'}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={10} className="text-center py-4">No owners found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminOwners;
