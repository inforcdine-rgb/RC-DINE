import React, { Fragment } from 'react';
import { Form, Formik } from 'formik';
import { Modal } from 'react-bootstrap';
import CustomButton from '../CustomButton';
import CustomFormGroup from '../CustomFormGroup';
import '../../assets/styles/modal.css';

function ModalFooter({
    additionalButtons = [],
    closeText,
    submitText,
    type,
    handleClose,
    handleSubmit,
    disabled = false,
    isLoading = false,
    submitDisabled = false
}) {
    return (
        <Modal.Footer>
            {additionalButtons.map((button, index) => (
                <CustomButton
                    key={index}
                    className={button.variant || 'outline-primary'}
                    onClick={button.onClick}
                    label={button.text}
                    disabled={isLoading}
                />
            ))}

            {closeText && (
                <CustomButton
                    className="secondary-button"
                    onClick={() => {
                        if (closeText === 'Pay Manually') {
                            handleClose('payment');
                            return;
                        }

                        handleClose(false);
                    }}
                    label={closeText}
                    disabled={isLoading}
                />
            )}

            {submitText && type === 'form' && (
                <CustomButton
                    type="submit"
                    className="custom-button"
                    disabled={disabled || isLoading}
                    label={submitText}
                />
            )}

            {submitText && type === 'string' && (
                <CustomButton
                    type="button"
                    onClick={handleSubmit}
                    className="custom-button"
                    disabled={isLoading || submitDisabled}
                    label={submitText}
                />
            )}
        </Modal.Footer>
    );
}

function OMTModal({
    title,
    type = 'string',
    description,
    show = false,
    handleClose,
    handleSubmit = () => {},
    closeText,
    submitText,
    isFooter = true,
    size = 'sm',
    initialValues = {},
    validationSchema = '',
    additionalButtons = [],
    isLoading = false,
    submitDisabled = false
}) {
    return (
        <Modal
            show={show}
            onHide={() => {
                handleClose(false);
            }}
            size={size}
        >
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>

            <Modal.Body className="omt-modal-body">
                {type === 'string' && description}

                {type === 'form' && (
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({
                            isSubmitting,
                            isValid,
                            dirty,
                            setFieldValue,
                            values,
                            setValues
                        }) => (
                            <Form className="d-flex flex-column">
                                <div className="row mb-4">
                                    {Object.entries(description || {}).map(
                                        ([key, property], index) => {
                                            const disabled =
                                                property.invalidDisable &&
                                                (isSubmitting || !isValid || !dirty)
                                                    ? true
                                                    : property.disabled;

                                            return (
                                                <Fragment key={`${key}-${index}`}>
                                                    <CustomFormGroup
                                                        className={property.className}
                                                        name={property.name}
                                                        type={property.type}
                                                        label={property.label}
                                                        options={property.options}
                                                        setFieldValue={setFieldValue}
                                                        disabled={disabled}
                                                        isMulti={property.isMulti}
                                                        onClick={property.onClick}
                                                        icon={property.icon}
                                                        values={values}
                                                        getValues={property.getValues}
                                                        setFormValues={setValues}
                                                        required={property.required}
                                                    />
                                                </Fragment>
                                            );
                                        }
                                    )}
                                </div>

                                <ModalFooter
                                    additionalButtons={additionalButtons}
                                    closeText={closeText}
                                    submitText={submitText}
                                    type={type}
                                    handleClose={handleClose}
                                    handleSubmit={handleSubmit}
                                    disabled={isSubmitting || !isValid || !dirty}
                                    isLoading={isLoading}
                                    submitDisabled={submitDisabled}
                                />
                            </Form>
                        )}
                    </Formik>
                )}
            </Modal.Body>

            {isFooter && type !== 'form' && (
                <ModalFooter
                    additionalButtons={additionalButtons}
                    closeText={closeText}
                    submitText={submitText}
                    type={type}
                    handleClose={handleClose}
                    handleSubmit={handleSubmit}
                    isLoading={isLoading}
                    submitDisabled={submitDisabled}
                />
            )}
        </Modal>
    );
}

export default OMTModal;
