import React from 'react';
import { Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import RecoveryCodeSecurityForm from '../../components/RecoveryCodeSecurityForm';
import { getUserSuccess } from '../../store/slice';

const CreateRecoveryCode = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.data);

    return (
        <>
            <div className="heading-container">
                <h4 className="text-center text-white pt-5">Secure Your Owner Account</h4>
            </div>
            <Card className="user-details mx-auto my-5 p-3 p-sm-4 shadow custom-shadow recovery-onboarding-card">
                <Card.Body>
                    <h5 className="fw-bold text-success">Create Recovery Code</h5>
                    <p className="text-muted">
                        Password bhoolne par registered email ke saath ye code use hoga. Code ko safe jagah note kar
                        lein; RC Dine ise dobara display nahi karega.
                    </p>
                    <RecoveryCodeSecurityForm
                        configured={false}
                        onSuccess={(response) => {
                            if (response.sessionsInvalidated) return;
                            dispatch(getUserSuccess({ ...user, recoveryCodeConfigured: true }));
                            navigate('/hotels', { replace: true });
                        }}
                    />
                </Card.Body>
            </Card>
        </>
    );
};

export default CreateRecoveryCode;
