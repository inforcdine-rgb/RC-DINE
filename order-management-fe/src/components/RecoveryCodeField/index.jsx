import React from 'react';
import { ErrorMessage, Field } from 'formik';
import { FormGroup, FormLabel } from 'react-bootstrap';

const RecoveryCodeField = ({
    name = 'recoveryCode',
    label = 'Recovery Code',
    disabled = false,
    className = 'mt-2'
}) => (
    <FormGroup className={className}>
        <FormLabel htmlFor={name} className="small text-muted m-0 d-flex">
            {label}
        </FormLabel>
        <Field name={name}>
            {({ field, form }) => (
                <div className="rc-recovery-field">
                    <span className="rc-recovery-prefix" aria-hidden="true">
                        RC
                    </span>
                    <input
                        {...field}
                        id={name}
                        type="text"
                        className="form-control rc-recovery-input"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        autoComplete="off"
                        disabled={disabled}
                        aria-label={label}
                        onChange={(event) => {
                            const digits = event.target.value.replace(/\D/g, '').slice(0, 6);
                            form.setFieldValue(name, digits);
                        }}
                        onBlur={() => form.setFieldTouched(name, true)}
                    />
                </div>
            )}
        </Field>
        <ErrorMessage name={name} component="div" className="text-danger error-message" />
    </FormGroup>
);

export default RecoveryCodeField;
