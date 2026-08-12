import React from 'react';
import { Form, Formik } from 'formik';
import { Form as BootstrapForm } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateOwnerRecoveryCode } from '../../services/auth.service';
import { recoveryCodeUpdateSchema } from '../../validations/auth';
import CustomButton from '../CustomButton';
import CustomFormGroup from '../CustomFormGroup';
import RecoveryCodeField from '../RecoveryCodeField';

const RecoveryCodeSecurityForm = ({ configured = false, onSuccess = () => {} }) => {
    const navigate = useNavigate();

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        try {
            const response = await updateOwnerRecoveryCode({
                currentPassword: values.currentPassword,
                recoveryCode: values.recoveryCode,
                confirmRecoveryCode: values.confirmRecoveryCode,
                invalidateSessions: values.invalidateSessions
            });

            resetForm();
            toast.success(response.message);
            onSuccess(response);

            if (response.sessionsInvalidated) {
                localStorage.removeItem('token');
                localStorage.removeItem('data');
                sessionStorage.removeItem('token');
                navigate('/login', { replace: true });
            }
        } catch (error) {
            toast.error(error?.message || 'Unable to update recovery code.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={{
                currentPassword: '',
                recoveryCode: '',
                confirmRecoveryCode: '',
                invalidateSessions: false
            }}
            validationSchema={recoveryCodeUpdateSchema}
            onSubmit={handleSubmit}
        >
            {({ dirty, isSubmitting, isValid, values, setFieldValue }) => (
                <Form className="rc-recovery-security-form">
                    <p className="text-muted small mb-3">
                        {configured
                            ? 'Your existing code cannot be viewed. Verify your password to replace it.'
                            : 'Create a private 6-digit code for secure password recovery.'}
                    </p>
                    <CustomFormGroup name="currentPassword" type="password" label="Current Password" />
                    <div className="row">
                        <div className="col-12 col-md-6">
                            <RecoveryCodeField name="recoveryCode" label="New Recovery Code" />
                        </div>
                        <div className="col-12 col-md-6">
                            <RecoveryCodeField name="confirmRecoveryCode" label="Confirm Recovery Code" />
                        </div>
                    </div>
                    <BootstrapForm.Check
                        className="mt-3"
                        id="invalidateRecoverySessions"
                        type="checkbox"
                        checked={values.invalidateSessions}
                        label="Sign out all existing sessions after this change"
                        onChange={(event) => setFieldValue('invalidateSessions', event.target.checked)}
                    />
                    <CustomButton
                        type="submit"
                        className="mt-3"
                        disabled={isSubmitting || !dirty || !isValid}
                        label={configured ? 'Change Recovery Code' : 'Create Recovery Code'}
                    />
                </Form>
            )}
        </Formik>
    );
};

export default RecoveryCodeSecurityForm;
