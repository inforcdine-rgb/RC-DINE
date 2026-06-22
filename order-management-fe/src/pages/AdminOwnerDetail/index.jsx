import React, { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import * as adminService from '../../services/admin.service';

function AdminOwnerDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [owner, setOwner] = useState(null);

    useEffect(() => {
        const loadOwner = async () => {
            try {
                const data = await adminService.ownerDetail(id);
                setOwner(data);
            } catch (err) {
                setError(err?.message || 'Unable to fetch owner details');
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            loadOwner();
        }
    }, [id]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="m-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <CustomButton label="Go Back" onClick={() => navigate('/admin/owners')} />
            </div>
        );
    }

    return (
        <div className="m-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="text-white pt-4 m-0">Owner Details</h4>
                <CustomButton label="Back to Owners" onClick={() => navigate('/admin/owners')} />
            </div>
            <Row className="g-3 mb-4">
                <Col xs={12} md={6}>
                    <Card className="shadow p-4 bg-white text-dark h-100">
                        <h5>Owner Information</h5>
                        <p className="my-2">
                            <strong>Owner Name:</strong> {owner.firstName} {owner.lastName}
                        </p>
                        <p className="my-2">
                            <strong>Email:</strong> {owner.email}
                        </p>
                        <p className="my-2">
                            <strong>Phone:</strong> {owner.phoneNumber}
                        </p>
                        <p className="my-2">
                            <strong>Total Cafes:</strong> {owner.hotelCount}
                        </p>
                        <p className="my-2">
                            <strong>Assigned Managers Count:</strong> {owner.managerCount || 0}
                        </p>
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card className="shadow p-4 bg-white text-dark h-100">
                        <h5>Subscription Information</h5>
                        <p className="my-2">
                            <strong>Subscription Status:</strong>{' '}
                            <span
                                className={`badge bg-${owner.subscriptionStatus === 'ACTIVE' ? 'success' : owner.subscriptionStatus === 'EXPIRED' ? 'danger' : 'secondary'}`}
                            >
                                {owner.subscriptionStatus || 'TRIAL'}
                            </span>
                        </p>
                        <p className="my-2">
                            <strong>Plan:</strong> {owner.subscriptionPlan || 'N/A'}
                        </p>
                        <p className="my-2">
                            <strong>Start Date:</strong>{' '}
                            {owner.subscriptionStartAt
                                ? new Date(owner.subscriptionStartAt).toLocaleDateString('en-IN')
                                : 'N/A'}
                        </p>
                        <p className="my-2">
                            <strong>End Date:</strong>{' '}
                            {owner.subscriptionEndAt
                                ? new Date(owner.subscriptionEndAt).toLocaleDateString('en-IN')
                                : 'N/A'}
                        </p>
                    </Card>
                </Col>
            </Row>
            <Row className="g-3">
                <Col xs={12}>
                    <Card className="shadow p-4 bg-white text-dark">
                        <h5>Cafes Owned</h5>
                        {owner.hotels?.length ? (
                            <div className="table-responsive mt-3">
                                <table className="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Cafe Name</th>
                                            <th>Address</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {owner.hotels.map((hotel) => (
                                            <tr key={hotel.id}>
                                                <td>
                                                    <strong>{hotel.name}</strong>
                                                </td>
                                                <td>{hotel.address || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="mt-3 text-muted">No cafes assigned to this owner.</p>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminOwnerDetail;
