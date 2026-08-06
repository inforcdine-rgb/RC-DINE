import React from 'react';
import CryptoJS from 'crypto-js';
import { ErrorMessage, Field, Form as FormikForm, Formik } from 'formik';
import { Form as BootstrapForm } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import env from '../../config/env';
import { changeOwnerEmail } from '../../services/auth.service';
import { logoutRequest } from '../../store/slice';
import { getChangeEmailSchema } from '../../validations/auth';
import CustomButton from '../CustomButton';
import CustomFormGroup from '../CustomFormGroup';
import OMTModal from '../Modal';

const SUCCESS_MESSAGE = 'Email updated successfully. Please sign in with your new email.';

const ChangeEmailModal = ({ show, currentEmail, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const submittingRef = React.useRef(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const closeModal = () => {
        if (!submittingRef.current) onClose();
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        if (submittingRef.current) return;
        submittingRef.current = true;

        try {
            await changeOwnerEmail({
                currentPassword: CryptoJS.AES.encrypt(values.currentPassword, env.cryptoSecret).toString(),
                newEmail: values.newEmail.trim().toLowerCase(),
                confirmEmail: values.confirmEmail.trim().toLowerCase()
            });

            setSubmitting(false);
            submittingRef.current = false;
            onClose();
            toast.success(SUCCESS_MESSAGE);
            dispatch(
                logoutRequest({
                    navigate,
                    redirectTo: '/login',
                    reload: false,
                    skipUnregister: true
                })
            );
        } catch (error) {
            toast.error(error?.message || 'Unable to update email. Please try again.');
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    return (
        <OMTModal
            show={show}
            title="Change Email"
            size="md"
            isFooter={false}
            handleClose={closeModal}
            description={
                <Formik
                    initialValues={{ currentPassword: '', newEmail: '', confirmEmail: '' }}
                    validationSchema={getChangeEmailSchema(currentEmail)}
                    onSubmit={handleSubmit}
                    validateOnMount
                >
                    {({ dirty, isSubmitting, isValid }) => (
                        <FormikForm className="change-email-form" noValidate>
                            <BootstrapForm.Group className="mb-3" controlId="changeEmailCurrentPassword">
                                <BootstrapForm.Label className="small text-muted mb-1">
                                    Current Password <span className="text-danger">*</span>
                                </BootstrapForm.Label>
                                <div className="change-email-password-field">
                                    <Field name="currentPassword">
                                        {({ field }) => (
                                            <BootstrapForm.Control
                                                {...field}
                                                type={showPassword ? 'text' : 'password'}
                                                autoComplete="current-password"
                                                disabled={isSubmitting}
                                            />
                                        )}
                                    </Field>
                                    <button
                                        type="button"
                                        className="change-email-password-toggle"
                                        aria-label={showPassword ? 'Hide current password' : 'Show current password'}
                                        disabled={isSubmitting}
                                        onClick={() => setShowPassword((visible) => !visible)}
                                    >
                                        {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
                                    </button>
                                </div>
                                <ErrorMessage name="currentPassword" component="div" className="text-danger error-message" />
                            </BootstrapForm.Group>

                            <CustomFormGroup
                                name="newEmail"
                                type="email"
                                label="New Email"
                                className="mb-3"
                                disabled={isSubmitting}
                                required
                            />
                            <CustomFormGroup
                                name="confirmEmail"
                                type="email"
                                label="Confirm New Email"
                                className="mb-2"
                                disabled={isSubmitting}
                                required
                            />

                            <div className="change-email-actions">
                                <CustomButton
                                    type="button"
                                    className="secondary-button"
                                    disabled={isSubmitting}
                                    label="Cancel"
                                    onClick={closeModal}
                                />
                                <CustomButton
                                    type="submit"
                                    disabled={isSubmitting || !dirty || !isValid}
                                    label={isSubmitting ? 'Updating...' : 'Update Email'}
                                />
                            </div>
                        </FormikForm>
                    )}
                </Formik>
            }
        />
    );
};

export default ChangeEmailModal;
